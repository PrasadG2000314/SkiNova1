import { NextRequest, NextResponse } from 'next/server'

// This is a placeholder API route
// Model prediction is handled client-side with Teachable Machine
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Prediction is handled client-side' },
    { status: 400 }
  )
}

