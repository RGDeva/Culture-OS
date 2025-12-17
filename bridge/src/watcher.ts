import chokidar from 'chokidar'
import chalk from 'chalk'
import ora from 'ora'
import path from 'path'
import fs from 'fs'
import axios from 'axios'
import FormData from 'form-data'
import ffmpeg from 'fluent-ffmpeg'

interface WatcherConfig {
  watchPath: string
  projectId: string
  apiBaseUrl: string
  deviceToken: string
  mode: string
}

interface AudioMetadata {
  duration?: number
  sampleRate?: number
  bitrate?: number
  channels?: number
  format?: string
}

export class BridgeWatcher {
  private config: WatcherConfig
  private watcher: chokidar.FSWatcher | null = null
  private processingFiles = new Set<string>()
  private debounceTimers = new Map<string, NodeJS.Timeout>()

  constructor(config: WatcherConfig) {
    this.config = config
  }

  async start() {
    console.log(chalk.green('🔍 Starting file watcher...\n'))

    this.watcher = chokidar.watch(this.config.watchPath, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      }
    })

    this.watcher
      .on('add', (filePath) => this.handleFileAdded(filePath))
      .on('change', (filePath) => this.handleFileChanged(filePath))
      .on('error', (error) => console.error(chalk.red('Watcher error:'), error))

    console.log(chalk.green('✓ Watcher active. Waiting for new files...\n'))
  }

  async stop() {
    if (this.watcher) {
      await this.watcher.close()
      this.watcher = null
    }
  }

  private async handleFileAdded(filePath: string) {
    const ext = path.extname(filePath).toLowerCase()
    const supportedExts = ['.wav', '.mp3', '.flac', '.aiff', '.m4a', '.flp']

    if (!supportedExts.includes(ext)) {
      return
    }

    console.log(chalk.cyan(`\n📁 New file detected: ${path.basename(filePath)}`))

    // Debounce to ensure file write is complete
    if (this.debounceTimers.has(filePath)) {
      clearTimeout(this.debounceTimers.get(filePath)!)
    }

    const timer = setTimeout(() => {
      this.processFile(filePath)
      this.debounceTimers.delete(filePath)
    }, 3000)

    this.debounceTimers.set(filePath, timer)
  }

  private handleFileChanged(filePath: string) {
    // Handle file changes if needed
  }

  private async processFile(filePath: string) {
    if (this.processingFiles.has(filePath)) {
      return
    }

    this.processingFiles.add(filePath)
    const spinner = ora(`Processing ${path.basename(filePath)}...`).start()

    try {
      // Extract metadata
      const metadata = await this.extractMetadata(filePath)
      spinner.text = 'Metadata extracted'

      // Create version
      const versionLabel = `FL Export ${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString()}`
      const version = await this.createVersion(versionLabel)
      spinner.text = 'Version created'

      // Get signed upload URL
      const uploadUrl = await this.getSignedUploadUrl(path.basename(filePath))
      spinner.text = 'Upload URL obtained'

      // Upload file
      await this.uploadFile(filePath, uploadUrl)
      spinner.text = 'File uploaded'

      // Register asset
      await this.registerAsset({
        versionId: version.id,
        fileName: path.basename(filePath),
        fileSize: fs.statSync(filePath).size,
        metadata,
        storageKey: uploadUrl.key
      })

      spinner.succeed(chalk.green(`✓ ${path.basename(filePath)} imported successfully`))
    } catch (error) {
      spinner.fail(chalk.red(`✗ Failed to process ${path.basename(filePath)}`))
      console.error(chalk.gray(error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      this.processingFiles.delete(filePath)
    }
  }

  private async extractMetadata(filePath: string): Promise<AudioMetadata> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err)
          return
        }

        const audioStream = metadata.streams.find(s => s.codec_type === 'audio')
        
        resolve({
          duration: metadata.format.duration,
          sampleRate: audioStream?.sample_rate ? parseInt(audioStream.sample_rate as any) : undefined,
          bitrate: metadata.format.bit_rate ? parseInt(metadata.format.bit_rate as any) : undefined,
          channels: audioStream?.channels,
          format: metadata.format.format_name
        })
      })
    })
  }

  private async createVersion(label: string): Promise<{ id: string }> {
    const response = await axios.post(
      `${this.config.apiBaseUrl}/api/projects/${this.config.projectId}/versions`,
      {
        label,
        description: 'Auto-imported from FL Studio via Bridge',
        source: 'FL_EXPORT'
      },
      {
        headers: {
          'Authorization': `Bearer ${this.config.deviceToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    return response.data
  }

  private async getSignedUploadUrl(fileName: string): Promise<{ url: string; key: string }> {
    const response = await axios.post(
      `${this.config.apiBaseUrl}/api/uploads/sign`,
      {
        fileName,
        contentType: this.getContentType(fileName)
      },
      {
        headers: {
          'Authorization': `Bearer ${this.config.deviceToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    return response.data
  }

  private async uploadFile(filePath: string, uploadUrl: { url: string; key: string }) {
    const fileStream = fs.createReadStream(filePath)
    const stats = fs.statSync(filePath)

    await axios.put(uploadUrl.url, fileStream, {
      headers: {
        'Content-Type': this.getContentType(filePath),
        'Content-Length': stats.size
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    })
  }

  private async registerAsset(data: {
    versionId: string
    fileName: string
    fileSize: number
    metadata: AudioMetadata
    storageKey: string
  }) {
    await axios.post(
      `${this.config.apiBaseUrl}/api/projects/${this.config.projectId}/versions/${data.versionId}/assets`,
      {
        fileName: data.fileName,
        fileSize: data.fileSize,
        storageKey: data.storageKey,
        sourceProvider: 'FL_EXPORT',
        duration: data.metadata.duration,
        sampleRate: data.metadata.sampleRate,
        bitrate: data.metadata.bitrate,
        channels: data.metadata.channels,
        format: data.metadata.format,
        metadata: JSON.stringify(data.metadata)
      },
      {
        headers: {
          'Authorization': `Bearer ${this.config.deviceToken}`,
          'Content-Type': 'application/json'
        }
      }
    )
  }

  private getContentType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase()
    const mimeTypes: Record<string, string> = {
      '.wav': 'audio/wav',
      '.mp3': 'audio/mpeg',
      '.flac': 'audio/flac',
      '.aiff': 'audio/x-aiff',
      '.m4a': 'audio/mp4',
      '.flp': 'application/octet-stream'
    }
    return mimeTypes[ext] || 'application/octet-stream'
  }
}
