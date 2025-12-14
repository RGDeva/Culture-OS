#!/usr/bin/env node

/**
 * Setup Checker
 * Verifies all required environment variables and services
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 NoCulture OS - Setup Checker\n')

const checks = []
let errors = 0
let warnings = 0

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local')
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!')
  console.log('   Create it by copying .env.example\n')
  process.exit(1)
}

// Read environment variables
require('dotenv').config({ path: envPath })

// Critical environment variables
const critical = {
  'DATABASE_URL': 'PostgreSQL database connection',
  'NEXT_PUBLIC_PRIVY_APP_ID': 'Privy authentication',
  'CLOUDINARY_CLOUD_NAME': 'File storage',
  'CLOUDINARY_API_KEY': 'File storage',
  'CLOUDINARY_API_SECRET': 'File storage',
}

// Optional but recommended
const recommended = {
  'OPENAI_API_KEY': 'AI assistant (GPT-4)',
  'STRIPE_SECRET_KEY': 'Payment processing',
  'PYTHON_WORKER_URL': 'Audio analysis worker',
}

// Optional integrations
const optional = {
  'GROQ_API_KEY': 'Faster AI assistant',
  'HUGGINGFACE_API_KEY': 'ML models',
  'STRIPE_WEBHOOK_SECRET': 'Payment webhooks',
  'DREAMSTER_API_KEY': 'Dreamster integration',
  'TAKERECORD_API_KEY': 'TakeRecord integration',
  'WAVEWARZ_API_KEY': 'WaveWarZ integration',
}

console.log('📋 Critical Environment Variables:\n')
Object.entries(critical).forEach(([key, desc]) => {
  if (process.env[key]) {
    console.log(`✅ ${key}`)
    console.log(`   ${desc}`)
  } else {
    console.log(`❌ ${key} - MISSING`)
    console.log(`   ${desc}`)
    errors++
  }
  console.log()
})

console.log('📋 Recommended Environment Variables:\n')
Object.entries(recommended).forEach(([key, desc]) => {
  if (process.env[key]) {
    console.log(`✅ ${key}`)
    console.log(`   ${desc}`)
  } else {
    console.log(`⚠️  ${key} - Not set`)
    console.log(`   ${desc}`)
    warnings++
  }
  console.log()
})

console.log('📋 Optional Integrations:\n')
Object.entries(optional).forEach(([key, desc]) => {
  if (process.env[key]) {
    console.log(`✅ ${key}`)
  } else {
    console.log(`⚪ ${key} - Not set (${desc})`)
  }
})

console.log('\n' + '='.repeat(50))
console.log('📊 Summary:\n')

if (errors > 0) {
  console.log(`❌ ${errors} critical variable(s) missing`)
  console.log('   Fix these before running the app\n')
}

if (warnings > 0) {
  console.log(`⚠️  ${warnings} recommended variable(s) not set`)
  console.log('   Some features will be limited\n')
}

if (errors === 0 && warnings === 0) {
  console.log('✅ All critical and recommended variables are set!')
  console.log('🚀 Your platform is ready to run!\n')
}

if (errors === 0 && warnings > 0) {
  console.log('✅ All critical variables are set!')
  console.log('⚠️  Some recommended features are disabled\n')
}

console.log('Next steps:')
console.log('1. npm run dev (start Next.js)')
console.log('2. cd python-worker-enhanced && python main.py (start worker)')
console.log('3. Visit http://localhost:3001\n')

process.exit(errors > 0 ? 1 : 0)
