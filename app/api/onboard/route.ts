import { NextResponse } from 'next/server'
import { getPrivyClient } from '@/lib/privy'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const privy = getPrivyClient()
    
    // Verify the token with Privy
    const { userId } = await privy.verifyAuthToken(token)
    
    // Parse request body
    const { displayName, bio, email, walletAddress, ...socials } = await req.json()

    // Create or update user in database
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {
        email,
        walletAddress,
        displayName,
        bio,
        socials: JSON.stringify(socials),
        onboarded: true,
      },
      create: {
        id: userId,
        email,
        walletAddress,
        displayName,
        bio,
        socials: JSON.stringify(socials),
        artistAccountId: `artist_${Date.now()}`,
        onboarded: true,
      },
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Onboarding error:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to complete onboarding',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500 }
    )
  }
}
