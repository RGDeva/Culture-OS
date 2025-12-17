import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id') || 'demo-user'
    const projectId = req.nextUrl.searchParams.get('projectId')
    
    const integration = await prisma.integration.findUnique({
      where: {
        userId_provider: {
          userId,
          provider: 'GOOGLE_DRIVE'
        }
      },
      include: {
        syncConfigs: projectId ? {
          where: { projectId }
        } : true
      }
    })

    if (!integration) {
      return NextResponse.json({ connected: false })
    }

    const syncConfig = projectId && integration.syncConfigs.length > 0 
      ? integration.syncConfigs[0] 
      : null

    return NextResponse.json({
      connected: true,
      email: integration.email,
      status: integration.status,
      syncConfig: syncConfig ? {
        folderId: syncConfig.driveFolderId,
        folderName: syncConfig.driveFolderName,
        enabled: syncConfig.enabled,
        lastSyncAt: syncConfig.lastSyncAt?.toISOString()
      } : null
    })
  } catch (error) {
    console.error('Error fetching integration status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    )
  }
}
