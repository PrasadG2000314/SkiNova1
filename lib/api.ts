import { BACKEND_API_URL, REQUEST_TIMEOUT } from './constants';

export interface FetchOptions extends RequestInit {
  timeout?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

/**
 * Utility function to fetch from API with timeout and error handling
 */
export async function fetchApi<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const {
    timeout = REQUEST_TIMEOUT,
    headers = {},
    ...fetchOptions
  } = options;

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const url = endpoint.startsWith('http') ? endpoint : `${BACKEND_API_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      signal: controller.signal,
    });

    // Get token from localStorage if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headersObj = headers as Record<string, string>;
    if (token && !headersObj['Authorization']) {
      const retryResponse = await fetch(url, {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...headers,
        },
        signal: controller.signal,
      });
      return handleResponse<T>(retryResponse);
    }

    return handleResponse<T>(response);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: `Request timeout after ${timeout}ms`,
          status: 408,
        };
      }
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'Unknown error occurred',
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Handle API response
 */
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers.get('content-type');
  
  let data: any;
  if (contentType?.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    return {
      success: false,
      error: data.error || data.message || `HTTP ${response.status}`,
      status: response.status,
    };
  }

  return {
    success: true,
    data: data.data || data,
    message: data.message,
    status: response.status,
  };
}

/**
 * GET request
 */
export async function apiGet<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  return fetchApi<T>(endpoint, {
    ...options,
    method: 'GET',
  });
}

/**
 * POST request
 */
export async function apiPost<T = any>(
  endpoint: string,
  body?: any,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  return fetchApi<T>(endpoint, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT request
 */
export async function apiPut<T = any>(
  endpoint: string,
  body?: any,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  return fetchApi<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE request
 */
export async function apiDelete<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  return fetchApi<T>(endpoint, {
    ...options,
    method: 'DELETE',
  });
}

/**
 * PATCH request
 */
export async function apiPatch<T = any>(
  endpoint: string,
  body?: any,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  return fetchApi<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Upload file
 */
export async function apiUpload<T = any>(
  endpoint: string,
  file: File,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const formData = new FormData();
  formData.append('file', file);

  // Remove Content-Type header to allow browser to set boundary
  const { headers = {}, ...restOptions } = options;
  const { 'Content-Type': _, ...restHeaders } = headers as Record<string, string>;

  return fetchApi<T>(endpoint, {
    ...restOptions,
    method: 'POST',
    headers: restHeaders,
    body: formData,
  });
}
