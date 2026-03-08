import { NextResponse, NextRequest } from 'next/server';

/**
 * POST /api/predictions/leprosy
 * POST /api/predictions/psoriasis
 * POST /api/predictions/skin-cancer
 * POST /api/predictions/tinea
 * POST /api/predictions/future
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    const url = new URL(req.url);
    const pathname = url.pathname;
    
    // Map prediction endpoints
    const predictionMap: Record<string, string> = {
      '/api/predictions/leprosy': '/api/leprosy',
      '/api/predictions/psoriasis': '/api/psoriasis',
      '/api/predictions/skin-cancer': '/api/analysis',
      '/api/predictions/tinea': '/api/tinea-xai',
      '/api/predictions/future': '/api/generate-future-prediction',
    };
    
    const backendPath = predictionMap[pathname] || '/api/analysis';
    
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
      { success: false, error: 'Prediction failed' },
      { status: 500 }
    );
  }
}
