import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    // TODO: Get userId from session/auth
    const userId = req.headers.get('x-user-id') || 'demo-user'
    
    // Find active bridge device for user
    const device = await prisma.bridgeDevice.findFirst({
      where: {
        userId,
        status: 'ACTIVE'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!device) {
      return NextResponse.json({
        connected: false
      })
    }

    // Check if device was seen recently (within last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const isConnected = device.lastSeenAt && device.lastSeenAt > oneHourAgo

    return NextResponse.json({
      connected: isConnected,
      deviceToken: device.deviceToken,
      deviceName: device.deviceName,
      lastImport: device.lastSeenAt?.toISOString()
    })
  } catch (error) {
    console.error('Error fetching bridge status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    )
  }
}
