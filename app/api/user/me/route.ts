import { NextResponse } from 'next/server'
import { getPrivyClient } from '@/lib/privy'
import { prisma, isPrismaConfigured } from '@/lib/prisma'

// Helper function to create a new user
async function createUser(userId: string) {
  console.log(`[API] Creating new user: ${userId}`)
  try {
    return await prisma.user.create({
      data: {
        id: userId,
        email: null, // Use null for wallet users
        displayName: 'New User',
        artistAccountId: `artist_${userId}_${Date.now()}`,
        onboarded: false,
        socials: JSON.stringify({})
      }
    })
  } catch (err: any) {
    if (err.code === 'P2002') {
      // Unique constraint failed
      console.error('[API] Unique constraint error while creating user:', err.meta);
      throw new Error('A user with this ID, email, or artistAccountId already exists.');
    }
    throw err;
  }
}

// Helper to parse socials safely
function parseSocials(socialsString: string | null) {
  if (!socialsString) return {}
  try {
    return JSON.parse(socialsString)
  } catch (e) {
    console.error('Error parsing socials:', e)
    return {}
  }
}

export async function GET(req: Request) {
  // Check if Prisma is configured
  if (!isPrismaConfigured()) {
    return new NextResponse(JSON.stringify({
      error: 'Service Unavailable',
      message: 'Database not configured. Please run "npx prisma generate" and set up your database.'
    }), { status: 503 })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.warn('[API] No or invalid authorization header')
      return new NextResponse(JSON.stringify({ 
        error: 'Unauthorized',
        message: 'Missing or invalid authorization token' 
      }), { status: 401 })
    }

    // Verify the token
    const token = authHeader.split(' ')[1]
    const privy = getPrivyClient()
    
    let userId: string
    try {
      const verified = await privy.verifyAuthToken(token)
      userId = verified.userId
      console.log(`[API] Verified token for user: ${userId}`)
    } catch (error) {
      console.error('[API] Token verification failed:', error)
      return new NextResponse(JSON.stringify({ 
        error: 'Unauthorized',
        message: 'Invalid or expired token' 
      }), { status: 401 })
    }

    try {
      // Try to find the user
      let user = await prisma.user.findUnique({
        where: { id: userId }
      })

      // If user doesn't exist, create them
      if (!user) {
        console.log(`[API] User ${userId} not found, creating new user`)
        try {
          user = await createUser(userId)
        } catch (err: any) {
          console.error('[API] Error creating user:', err.message)
          return new NextResponse(JSON.stringify({
            error: 'User Creation Error',
            message: err.message || 'Failed to create user',
          }), { status: 500 })
        }
      }

      // Parse socials
      const socials = parseSocials(user.socials)

      return NextResponse.json({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        artistAccountId: user.artistAccountId,
        onboarded: user.onboarded,
        socials,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
    } catch (error) {
      console.error('[API] Database error:', error)
      return new NextResponse(JSON.stringify({
        error: 'Database Error',
        message: 'Failed to process user data'
      }), { status: 500 })
    }
  } catch (error) {
    console.error('[API] Unexpected error in /api/user/me:', error)
    return new NextResponse(JSON.stringify({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    }), { status: 500 })
  }
}

// PATCH: Update user profile and onboarding
export async function PATCH(req: Request) {
  // Check if Prisma is configured
  if (!isPrismaConfigured()) {
    return new NextResponse(JSON.stringify({
      error: 'Service Unavailable',
      message: 'Database not configured.'
    }), { status: 503 })
  }
  
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized', message: 'Missing or invalid authorization token' }), { status: 401 })
    }
    const token = authHeader.split(' ')[1]
    const privy = getPrivyClient()
    let userId: string
    try {
      const verified = await privy.verifyAuthToken(token)
      userId = verified.userId
    } catch (error) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized', message: 'Invalid or expired token' }), { status: 401 })
    }

    const body = await req.json()
    const updateData: any = {}
    
    // Handle direct fields
    if ('displayName' in body) updateData.displayName = body.displayName
    if ('onboarded' in body) updateData.onboarded = !!body.onboarded
    
    // Handle social fields
    const socials: any = {}
    if ('bio' in body) socials.bio = body.bio
    if ('image' in body) socials.image = body.image
    
    // Only update socials if we have social fields to update
    if (Object.keys(socials).length > 0) {
      updateData.socials = JSON.stringify(socials)
    }

    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      })
      return NextResponse.json({ success: true, user })
    } catch (error) {
      console.error('[API] PATCH /api/user/me error:', error)
      return new NextResponse(JSON.stringify({ error: 'Database Error', message: 'Failed to update user profile' }), { status: 500 })
    }
  } catch (error) {
    console.error('[API] PATCH /api/user/me unexpected error:', error)
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error', message: 'An unexpected error occurred' }), { status: 500 })
  }
}

