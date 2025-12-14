/**
 * Thirdweb server-side configuration for x402 payments on Base Sepolia
 * Used by backend API routes to process crypto payments
 */
import { createThirdwebClient } from "thirdweb"
import { facilitator } from "thirdweb/x402"
import { baseSepolia } from "thirdweb/chains"

// Server wallet address
const serverWalletAddress = process.env.THIRDWEB_SERVER_WALLET_ADDRESS || "0x7E07CB64903CC9a9B2B473C2dC859807e24f9a7e"

// Create Thirdweb client with secret key
export const thirdwebClient = createThirdwebClient({ 
  secretKey: process.env.THIRDWEB_SECRET_KEY || "fmi051dHYbnFOeQokwhVRz8nF5-msd3JwEVyu6bG-tMQtBTwejluqIYmFPI1CkrHLxS-u8F3yTmwjgx_7zQmWA"
})

// x402 Facilitator - handles payment settlement
export const thirdwebX402Facilitator = facilitator({
  client: thirdwebClient,
  serverWalletAddress: serverWalletAddress,
})

// Network configuration - Base Sepolia testnet
export const NETWORK = baseSepolia
export const chain = baseSepolia // Export as 'chain' for compatibility

// Export for compatibility
export const SERVER_WALLET_ADDRESS = serverWalletAddress
export const x402Facilitator = thirdwebX402Facilitator
