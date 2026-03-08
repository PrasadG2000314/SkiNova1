/**
 * API Constants and Configuration
 */

export const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
export const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

/**
 * API Endpoints Map
 * Maps frontend routes to backend endpoints
 */
export const API_ENDPOINTS = {
  // Health
  HEALTH: '/api/health',
  
  // Auth
  AUTH_LOGIN: '/api/auth/login',
  AUTH_SIGNUP: '/api/auth/signup',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_ME: '/api/auth/me',
  AUTH_FORGOT_PASSWORD: '/api/auth/forgot-password',
  AUTH_RESET_PASSWORD: '/api/auth/reset-password',
  
  // Admin
  ADMIN_DASHBOARD: '/api/admin',
  ADMIN_CLEAR_CHATS: '/api/admin/clear-chats',
  
  // Appointments
  APPOINTMENTS: '/api/appointments',
  APPOINTMENTS_CREATE: '/api/appointments',
  APPOINTMENTS_UPDATE: '/api/appointments',
  APPOINTMENTS_DELETE: '/api/appointments',
  
  // Doctors
  DOCTORS: '/api/doctors',
  DOCTORS_CREATE: '/api/doctors',
  
  // Availability
  AVAILABILITY: '/api/availability',
  AVAILABILITY_CREATE: '/api/availability',
  
  // Reports
  REPORTS: '/api/reports',
  REPORTS_CREATE: '/api/reports',
  
  // Banners
  BANNERS: '/api/banners',
  BANNERS_ALL: '/api/banners/all',
  BANNERS_CREATE: '/api/banners',
  
  // Chat
  CHAT: '/api/chat',
  CHATS: '/api/chat',
  
  // Detection & Analysis
  DETECTION: '/api/detection',
  ANALYSIS: '/api/detection',
  
  // Predictions
  PREDICT_LEPROSY: '/api/predictions/leprosy',
  PREDICT_PSORIASIS: '/api/predictions/psoriasis',
  PREDICT_SKIN_CANCER: '/api/predictions/skin-cancer',
  PREDICT_TINEA: '/api/predictions/tinea',
  PREDICT_FUTURE: '/api/predictions/future',
  
  // Profile
  PROFILE: '/api/profile',
  PROFILE_UPDATE: '/api/profile',
  
  // XAI (Explainable AI)
  XAI_GRADCAM: '/api/xai/gradcam',
  XAI_DOSHA: '/api/xai/dosha',
  XAI_TINEA: '/api/xai/tinea',
} as const;

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Request timeout in milliseconds
 */
export const REQUEST_TIMEOUT = 30000; // 30 seconds
