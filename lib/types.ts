/**
 * Response type definitions for API endpoints
 */

// Auth
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  phone?: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

// Appointments
export interface Appointment {
  _id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  reason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Doctors
export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  email: string;
  phone: string;
  experience: number;
  hospital?: string;
  avatar?: string;
  rating?: number;
  isActive: boolean;
  createdAt: string;
}

// Reports
export interface Report {
  _id: string;
  patientId: string;
  title: string;
  content: string;
  diagnosis?: string;
  imageUrl?: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

// Predictions
export interface PredictionResult {
  success: boolean;
  prediction: string;
  confidence: number;
  recommendations: string[];
  visualizations?: {
    gradCAM: string;
    heatmap: string;
  };
}

// Chat
export interface ChatMessage {
  _id: string;
  userId: string;
  message: string;
  response?: string;
  timestamp: string;
  type: 'user' | 'assistant';
}

// Banner
export interface Banner {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  link?: string;
  isActive: boolean;
  createdAt: string;
}

// Profile
export interface UserProfile {
  _id: string;
  userId: string;
  bio?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  medicalHistory?: string[];
  allergies?: string[];
}

// Detection
export interface Detection {
  _id: string;
  userId: string;
  imageUrl: string;
  predictions: {
    disease: string;
    confidence: number;
  }[];
  status: 'pending' | 'completed' | 'error';
  createdAt: string;
}

// Availability
export interface DoctorAvailability {
  _id: string;
  doctorId: string;
  day: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  maxAppointments?: number;
  bookedAppointments?: number;
}
