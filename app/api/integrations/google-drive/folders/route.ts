import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { PrismaClient } from '@prisma/client'
import { decrypt } from '@/lib/encryption'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id') || 'demo-user'
    
    // Get integration
    const integration = await prisma.integration.findUnique({
      where: {
        userId_provider: {
          userId,
          provider: 'GOOGLE_DRIVE'
        }
      }
    })

    if (!integration || !integration.accessTokenEncrypted) {
      return NextResponse.json(
        { error: 'Google Drive not connected' },
        { status: 400 }
      )
    }

    // Decrypt tokens
    const accessToken = decrypt(integration.accessTokenEncrypted)
    const refreshToken = integration.refreshTokenEncrypted ? decrypt(integration.refreshTokenEncrypted) : null

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken || undefined,
      expiry_date: integration.expiresAt?.getTime()
    })

    // List folders
    const drive = google.drive({ version: 'v3', auth: oauth2Client })
    
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
      fields: 'files(id, name, modifiedTime)',
      pageSize: 100,
      orderBy: 'name'
    })

    const folders = response.data.files || []

    return NextResponse.json({ folders })
  } catch (error) {
    console.error('Error listing folders:', error)
    return NextResponse.json(
      { error: 'Failed to list folders' },
      { status: 500 }
    )
  }
}
