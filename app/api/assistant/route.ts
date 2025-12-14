import { NextResponse } from 'next/server';
import { getPrivyClient } from '@/lib/privy';

export async function POST(req: Request) {
  try {
    // Verify the user is authenticated
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const privy = getPrivyClient();
    
    try {
      // Verify the user's token
      await privy.verifyAuthToken(token);
    } catch (error) {
      return new NextResponse('Invalid token', { status: 401 });
    }

    const { message, context } = await req.json();

    // TODO: Integrate with your AI service (e.g., OpenAI, Anthropic, etc.)
    // For now, we'll return a mock response
    const response = {
      text: `I received your message: "${message}". This is a mock response. In a real implementation, this would connect to an AI service.`,
      context: {
        ...context,
        lastInteraction: new Date().toISOString(),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Assistant API error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
