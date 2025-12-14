/**
 * zkp2p v3 On-Ramp Integration
 * Server-side client for zkp2p on-ramp API
 * Docs: https://docs.zkp2p.xyz/developer/developer/api/v3/onramp
 */

// ============================================================================
// Types
// ============================================================================

export type OnrampStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'EXPIRED'

export interface Zkp2pOnrampSession {
  id: string
  status: OnrampStatus
  userWallet: string
  amountUsd: number
  amountReceivedUsdc?: string
  txHash?: string
  paymentInstructions?: {
    method: string
    recipientId: string
    amount: string
    memo?: string
    redirectUrl?: string
  }
  createdAt: string
  updatedAt: string
}

export interface CreateOnrampSessionParams {
  userWalletAddress: string
  amountUsd: number
  memo?: string
}

export interface Zkp2pOnrampSessionStatus {
  status: OnrampStatus
  txHash?: string
  amountReceivedUsdc?: string
  updatedAt: string
}

// ============================================================================
// Configuration
// ============================================================================

const ZKP2P_CONFIG = {
  apiKey: process.env.ZKP2P_API_KEY || '',
  environment: (process.env.ZKP2P_ONRAMP_ENV || 'sandbox') as 'sandbox' | 'production',
  baseChainId: process.env.ZKP2P_BASE_CHAIN_ID || '84532', // Base Sepolia default
  
  get baseUrl() {
    return this.environment === 'production'
      ? 'https://api.zkp2p.xyz/v3'
      : 'https://sandbox-api.zkp2p.xyz/v3'
  },
  
  get usdcAddress() {
    // Base Mainnet (8453) vs Base Sepolia (84532)
    return this.baseChainId === '8453'
      ? '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' // Base USDC
      : '0x036CbD53842c5426634e7929541eC2318f3dCF7e' // Base Sepolia USDC
  }
}

// ============================================================================
// API Client
// ============================================================================

class Zkp2pApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public responseBody?: any
  ) {
    super(message)
    this.name = 'Zkp2pApiError'
  }
}

/**
 * Make authenticated request to zkp2p API
 */
async function zkp2pRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (!ZKP2P_CONFIG.apiKey) {
    throw new Zkp2pApiError('ZKP2P_API_KEY not configured')
  }

  const url = `${ZKP2P_CONFIG.baseUrl}${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ZKP2P_CONFIG.apiKey}`,
      ...options.headers,
    },
  })

  const responseBody = await response.json().catch(() => null)

  if (!response.ok) {
    console.error('[ZKP2P_API] Error response:', {
      status: response.status,
      statusText: response.statusText,
      body: responseBody,
    })
    
    throw new Zkp2pApiError(
      responseBody?.error || responseBody?.message || `API request failed: ${response.statusText}`,
      response.status,
      responseBody
    )
  }

  return responseBody as T
}

// ============================================================================
// Public API Functions
// ============================================================================

/**
 * Create a new on-ramp session
 * User will receive USDC on Base to their wallet after completing payment
 */
export async function createOnrampSession(
  params: CreateOnrampSessionParams
): Promise<Zkp2pOnrampSession> {
  const { userWalletAddress, amountUsd, memo } = params

  // Validate amount
  if (amountUsd < 1 || amountUsd > 5000) {
    throw new Zkp2pApiError('Amount must be between $1 and $5000')
  }

  console.log('[ZKP2P] Creating on-ramp session:', {
    wallet: userWalletAddress,
    amount: amountUsd,
    chainId: ZKP2P_CONFIG.baseChainId,
    environment: ZKP2P_CONFIG.environment,
  })

  try {
    const response = await zkp2pRequest<any>('/onramp/sessions', {
      method: 'POST',
      body: JSON.stringify({
        recipientAddress: userWalletAddress,
        tokenAddress: ZKP2P_CONFIG.usdcAddress,
        chainId: ZKP2P_CONFIG.baseChainId,
        amountUsd: amountUsd.toString(),
        memo: memo || undefined,
      }),
    })

    // Map zkp2p response to our internal format
    const session: Zkp2pOnrampSession = {
      id: response.sessionId || response.id,
      status: mapZkp2pStatus(response.status),
      userWallet: userWalletAddress,
      amountUsd,
      paymentInstructions: response.paymentInstructions ? {
        method: response.paymentInstructions.method || 'bank_transfer',
        recipientId: response.paymentInstructions.recipientId || response.paymentInstructions.accountId,
        amount: response.paymentInstructions.amount || amountUsd.toString(),
        memo: response.paymentInstructions.memo || response.paymentInstructions.reference,
        redirectUrl: response.paymentInstructions.redirectUrl || response.redirectUrl,
      } : undefined,
      createdAt: response.createdAt || new Date().toISOString(),
      updatedAt: response.updatedAt || new Date().toISOString(),
    }

    console.log('[ZKP2P] Session created:', session.id)
    return session
  } catch (error) {
    if (error instanceof Zkp2pApiError) {
      throw error
    }
    console.error('[ZKP2P] Unexpected error creating session:', error)
    throw new Zkp2pApiError('Failed to create on-ramp session')
  }
}

/**
 * Get the status of an existing on-ramp session
 */
export async function getOnrampSessionStatus(
  sessionId: string
): Promise<Zkp2pOnrampSessionStatus> {
  console.log('[ZKP2P] Fetching session status:', sessionId)

  try {
    const response = await zkp2pRequest<any>(`/onramp/sessions/${sessionId}`)

    const status: Zkp2pOnrampSessionStatus = {
      status: mapZkp2pStatus(response.status),
      txHash: response.txHash || response.transactionHash,
      amountReceivedUsdc: response.amountReceived || response.amountReceivedUsdc,
      updatedAt: response.updatedAt || new Date().toISOString(),
    }

    return status
  } catch (error) {
    if (error instanceof Zkp2pApiError) {
      throw error
    }
    console.error('[ZKP2P] Unexpected error fetching status:', error)
    throw new Zkp2pApiError('Failed to fetch session status')
  }
}

/**
 * Map zkp2p status to our internal status type
 */
function mapZkp2pStatus(zkp2pStatus: string): OnrampStatus {
  const statusMap: Record<string, OnrampStatus> = {
    'pending': 'PENDING',
    'processing': 'PENDING',
    'awaiting_payment': 'PENDING',
    'completed': 'COMPLETED',
    'success': 'COMPLETED',
    'failed': 'FAILED',
    'cancelled': 'FAILED',
    'expired': 'EXPIRED',
  }

  return statusMap[zkp2pStatus.toLowerCase()] || 'PENDING'
}

// ============================================================================
// Legacy Functions (kept for backwards compatibility)
// ============================================================================

/**
 * Get zkp2p top-up URL for a wallet address
 * @deprecated Use createOnrampSession instead
 */
export function getZkp2pTopUpUrl(walletAddress: string | undefined | null): string | null {
  const base = process.env.NEXT_PUBLIC_ZKP2P_BASE_URL
  const enabled = process.env.NEXT_PUBLIC_ENABLE_ZKP2P_TOPUP === 'true'
  
  if (!enabled || !base || !walletAddress) {
    return null
  }
  
  try {
    const url = new URL(base)
    url.searchParams.set('wallet', walletAddress)
    return url.toString()
  } catch (error) {
    console.error('[ZKP2P] Invalid base URL:', error)
    return null
  }
}

/**
 * Check if zkp2p top-up is enabled
 */
export function isZkp2pEnabled(): boolean {
  return !!ZKP2P_CONFIG.apiKey && ZKP2P_CONFIG.apiKey.length > 0
}
