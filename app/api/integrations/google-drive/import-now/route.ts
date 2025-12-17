import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { PrismaClient } from '@prisma/client'
import { decrypt } from '@/lib/encryption'
import fs from 'fs'
import path from 'path'
import { Readable } from 'stream'

const prisma = new PrismaClient()

// Supported file types
const SUPPORTED_MIMES = [
  'audio/wav', 'audio/mpeg', 'audio/flac', 'audio/x-aiff', 'audio/aiff',
  'audio/mp4', 'audio/x-m4a', 'application/pdf', 'text/plain'
]

const SUPPORTED_EXTENSIONS = ['.wav', '.mp3', '.flac', '.aiff', '.m4a', '.flp', '.pdf', '.txt']

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id') || 'demo-user'
    const body = await req.json()
    const { projectId } = body

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
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

    // Get sync config
    const syncConfig = await prisma.driveSyncConfig.findUnique({
      where: {
        integrationId_projectId: {
          integrationId: integration.id,
          projectId
        }
      }
    })

    if (!syncConfig) {
      return NextResponse.json(
        { error: 'No folder selected for this project' },
        { status: 400 }
      )
    }

    // Create import job
    const importJob = await prisma.vaultImportJob.create({
      data: {
        integrationId: integration.id,
        projectId,
        provider: 'GOOGLE_DRIVE',
        sourcePath: syncConfig.driveFolderId,
        status: 'PENDING'
      }
    })

    // Start import in background
    processImport(importJob.id, integration, syncConfig).catch(err => {
      console.error('Import job failed:', err)
      prisma.vaultImportJob.update({
        where: { id: importJob.id },
        data: {
          status: 'FAILED',
          errorMessage: err.message,
          finishedAt: new Date()
        }
      }).catch(console.error)
    })

    return NextResponse.json({
      success: true,
      jobId: importJob.id,
      message: 'Import started'
    })
  } catch (error) {
    console.error('Error starting import:', error)
    return NextResponse.json(
      { error: 'Failed to start import' },
      { status: 500 }
    )
  }
}

async function processImport(
  jobId: string,
  integration: any,
  syncConfig: any
) {
  try {
    await prisma.vaultImportJob.update({
      where: { id: jobId },
      data: { status: 'RUNNING', startedAt: new Date() }
    })

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

    const drive = google.drive({ version: 'v3', auth: oauth2Client })

    // List files in folder
    const files: any[] = []
    let pageToken: string | undefined

    do {
      const response = await drive.files.list({
        q: `'${syncConfig.driveFolderId}' in parents and trashed=false`,
        fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime, md5Checksum)',
        pageSize: 100,
        pageToken
      })

      if (response.data.files) {
        files.push(...response.data.files)
      }
      pageToken = response.data.nextPageToken || undefined
    } while (pageToken)

    // Filter for supported files
    const supportedFiles = files.filter(f => {
      const hasValidMime = SUPPORTED_MIMES.some(mime => f.mimeType?.includes(mime))
      const hasValidExt = SUPPORTED_EXTENSIONS.some(ext => f.name?.toLowerCase().endsWith(ext))
      return hasValidMime || hasValidExt
    })

    await prisma.vaultImportJob.update({
      where: { id: jobId },
      data: { totalFiles: supportedFiles.length }
    })

    // Create project version
    const timestamp = new Date().toISOString().split('T')[0]
    const version = await prisma.projectVersion.create({
      data: {
        projectId: syncConfig.projectId,
        label: `Drive Import — ${timestamp}`,
        description: `Imported from Google Drive folder: ${syncConfig.driveFolderName || 'Untitled'}`,
        source: 'GOOGLE_DRIVE'
      }
    })

    let processed = 0
    let failed = 0

    // Process each file
    for (const file of supportedFiles) {
      try {
        // Check for duplicate (dedup by fileId + modifiedTime)
        const sourceFileRevision = file.modifiedTime || file.md5Checksum || Date.now().toString()
        
        const existing = await prisma.vaultAsset.findUnique({
          where: {
            sourceProvider_sourceFileId_sourceFileRevision: {
              sourceProvider: 'GOOGLE_DRIVE',
              sourceFileId: file.id!,
              sourceFileRevision
            }
          }
        })

        if (existing) {
          console.log(`Skipping duplicate file: ${file.name}`)
          processed++
          continue
        }

        // Download file to local storage (for MVP - in production use S3/R2)
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'drive')
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true })
        }

        const fileName = `${file.id}_${file.name}`
        const localPath = path.join(uploadsDir, fileName)
        const storageKey = `uploads/drive/${fileName}`

        // Stream download
        const response = await drive.files.get(
          { fileId: file.id!, alt: 'media' },
          { responseType: 'stream' }
        )

        await new Promise((resolve, reject) => {
          const dest = fs.createWriteStream(localPath)
          response.data
            .on('end', resolve)
            .on('error', reject)
            .pipe(dest)
        })

        // Create vault asset
        await prisma.vaultAsset.create({
          data: {
            projectId: syncConfig.projectId,
            versionId: version.id,
            storageKey,
            fileName: file.name || 'Untitled',
            fileSize: parseInt(file.size || '0'),
            mimeType: file.mimeType,
            sourceProvider: 'GOOGLE_DRIVE',
            sourceFileId: file.id,
            sourceFileRevision,
            sourceMetadata: JSON.stringify({
              modifiedTime: file.modifiedTime,
              md5Checksum: file.md5Checksum,
              driveFileId: file.id
            }),
            importJobId: jobId
          }
        })

        processed++
      } catch (error) {
        console.error(`Failed to import file ${file.name}:`, error)
        failed++
      }

      await prisma.vaultImportJob.update({
        where: { id: jobId },
        data: { processedFiles: processed, failedFiles: failed }
      })
    }

    // Complete job
    await prisma.vaultImportJob.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        finishedAt: new Date()
      }
    })

    // Update sync config
    await prisma.driveSyncConfig.update({
      where: { id: syncConfig.id },
      data: { lastSyncAt: new Date() }
    })

  } catch (error) {
    console.error('Import processing failed:', error)
    throw error
  }
}
