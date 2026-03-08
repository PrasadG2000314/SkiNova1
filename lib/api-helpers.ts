import { NextResponse, NextRequest } from 'next/server';

/**
 * Error response helper
 */
export function errorResponse(
  message: string,
  status: number = 500,
  details?: any
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(details && { details }),
    },
    { status }
  );
}

/**
 * Success response helper
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
) {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status }
  );
}

/**
 * Proxy request to backend
 */
export async function proxyRequest(
  req: NextRequest,
  backendUrl: string,
  path: string,
  options: RequestInit = {}
) {
  try {
    const url = new URL(req.url);
    const fullUrl = `${backendUrl}${path}${url.search}`;

    const response = await fetch(fullUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.get('Authorization') || '',
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' 
        ? await req.text() 
        : undefined,
      ...options,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : 'Proxy request failed',
      500
    );
  }
}

/**
 * Validate request method
 */
export function validateMethod(
  req: NextRequest,
  allowed: string[]
): boolean {
  return allowed.includes(req.method);
}

/**
 * Extract and validate JWT token
 */
export function extractToken(req: NextRequest): string | null {
  const auth = req.headers.get('Authorization');
  if (!auth) return null;
  
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  
  return parts[1];
}

/**
 * Check if user is authenticated
 */
export function requireAuth(req: NextRequest): boolean {
  return !!extractToken(req);
}
