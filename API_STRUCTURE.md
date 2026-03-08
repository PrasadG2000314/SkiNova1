# Next.js API Structure - SkinNova

## Overview

The API has been reorganized to follow Next.js App Router conventions and best practices. All API routes are located in the `app/api/` directory and serve as proxies to the backend Express server.

## Directory Structure

```
frontend/app/api/
├── health/
│   └── route.ts              # Health check endpoint
├── auth/
│   └── route.ts              # Authentication (login, signup, forgot password)
├── admin/
│   └── route.ts              # Admin operations
├── appointments/
│   └── route.ts              # Appointment management
├── doctors/
│   └── route.ts              # Doctor management
├── availability/
│   └── route.ts              # Doctor availability
├── reports/
│   └── route.ts              # Medical reports
├── banners/
│   └── route.ts              # Banner management
├── chat/
│   └── route.ts              # Chat messages
├── detection/
│   └── route.ts              # Disease detection
├── predictions/
│   └── route.ts              # Disease predictions (leprosy, psoriasis, etc.)
├── profile/
│   └── route.ts              # User profile
└── xai/
    └── route.ts              # Explainable AI (GradCAM)

frontend/lib/
├── api.ts                    # API client utilities
├── constants.ts              # API endpoints and constants
├── types.ts                  # TypeScript type definitions
└── api-helpers.ts            # Helper functions for API handlers
```

## API Client Usage

### Using the API Client

The `lib/api.ts` module provides utility functions for making API requests:

```typescript
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';

// GET request
const { success, data } = await apiGet(API_ENDPOINTS.BANNERS);

// POST request
const response = await apiPost(API_ENDPOINTS.AUTH_LOGIN, {
  email: 'user@example.com',
  password: 'password123',
});

// PUT request
await apiPut('/api/profile', { name: 'Updated Name' });

// DELETE request
await apiDelete('/api/appointments/123');
```

### Handling Responses

All API functions return a consistent response format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

// Usage
const response = await apiGet<Banner[]>(API_ENDPOINTS.BANNERS);
if (response.success) {
  console.log(response.data); // Access typed data
}
```

## API Endpoints

### Health Check
- `GET /api/health` - Check backend health

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user (requires auth)

### Admin
- `GET /api/admin` - Get admin data
- `POST /api/admin` - Create admin resource
- `POST /api/admin/clear-chats` - Clear all chats (admin only)

### Appointments
- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/[id]` - Update appointment
- `DELETE /api/appointments/[id]` - Delete appointment

### Doctors
- `GET /api/doctors` - List doctors
- `POST /api/doctors` - Create doctor profile

### Availability
- `GET /api/availability` - Get doctor availability
- `POST /api/availability` - Create availability slot

### Banners
- `GET /api/banners` - Get banners
- `GET /api/banners/all` - Get all active banners
- `POST /api/banners` - Create banner
- `PUT /api/banners/[id]` - Update banner
- `DELETE /api/banners/[id]` - Delete banner

### Chat
- `GET /api/chat` - Get chat history
- `POST /api/chat` - Send chat message

### Detection
- `GET /api/detection` - Get detection history
- `POST /api/detection` - Analyze image for disease

### Predictions
- `POST /api/predictions/leprosy` - Leprosy prediction
- `POST /api/predictions/psoriasis` - Psoriasis prediction
- `POST /api/predictions/skin-cancer` - Skin cancer prediction
- `POST /api/predictions/tinea` - Tinea prediction
- `POST /api/predictions/future` - Future skin health prediction

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `DELETE /api/profile` - Delete user profile

### XAI (Explainable AI)
- `POST /api/xai/gradcam` - Get GradCAM visualization
- `POST /api/xai/dosha` - Dosha-based XAI
- `POST /api/xai/tinea` - Tinea XAI visualization

### Reports
- `GET /api/reports` - Get medical reports
- `POST /api/reports` - Create report

## Configuration

### Environment Variables

Add these to your `.env.local` file:

```env
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000

# Frontend URL
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

## How It Works

### Request Flow

1. **Client Request** → Frontend component calls `apiPost('/api/predictions/leprosy', data)`
2. **Next.js Route Handler** → `app/api/predictions/route.ts` receives request
3. **Proxy to Backend** → Forwards to `http://localhost:4000/api/leprosy`
4. **Response** → Returns result to client

### Error Handling

All API responses include proper error handling:

```typescript
const response = await apiPost(API_ENDPOINTS.AUTH_LOGIN, credentials);

if (!response.success) {
  console.error(response.error);
  // Handle error: invalid credentials, network error, etc.
}
```

### Authentication

For protected routes, include the JWT token:

```typescript
const token = localStorage.getItem('token');
const response = await apiGet(API_ENDPOINTS.AUTH_ME, {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

## Component Usage Examples

### Fetching Data

```typescript
'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';
import type { Doctor } from '@/lib/types';

export default function DoctorsList() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      const response = await apiGet<Doctor[]>(API_ENDPOINTS.DOCTORS);
      if (response.success) {
        setDoctors(response.data || []);
      }
      setLoading(false);
    };

    fetchDoctors();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {doctors.map((doctor) => (
        <div key={doctor._id}>{doctor.name}</div>
      ))}
    </div>
  );
}
```

### Creating Data

```typescript
const handleCreateAppointment = async (appointmentData: Partial<Appointment>) => {
  const response = await apiPost(
    API_ENDPOINTS.APPOINTMENTS_CREATE,
    appointmentData
  );

  if (response.success) {
    alert('Appointment created successfully');
  } else {
    alert(`Error: ${response.error}`);
  }
};
```

## Migration Checklist

- [ ] Update all fetch calls to use `apiGet`, `apiPost`, etc.
- [ ] Replace hardcoded API URLs with constants from `lib/constants.ts`
- [ ] Update environment variables in `.env.local`
- [ ] Test all API endpoints
- [ ] Update TypeScript types in components
- [ ] Add authentication headers where needed
- [ ] Test error handling flows
- [ ] Update API documentation

## Next Steps

1. **Use the API client** - Replace all `fetch()` calls with `apiGet()`, `apiPost()`, etc.
2. **Update components** - Import endpoints from `lib/constants.ts`
3. **Type your responses** - Use types from `lib/types.ts`
4. **Test thoroughly** - Verify all endpoints work correctly
5. **Add middleware** - Implement authentication/authorization as needed

## Resources

- [Next.js API Routes Documentation](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Fetch API Reference](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Next.js Best Practices](https://nextjs.org/docs/app)
