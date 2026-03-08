import { NextResponse, NextRequest } from 'next/server';
import { BACKEND_API_URL } from '@/lib/constants';

/**
 * POST /api/auth/login
 * POST /api/auth/signup
 * POST /api/auth/forgot-password
 * POST /api/auth/reset-password
 * GET /api/auth/me
 * 
 * Proxy requests to backend or handle directly if migrating
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // This is a proxy endpoint - forward to backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    const pathname = new URL(req.url).pathname;
    
    const response = await fetch(`${backendUrl}${pathname}`, {
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
      {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    const pathname = new URL(req.url).pathname;
    
    const response = await fetch(`${backendUrl}${pathname}`, {
      method: 'GET',
      headers: {
        'Authorization': req.headers.get('Authorization') || '',
      },
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user',
      },
      { status: 500 }
    );
  }
}
