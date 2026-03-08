// Global configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
export const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

// Feature flags
export const FEATURES = {
  LEPROSY: true,
  PSORIASIS: true,
  SKIN_CANCER: true,
  TINEA: true,
  CHAT: true,
  SMART_DEVICES: true,
  APPOINTMENTS: true,
  DOSHA_QUIZ: true,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  SIGNUP: '/api/auth/signup',
  LOGOUT: '/api/auth/logout',
  
  // Banners
  BANNERS: '/api/banners/all',
  
  // Predictions
  SKIN_CANCER_PREDICT: '/api/predict/skin-cancer',
  PSORIASIS_PREDICT: '/api/predict/psoriasis',
  LEPROSY_PREDICT: '/api/predict/leprosy',
  TINEA_PREDICT: '/api/predict/tinea',
  
  // Future Prediction
  FUTURE_PREDICTION: '/api/generate-future-prediction',
} as const;

export default {
  API_URL,
  FRONTEND_URL,
  FEATURES,
  API_ENDPOINTS,
};
