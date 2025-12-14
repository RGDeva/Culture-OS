import { NextRequest, NextResponse } from 'next/server'

// Stubbed route for build - will be implemented with database later
export async function POST(request: NextRequest) {
  return NextResponse.json({ message: 'Muso credit added', musoCredits: [] })
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ musoCredits: [] })
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json({ message: 'Muso credit removed', musoCredits: [] })
}
