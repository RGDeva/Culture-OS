import { NextResponse } from 'next/server'

export async function GET() {
  const cloudinaryConfigured = !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  )

  const cyaniteConfigured = !!(
    process.env.CYANITE_API_BASE &&
    process.env.CYANITE_INTEGRATION_ACCESS_TOKEN
  )

  return NextResponse.json({
    cloudinary: {
      configured: cloudinaryConfigured,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Not set',
      apiKey: process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Not set',
      apiSecret: process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Not set',
    },
    cyanite: {
      configured: cyaniteConfigured,
      apiBase: process.env.CYANITE_API_BASE ? '✅ Set' : '❌ Not set',
      token: process.env.CYANITE_INTEGRATION_ACCESS_TOKEN ? '✅ Set' : '❌ Not set',
      webhookSecret: process.env.CYANITE_WEBHOOK_SECRET ? '✅ Set' : '⚠️ Optional',
    },
    status: {
      cloudinaryReady: cloudinaryConfigured,
      cyaniteReady: cyaniteConfigured,
      fullIntegrationReady: cloudinaryConfigured && cyaniteConfigured,
      message: cloudinaryConfigured && cyaniteConfigured 
        ? '✅ All systems ready! Upload files to trigger AI analysis.'
        : cloudinaryConfigured 
        ? '⚠️ Cloudinary ready. Add Cyanite for AI analysis.'
        : '⚠️ Add Cloudinary for file storage and Cyanite for AI analysis.',
    },
  })
}
