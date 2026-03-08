import { NextResponse, NextRequest } from 'next/server';

/**
 * POST /api/xai/gradcam
 * POST /api/xai/dosha
 * POST /api/xai/tinea
 * XAI (Explainable AI) endpoints for GradCAM visualizations
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    const url = new URL(req.url);
    const pathname = url.pathname;
    
    // Map XAI endpoints
    let backendPath = '/api/xai/gradcam';
    
    if (pathname.includes('/xai/dosha')) {
      backendPath = '/api/xai/dosha';
    } else if (pathname.includes('/xai/tinea')) {
      backendPath = '/api/tinea-xai';
    }
    
    const response = await fetch(`${backendUrl}${backendPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.get('Authorization') || '',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'XAI request failed' },
      { status: 500 }
    );
  }
}
