# NoCulture Bridge

Auto-import FL Studio exports to your NoCulture Vault.

## What is Bridge?

NoCulture Bridge is a lightweight local application that watches your FL Studio export folder and automatically uploads new files to your Vault. No manual uploads, no cloud processing - everything runs on your computer.

## Installation

### Prerequisites
- Node.js 18+ installed
- FFmpeg installed (for audio metadata extraction)

### Install FFmpeg

**Windows:**
```bash
# Using Chocolatey
choco install ffmpeg

# Or download from https://ffmpeg.org/download.html
```

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt-get install ffmpeg  # Debian/Ubuntu
sudo yum install ffmpeg      # CentOS/RHEL
```

### Install Bridge

```bash
npm install -g @noculture/bridge
```

Or build from source:

```bash
cd bridge
npm install
npm run build
npm link
```

## Setup

### 1. Generate Device Token

1. Go to https://culture-os.vercel.app/vault/integrations/fl-studio
2. Click "Generate Token"
3. Copy the device token

### 2. Initialize Bridge

```bash
noculture-bridge init
```

You'll be prompted for:
- **API Base URL**: `https://culture-os.vercel.app` (or your custom domain)
- **Device Token**: Paste the token from step 1

Configuration is saved to `~/.noculture/bridge-config.json`

### 3. Start Watching

```bash
noculture-bridge start --watch "C:\NoCulture\Exports" --projectId YOUR_PROJECT_ID
```

**Options:**
- `--watch <path>`: Folder to watch for new files (required)
- `--projectId <id>`: Vault project ID to import into (required)
- `--mode <mode>`: Watch mode - `local` or `drive-desktop` (default: `local`)

### 4. Export from FL Studio

In FL Studio:
1. File → Export → Wave file
2. Choose your watched export folder
3. Click Export
4. Bridge will automatically detect and upload the file!

## How It Works

1. **File Detection**: Bridge watches your export folder using `chokidar`
2. **Debouncing**: Waits for file write to complete (3 seconds after last change)
3. **Metadata Extraction**: Uses `ffprobe` to extract audio metadata (duration, sample rate, bitrate, channels)
4. **Version Creation**: Creates a new Version in your Vault project
5. **Secure Upload**: Gets a signed upload URL and uploads the file
6. **Asset Registration**: Registers the asset with metadata in your Vault

## Supported File Types

- `.wav` - WAV audio
- `.mp3` - MP3 audio
- `.flac` - FLAC audio
- `.aiff` - AIFF audio
- `.m4a` - M4A/AAC audio
- `.flp` - FL Studio project files

## Commands

### Check Status

```bash
noculture-bridge status
```

Shows connection status and last import time.

### Stop Bridge

Press `Ctrl+C` in the terminal running Bridge.

## Troubleshooting

### "Bridge not initialized"
Run `noculture-bridge init` first.

### "Watch path does not exist"
Make sure the folder exists before starting Bridge.

### "FFmpeg not found"
Install FFmpeg (see Installation section above).

### Files not importing
1. Check that Bridge is running
2. Verify the file type is supported
3. Check console output for errors
4. Ensure device token is valid

### Revoke Token
Go to your account settings and revoke the device token. Generate a new one and run `noculture-bridge init` again.

## Security

- Device tokens are stored locally in `~/.noculture/bridge-config.json`
- Tokens can be revoked anytime from your account
- All uploads use signed URLs with expiration
- No files are stored on Bridge servers - direct upload to your storage

## Development

```bash
cd bridge
npm install
npm run dev -- start --watch "./test-exports" --projectId test-project
```

## License

MIT

## Support

For issues or questions:
- GitHub: https://github.com/noculture/bridge
- Discord: https://discord.gg/noculture
- Email: support@noculture.com
