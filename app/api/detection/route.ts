import { NextResponse, NextRequest } from 'next/server';

/**
 * POST /api/detection
 * GET /api/detection
 * Handles skin disease detection requests
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    
    const response = await fetch(`${backendUrl}/api/detect`, {
      method: 'POST',
      headers: {
        'Authorization': req.headers.get('Authorization') || '',
      },
      body: formData,
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Detection failed' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    const url = new URL(req.url);
    
    const response = await fetch(`${backendUrl}/api/detect${url.search}`, {
      method: 'GET',
      headers: {
        'Authorization': req.headers.get('Authorization') || '',
      },
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch detections' },
      { status: 500 }
    );
  }
}
