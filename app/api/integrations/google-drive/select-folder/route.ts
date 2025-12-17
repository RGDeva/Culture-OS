import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id') || 'demo-user'
    const body = await req.json()
    const { folderId, folderName, projectId } = body

    if (!folderId || !projectId) {
      return NextResponse.json(
        { error: 'folderId and projectId are required' },
        { status: 400 }
      )
    }

    // Get integration
    const integration = await prisma.integration.findUnique({
      where: {
        userId_provider: {
          userId,
          provider: 'GOOGLE_DRIVE'
        }
      }
    })

    if (!integration) {
      return NextResponse.json(
        { error: 'Google Drive not connected' },
        { status: 400 }
      )
    }

    // Create or update sync config
    const syncConfig = await prisma.driveSyncConfig.upsert({
      where: {
        integrationId_projectId: {
          integrationId: integration.id,
          projectId
        }
      },
      create: {
        integrationId: integration.id,
        userId,
        projectId,
        driveFolderId: folderId,
        driveFolderName: folderName,
        enabled: true
      },
      update: {
        driveFolderId: folderId,
        driveFolderName: folderName,
        enabled: true
      }
    })

    return NextResponse.json({
      success: true,
      syncConfig
    })
  } catch (error) {
    console.error('Error selecting folder:', error)
    return NextResponse.json(
      { error: 'Failed to select folder' },
      { status: 500 }
    )
  }
}
