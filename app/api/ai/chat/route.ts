import { NextRequest, NextResponse } from 'next/server'
import { chatWithAssistant } from '@/lib/ai/assistantService'

/**
 * POST /api/ai/chat
 * Chat with AI assistant
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, context, provider, temperature, maxTokens } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    const response = await chatWithAssistant({
      messages,
      context,
      provider: provider || 'openai',
      temperature: temperature || 0.7,
      maxTokens: maxTokens || 1000,
    })

    return NextResponse.json({
      success: true,
      ...response,
    })
  } catch (error: any) {
    console.error('[AI] Chat error:', error)
    return NextResponse.json(
      {
        error: 'AI assistant failed',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
