import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    // Test if env vars are loaded
    const hasClientId = !!process.env.GOOGLE_CLIENT_ID
    const hasClientSecret = !!process.env.GOOGLE_CLIENT_SECRET
    const hasAppUrl = !!process.env.NEXT_PUBLIC_APP_URL
    
    return NextResponse.json({
      success: true,
      config: {
        hasClientId,
        hasClientSecret,
        hasAppUrl,
        clientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0,
        appUrl: process.env.NEXT_PUBLIC_APP_URL || 'not set'
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
