import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { PrismaClient } from '@prisma/client'
import { encrypt } from '@/lib/encryption'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code || !state) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/integrations/google-drive?error=missing_params`)
    }

    // Decode state to get userId
    const { userId } = JSON.parse(Buffer.from(state, 'base64').toString('utf8'))

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/integrations/google-drive/callback`
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    )

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // Get user email
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
    const userInfo = await oauth2.userinfo.get()

    // Encrypt tokens separately
    const accessTokenEncrypted = tokens.access_token ? encrypt(tokens.access_token) : null
    const refreshTokenEncrypted = tokens.refresh_token ? encrypt(tokens.refresh_token) : null
    
    // Calculate expiry
    const expiresAt = tokens.expiry_date ? new Date(tokens.expiry_date) : null

    // Store integration
    await prisma.integration.upsert({
      where: {
        userId_provider: {
          userId,
          provider: 'GOOGLE_DRIVE'
        }
      },
      create: {
        userId,
        provider: 'GOOGLE_DRIVE',
        accessTokenEncrypted,
        refreshTokenEncrypted,
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        expiresAt,
        email: userInfo.data.email || undefined,
        status: 'ACTIVE'
      },
      update: {
        accessTokenEncrypted,
        refreshTokenEncrypted,
        expiresAt,
        email: userInfo.data.email || undefined,
        status: 'ACTIVE'
      }
    })

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/integrations/google-drive?success=true`)
  } catch (error) {
    console.error('Error in OAuth callback:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/integrations/google-drive?error=oauth_failed`)
  }
}