export async function POST(req: Request) {
  // Check if Prisma is configured
  if (!isPrismaConfigured()) {
    return new NextResponse(JSON.stringify({
      error: 'Service Unavailable',
      message: 'Database not configured.'
    }), { status: 503 })
  }
  
  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new NextResponse(JSON.stringify({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization token'
      }), { status: 401 })
    }

    // Verify the token
    const token = authHeader.split(' ')[1]
    const privy = getPrivyClient()
    const { userId } = await privy.verifyAuthToken(token)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (existingUser) {
      return NextResponse.json({
        id: existingUser.id,
        email: existingUser.email,
        displayName: existingUser.displayName,
        artistAccountId: existingUser.artistAccountId,
        onboarded: existingUser.onboarded,
        socials: parseSocials(existingUser.socials),
        createdAt: existingUser.createdAt,
        updatedAt: existingUser.updatedAt,
      })
    }

    // Create new user
    const newUser = await createUser(userId)
    
    return NextResponse.json({
      id: newUser.id,
      email: newUser.email,
      displayName: newUser.displayName,
      artistAccountId: newUser.artistAccountId,
      onboarded: newUser.onboarded,
      socials: {},
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    }, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/user/me:', error)
    return new NextResponse(JSON.stringify({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Failed to create user'
    }), { status: 500 })
  }
}

export async function PUT(req: Request) {
  // Check if Prisma is configured
  if (!isPrismaConfigured()) {
    return new NextResponse(JSON.stringify({
      error: 'Service Unavailable',
      message: 'Database not configured.'
    }), { status: 503 })
  }
  
  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new NextResponse(JSON.stringify({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization token'
      }), { status: 401 })
    }

    // Verify the token
    const token = authHeader.split(' ')[1]
    const privy = getPrivyClient()
    const { userId } = await privy.verifyAuthToken(token)

    // Get the request body
    const { name, bio, image } = await req.json()
    
    // Get the existing user
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      return new NextResponse(JSON.stringify({
        error: 'Not Found',
        message: 'User not found'
      }), { status: 404 })
    }

    // Parse existing socials
    const currentSocials = parseSocials(existingUser.socials)
    
    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        displayName: name || existingUser.displayName,
        socials: JSON.stringify({
          ...currentSocials,
          bio: bio !== undefined ? bio : currentSocials.bio,
          image: image || currentSocials.image
        }),
        updatedAt: new Date()
      }
    })

    // Return the updated user
    return NextResponse.json({
      id: updatedUser.id,
      email: updatedUser.email,
      displayName: updatedUser.displayName,
      bio: parseSocials(updatedUser.socials).bio,
      image: parseSocials(updatedUser.socials).image,
      artistAccountId: updatedUser.artistAccountId,
      onboarded: updatedUser.onboarded,
      socials: parseSocials(updatedUser.socials),
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    })

  } catch (error) {
    console.error('Error in PUT /api/user/me:', error)
    return new NextResponse(JSON.stringify({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Failed to update user profile'
    }), { status: 500 })
  }
}
