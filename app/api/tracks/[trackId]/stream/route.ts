import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createReadStream } from 'fs'
import { stat } from 'fs/promises'
import { join } from 'path'
import { isX402Enabled, createPaymentChallenge, verifyPayment } from '@/lib/cdp/x402Service'

const prisma = new PrismaClient()

export async function GET(
  req: NextRequest,
  { params }: { params: { trackId: string } }
) {
  try {
    const { trackId } = params
    const userId = req.headers.get('x-user-id') || 'demo-user'

    // Get track/work from database
    const track = await prisma.work.findUnique({
      where: { id: trackId }
    })

    if (!track) {
      return NextResponse.json(
        { error: 'Track not found' },
        { status: 404 }
      )
    }

    // Check if track requires payment (pay-per-play)
    if (isX402Enabled()) {
      // Check for x402 product for this track
      const product = await prisma.x402Product.findUnique({
        where: {
          type_refId: {
            type: 'TRACK_STREAM',
            refId: trackId
          }
        }
      })

      if (product) {
        // Track has pay-per-play enabled
        // Check if user has already paid
        const existingPayment = await prisma.x402Transaction.findFirst({
          where: {
            trackId,
            payer: userId,
            status: 'COMPLETED'
          }
        })

        if (!existingPayment) {
          // User hasn't paid - check for payment authorization
          const paymentAuth = req.headers.get('x-payment-authorization')
          
          if (!paymentAuth) {
            // No payment - return 402 Payment Required
            const challenge = createPaymentChallenge(product.id, product.priceCents)

            return NextResponse.json(
              {
                error: 'Payment required',
                payment: {
                  required: true,
                  ...challenge,
                  message: 'Pay to stream this track'
                }
              },
              { 
                status: 402,
                headers: {
                  'X-Payment-Required': 'true',
                  'X-Payment-Amount': challenge.amount,
                  'X-Payment-Currency': challenge.currency,
                  'X-Payment-Network': challenge.network,
                  'X-Payment-Recipient': challenge.recipient
                }
              }
            )
          }

          // Payment authorization provided - verify it
          let paymentData
          try {
            paymentData = JSON.parse(paymentAuth)
          } catch {
            return NextResponse.json(
              { error: 'Invalid payment authorization format' },
              { status: 400 }
            )
          }

          // Verify payment
          const verification = await verifyPayment(
            paymentData,
            product.priceCents,
            product.id
          )

          if (!verification.verified) {
            return NextResponse.json(
              { error: verification.error || 'Payment verification failed' },
              { status: 402 }
            )
          }

          // Payment verified - record transaction
          await prisma.x402Transaction.create({
            data: {
              productId: product.id,
              trackId,
              payer: userId,
              amountCents: product.priceCents,
              currency: product.currency,
              txRef: verification.txRef,
              status: 'COMPLETED',
              metadata: JSON.stringify({
                verifiedAt: new Date().toISOString(),
                streamType: 'pay-per-play',
                userAgent: req.headers.get('user-agent')
              })
            }
          })

          console.log(`[x402] Payment verified for track ${trackId} by user ${userId}`)
        }
      }
    }

    // User is authorized to stream
    // Get audio file path from track
    const audioPath = track.audioUrl || track.fileUrl

    if (!audioPath) {
      return NextResponse.json(
        { error: 'Audio file not available' },
        { status: 404 }
      )
    }

    // For local files, stream from disk
    // For URLs (S3/R2), redirect or proxy
    if (audioPath.startsWith('http://') || audioPath.startsWith('https://')) {
      // External URL - redirect
      return NextResponse.redirect(audioPath)
    }

    // Local file - stream it
    const filePath = join(process.cwd(), 'public', audioPath)

    try {
      const fileStats = await stat(filePath)
      const range = req.headers.get('range')

      // Support range requests for audio streaming
      if (range) {
        const parts = range.replace(/bytes=/, '').split('-')
        const start = parseInt(parts[0], 10)
        const end = parts[1] ? parseInt(parts[1], 10) : fileStats.size - 1
        const chunkSize = end - start + 1

        const fileStream = createReadStream(filePath, { start, end })

        const headers = new Headers()
        headers.set('Content-Range', `bytes ${start}-${end}/${fileStats.size}`)
        headers.set('Accept-Ranges', 'bytes')
        headers.set('Content-Length', chunkSize.toString())
        headers.set('Content-Type', 'audio/mpeg')
        headers.set('Cache-Control', 'public, max-age=3600')

        const stream = new ReadableStream({
          start(controller) {
            fileStream.on('data', (chunk: Buffer) => {
              controller.enqueue(new Uint8Array(chunk))
            })
            fileStream.on('end', () => {
              controller.close()
            })
            fileStream.on('error', (error) => {
              controller.error(error)
            })
          }
        })

        return new Response(stream, { status: 206, headers })
      }

      // No range request - stream entire file
      const fileStream = createReadStream(filePath)

      const headers = new Headers()
      headers.set('Content-Type', 'audio/mpeg')
      headers.set('Content-Length', fileStats.size.toString())
      headers.set('Accept-Ranges', 'bytes')
      headers.set('Cache-Control', 'public, max-age=3600')

      const stream = new ReadableStream({
        start(controller) {
          fileStream.on('data', (chunk: Buffer) => {
            controller.enqueue(new Uint8Array(chunk))
          })
          fileStream.on('end', () => {
            controller.close()
          })
          fileStream.on('error', (error) => {
            controller.error(error)
          })
        }
      })

      return new Response(stream, { headers })
    } catch (error) {
      console.error('File read error:', error)
      return NextResponse.json(
        { error: 'Audio file not found' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Stream error:', error)
    return NextResponse.json(
      { error: 'Failed to process stream request' },
      { status: 500 }
    )
  }
}
