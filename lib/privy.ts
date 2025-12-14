import { PrivyClient } from '@privy-io/server-auth'

let privyClient: PrivyClient

export function getPrivyClient() {
  if (!privyClient) {
    if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID || !process.env.PRIVY_APP_SECRET) {
      throw new Error('Missing Privy environment variables')
    }
    
    privyClient = new PrivyClient(
      process.env.NEXT_PUBLIC_PRIVY_APP_ID,
      process.env.PRIVY_APP_SECRET
    )
  }
  return privyClient
}
