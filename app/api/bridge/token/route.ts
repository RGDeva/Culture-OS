import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    // TODO: Get userId from session/auth
    // For now, using a placeholder - integrate with your Privy auth
    const userId = req.headers.get('x-user-id') || 'demo-user'
    
    const body = await req.json()
    const { deviceName } = body

    // Generate secure device token
    const deviceToken = crypto.randomBytes(32).toString('hex')

    // Create bridge device record
    const device = await prisma.bridgeDevice.create({
      data: {
        userId,
        deviceToken,
        deviceName: deviceName || 'NoCulture Bridge',
        status: 'ACTIVE',
        lastSeenAt: new Date()
      }
    })

    return NextResponse.json({
      deviceToken: device.deviceToken,
      deviceId: device.id,
      message: 'Device token generated successfully'
    })
  } catch (error) {
    console.error('Error generating bridge token:', error)
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    )
  }
}
