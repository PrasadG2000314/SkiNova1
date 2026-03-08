# API Migration Guide

## Quick Start

This guide helps you update your components to use the new Next.js API structure.

## Before (Old Way)

```typescript
'use client';

import { useEffect, useState } from 'react';

export default function Component() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ❌ Direct backend calls or hardcoded URLs
    fetch('http://localhost:4000/api/banners')
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => setError(err));
  }, []);

  // ...
}
```

## After (New Way)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';
import type { Banner } from '@/lib/types';

export default function Component() {
  const [data, setData] = useState<Banner[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // ✅ Use the API client with proper typing
      const response = await apiGet<Banner[]>(API_ENDPOINTS.BANNERS);
      
      if (response.success) {
        setData(response.data || []);
      } else {
        setError(response.error || 'Failed to load');
      }
      
      setLoading(false);
    })();
  }, []);

  // ...
}
```

## Common Patterns

### 1. Fetching Data (GET)

**Old:**
```typescript
fetch(`http://localhost:4000/api/doctors?specialty=dermatology`)
  .then(res => res.json())
  .then(data => console.log(data));
```

**New:**
```typescript
import { apiGet } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';

const response = await apiGet(`${API_ENDPOINTS.DOCTORS}?specialty=dermatology`);
```

### 2. Creating Data (POST)

**Old:**
```typescript
fetch('http://localhost:4000/api/appointments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ patientId: '123', doctorId: '456', date: '2024-01-15' })
})
```

**New:**
```typescript
import { apiPost } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';

const response = await apiPost(
  API_ENDPOINTS.APPOINTMENTS_CREATE,
  { patientId: '123', doctorId: '456', date: '2024-01-15' }
);
```

### 3. Updating Data (PUT)

**Old:**
```typescript
fetch(`http://localhost:4000/api/profile`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'John Doe' })
})
```

**New:**
```typescript
import { apiPut } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';

const response = await apiPut(API_ENDPOINTS.PROFILE, { name: 'John Doe' });
```

### 4. Deleting Data (DELETE)

**Old:**
```typescript
fetch(`http://localhost:4000/api/appointments/123`, {
  method: 'DELETE'
})
```

**New:**
```typescript
import { apiDelete } from '@/lib/api';

const response = await apiDelete('/api/appointments/123');
```

### 5. File Upload

**Old:**
```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('userId', userId);

fetch('http://localhost:4000/api/upload', {
  method: 'POST',
  body: formData
})
```

**New:**
```typescript
import { apiUpload } from '@/lib/api';

const response = await apiUpload('/api/detection', file, {
  body: new FormData(/* ... */),
});
```

### 6. Authentication

**Old:**
```typescript
const token = localStorage.getItem('token');
fetch('http://localhost:4000/api/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

**New:**
```typescript
import { apiGet } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';

// Token is automatically added if available
const response = await apiGet(API_ENDPOINTS.PROFILE);
```

## TypeScript Types

Use provided types for better type safety:

```typescript
import type { 
  User, 
  Doctor, 
  Appointment, 
  Banner,
  Report 
} from '@/lib/types';

// Define your response with the type
const response = await apiGet<Doctor[]>(API_ENDPOINTS.DOCTORS);

if (response.success && response.data) {
  response.data.forEach(doctor => {
    console.log(doctor.name); // Properly typed!
  });
}
```

## Files to Update

1. **Components** - Replace fetch calls with API client
   - `components/Banner.tsx`
   - `components/Navbar.tsx`
   - `app/dashboard/page.tsx`
   - All feature components

2. **Hooks** - Create custom hooks for API calls
   - `hooks/useDoctor.ts`
   - `hooks/useAppointments.ts`
   - `hooks/usePrediction.ts`

3. **Services** - If using service layer
   - `services/api.ts` (replace with lib/api.ts)
   - `services/doctor.service.ts`

## Create a Custom Hook

For reusable data fetching:

```typescript
// hooks/useDoctor.ts
'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';
import type { Doctor } from '@/lib/types';

export function useDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await apiGet<Doctor[]>(API_ENDPOINTS.DOCTORS);
        if (response.success) {
          setDoctors(response.data || []);
        } else {
          setError(response.error || 'Failed to load doctors');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { doctors, loading, error };
}

// Usage in component
export default function DoctorsList() {
  const { doctors, loading, error } = useDoctors();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {doctors.map(doc => <li key={doc._id}>{doc.name}</li>)}
    </ul>
  );
}
```

## Testing

Test your API calls locally:

```typescript
// Test health check
import { apiGet } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';

const health = await apiGet(API_ENDPOINTS.HEALTH);
console.log(health); // Should log: { success: true, status: 'ok' }
```

## Troubleshooting

### "Cannot find module @/lib/api"
- Make sure path alias `@/` is configured in `tsconfig.json` ✓
- Files exist in `frontend/lib/` ✓

### API returns 404
- Check endpoint in `lib/constants.ts`
- Ensure backend is running on `localhost:4000`
- Verify `NEXT_PUBLIC_BACKEND_URL` in `.env.local`

### CORS errors
- Backend already has CORS enabled
- Check browser console for actual error

### Authentication not working
- Verify token is saved in `localStorage`
- Check Authorization header format: `Bearer <token>`
- Ensure token is included in requests

## Checklist

- [ ] Update `.env.local` with `NEXT_PUBLIC_BACKEND_URL`
- [ ] Import `apiGet`, `apiPost`, etc. in components
- [ ] Replace hardcoded URLs with `API_ENDPOINTS`
- [ ] Add TypeScript types from `lib/types.ts`
- [ ] Test all endpoints after migration
- [ ] Remove old fetch code
- [ ] Update components list below

## Components to Update

- [ ] `components/Banner.tsx`
- [ ] `components/LayoutClientWrapper.tsx`
- [ ] `components/Navbar.tsx`
- [ ] `components/Sidebar.tsx`
- [ ] `app/[dashboard]/page.tsx`
- [ ] `app/(features)/skin-cancer/page.tsx`
- [ ] `app/(features)/psoriasis/page.tsx`
- [ ] `app/(features)/leprosy/page.tsx`
- [ ] `app/(features)/tinea/page.tsx`
- [ ] `app/(auth)/login/page.tsx`
- [ ] `app/(auth)/signup/page.tsx`
- [ ] All other feature components

---

**Questions?** Refer to [API_STRUCTURE.md](./API_STRUCTURE.md) for complete API documentation.
