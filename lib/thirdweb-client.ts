// Frontend Thirdweb client configuration
import { createThirdwebClient } from "thirdweb"

export const thirdwebClient = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "3619854fcada720bde63920511b84d15",
})

// Chain configuration (Arbitrum Sepolia for testing)
export const CHAIN_ID = 421614 // Arbitrum Sepolia testnet
export const USDC_ADDRESS = "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d" // USDC on Arbitrum Sepolia
