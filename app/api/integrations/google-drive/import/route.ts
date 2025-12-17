import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { google } from 'googleapis'
import crypto from 'crypto'

const prisma = new PrismaClient()

// Decrypt token helper
function decryptToken(encrypted: string): string {
  const algorithm = 'aes-256-cbc'
  const key = Buffer.from(process.env.ENCRYPTION_KEY || 'your-32-char-secret-key-here!!', 'utf8')
  const parts = encrypted.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const encryptedText = parts[1]
  const decipher = crypto.createDecipheriv(algorithm, key, iv)
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

export async function POST(req: NextRequest) {
  try {
    // TODO: Get userId from session/auth
    const userId = req.headers.get('x-user-id') || 'demo-user'
    
    const integration = await prisma.integration.findUnique({
      where: {
        userId_provider: {
          userId,
          provider: 'GOOGLE_DRIVE'
        }
      }
    })

    if (!integration || !integration.encryptedTokens) {
      return NextResponse.json(
        { error: 'Google Drive not connected' },
        { status: 400 }
      )
    }

    const config = integration.config ? JSON.parse(integration.config) : {}
    if (!config.folderId) {
      return NextResponse.json(
        { error: 'No folder selected' },
        { status: 400 }
      )
    }

    // Decrypt tokens
    const tokens = JSON.parse(decryptToken(integration.encryptedTokens))
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )
    oauth2Client.setCredentials(tokens)

    // Create import job
    const importJob = await prisma.vaultImportJob.create({
      data: {
        integrationId: integration.id,
        provider: 'GOOGLE_DRIVE',
        sourcePath: config.folderId,
        status: 'PENDING'
      }
    })

    // Start import in background (in production, use a queue like Bull/BullMQ)
    processImport(importJob.id, oauth2Client, config.folderId).catch(console.error)

    return NextResponse.json({
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

async function processImport(jobId: string, auth: any, folderId: string) {
  try {
    await prisma.vaultImportJob.update({
      where: { id: jobId },
      data: { status: 'RUNNING', startedAt: new Date() }
    })

    const drive = google.drive({ version: 'v3', auth })

    // List files in folder (recursive)
    const files: any[] = []
    let pageToken: string | undefined

    do {
      const response = await drive.files.list({
        q: `'${folderId}' in parents and trashed=false`,
        fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime)',
        pageSize: 100,
        pageToken
      })

      if (response.data.files) {
        files.push(...response.data.files)
      }
      pageToken = response.data.nextPageToken || undefined
    } while (pageToken)

    // Filter for supported file types
    const supportedMimes = [
      'audio/wav', 'audio/mpeg', 'audio/flac', 'audio/x-aiff',
      'audio/mp4', 'application/pdf', 'text/plain'
    ]
    const audioFiles = files.filter(f => 
      supportedMimes.some(mime => f.mimeType?.includes(mime)) ||
      f.name?.match(/\.(wav|mp3|flac|aiff|m4a|flp|pdf|txt)$/i)
    )

    await prisma.vaultImportJob.update({
      where: { id: jobId },
      data: { totalFiles: audioFiles.length }
    })

    // Process each file
    let processed = 0
    let failed = 0

    for (const file of audioFiles) {
      try {
        // Check if already imported (dedup)
        const existing = await prisma.vaultAsset.findUnique({
          where: {
            sourceProvider_sourceFileId: {
              sourceProvider: 'GOOGLE_DRIVE',
              sourceFileId: file.id
            }
          }
        })

        if (existing) {
          processed++
          continue
        }

        // Download file (stream to storage in production)
        const response = await drive.files.get(
          { fileId: file.id, alt: 'media' },
          { responseType: 'stream' }
        )

        // TODO: Upload to your storage (S3/R2/etc) and get storageKey
        // For now, using a placeholder
        const storageKey = `imports/drive/${file.id}/${file.name}`

        // Create project version if needed
        // TODO: Get or create project for this import
        const projectId = 'demo-project'
        
        let version = await prisma.projectVersion.findFirst({
          where: {
            projectId,
            source: 'GOOGLE_DRIVE',
            label: `Drive Import ${new Date().toISOString().split('T')[0]}`
          }
        })

        if (!version) {
          version = await prisma.projectVersion.create({
            data: {
              projectId,
              label: `Drive Import ${new Date().toISOString().split('T')[0]}`,
              source: 'GOOGLE_DRIVE'
            }
          })
        }

        // Create vault asset
        await prisma.vaultAsset.create({
          data: {
            projectId,
            versionId: version.id,
            storageKey,
            fileName: file.name || 'Untitled',
            fileSize: parseInt(file.size || '0'),
            mimeType: file.mimeType,
            sourceProvider: 'GOOGLE_DRIVE',
            sourceFileId: file.id,
            sourceMetadata: JSON.stringify({
              modifiedTime: file.modifiedTime,
              driveId: file.id
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

    // Update integration last sync
    const job = await prisma.vaultImportJob.findUnique({
      where: { id: jobId },
      include: { integration: true }
    })

    if (job) {
      await prisma.integration.update({
        where: { id: job.integrationId },
        data: { lastSyncAt: new Date() }
      })
    }

  } catch (error) {
    console.error('Import job failed:', error)
    await prisma.vaultImportJob.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        finishedAt: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }
    })
  }
}
