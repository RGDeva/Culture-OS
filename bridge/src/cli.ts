#!/usr/bin/env node

import { Command } from 'commander'
import chalk from 'chalk'
import prompts from 'prompts'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { BridgeWatcher } from './watcher'

const CONFIG_DIR = path.join(os.homedir(), '.noculture')
const CONFIG_FILE = path.join(CONFIG_DIR, 'bridge-config.json')

interface BridgeConfig {
  apiBaseUrl: string
  deviceToken: string
}

const program = new Command()

program
  .name('noculture-bridge')
  .description('NoCulture Bridge - Auto-import FL Studio exports to Vault')
  .version('1.0.0')

program
  .command('init')
  .description('Initialize Bridge configuration')
  .action(async () => {
    console.log(chalk.green.bold('\n🎵 NoCulture Bridge Setup\n'))

    const response = await prompts([
      {
        type: 'text',
        name: 'apiBaseUrl',
        message: 'API Base URL:',
        initial: 'https://culture-os.vercel.app'
      },
      {
        type: 'text',
        name: 'deviceToken',
        message: 'Device Token (from /vault/integrations/fl-studio):',
        validate: (value: string) => value.length > 0 || 'Device token is required'
      }
    ])

    if (!response.apiBaseUrl || !response.deviceToken) {
      console.log(chalk.red('Setup cancelled'))
      process.exit(1)
    }

    // Create config directory
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true })
    }

    // Save config
    const config: BridgeConfig = {
      apiBaseUrl: response.apiBaseUrl,
      deviceToken: response.deviceToken
    }

    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2))
    console.log(chalk.green('\n✓ Configuration saved to ' + CONFIG_FILE))
    console.log(chalk.cyan('\nNext step: Run "noculture-bridge start --watch <path> --projectId <id>"\n'))
  })

program
  .command('start')
  .description('Start watching folder for exports')
  .requiredOption('--watch <path>', 'Folder path to watch')
  .requiredOption('--projectId <id>', 'Vault project ID')
  .option('--mode <mode>', 'Watch mode: local or drive-desktop', 'local')
  .action(async (options) => {
    // Load config
    if (!fs.existsSync(CONFIG_FILE)) {
      console.log(chalk.red('Error: Bridge not initialized. Run "noculture-bridge init" first.'))
      process.exit(1)
    }

    const config: BridgeConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'))

    // Validate watch path
    if (!fs.existsSync(options.watch)) {
      console.log(chalk.red(`Error: Watch path does not exist: ${options.watch}`))
      process.exit(1)
    }

    console.log(chalk.green.bold('\n🎵 NoCulture Bridge Started\n'))
    console.log(chalk.cyan(`Watching: ${options.watch}`))
    console.log(chalk.cyan(`Project ID: ${options.projectId}`))
    console.log(chalk.cyan(`Mode: ${options.mode}`))
    console.log(chalk.gray(`API: ${config.apiBaseUrl}\n`))

    // Start watcher
    const watcher = new BridgeWatcher({
      watchPath: options.watch,
      projectId: options.projectId,
      apiBaseUrl: config.apiBaseUrl,
      deviceToken: config.deviceToken,
      mode: options.mode
    })

    await watcher.start()

    // Keep process alive
    process.on('SIGINT', async () => {
      console.log(chalk.yellow('\n\nStopping Bridge...'))
      await watcher.stop()
      process.exit(0)
    })
  })

program
  .command('status')
  .description('Check Bridge connection status')
  .action(async () => {
    if (!fs.existsSync(CONFIG_FILE)) {
      console.log(chalk.red('Error: Bridge not initialized.'))
      process.exit(1)
    }

    const config: BridgeConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'))

    try {
      const response = await fetch(`${config.apiBaseUrl}/api/bridge/status`, {
        headers: {
          'Authorization': `Bearer ${config.deviceToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log(chalk.green('\n✓ Bridge Connected'))
        console.log(chalk.cyan(`Device: ${data.deviceName || 'Unknown'}`))
        if (data.lastImport) {
          console.log(chalk.cyan(`Last Import: ${new Date(data.lastImport).toLocaleString()}`))
        }
      } else {
        console.log(chalk.red('\n✗ Bridge Not Connected'))
      }
    } catch (error) {
      console.log(chalk.red('\n✗ Connection Error'))
      console.log(chalk.gray(error instanceof Error ? error.message : 'Unknown error'))
    }
  })

program.parse()
