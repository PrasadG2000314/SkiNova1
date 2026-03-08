# Next.js Project Folder Structure

## Overview
This project uses Next.js 14+ with App Router and TypeScript.

## Recommended Structure

```
frontend/
├── app/                          # App Router - Pages and Layouts
│   ├── api/                      # API Routes (Route Handlers)
│   ├── (auth)/                   # Route Group - Authentication pages
│   │   ├── login/
│   │   ├── signup/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── (dashboard)/              # Route Group - Protected pages
│   │   ├── dashboard/
│   │   ├── patient/
│   │   ├── doctor/
│   │   └── admin/
│   ├── (features)/               # Route Group - Feature pages
│   │   ├── skin-cancer/
│   │   ├── psoriasis/
│   │   ├── leprosy/
│   │   ├── tinea/
│   │   ├── chat/
│   │   └── [other features]/
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
│
├── components/                   # Reusable React Components
│   ├── ui/                       # UI Components (buttons, forms, etc.)
│   ├── navbar.tsx
│   ├── footer.tsx
│   ├── sidebar.tsx
│   ├── leprosy/                  # Feature-specific components
│   └── [other shared components]/
│
├── public/                       # Static assets
│   ├── images/
│   ├── videos/
│   ├── models/
│   └── leprosy/
│
├── styles/                       # Global styles
│   └── globals.css
│
├── types/                        # TypeScript type definitions
│   └── bluetooth.d.ts
│
├── utils/                        # Utility functions
│   └── [utility files]/
│
├── config/                       # Configuration files
│
├── [config files]               # next.config.js, tsconfig.json, etc.
└── .env.example                 # Environment variables example
```

## Key Rules

### ✅ DO:
- Keep components in root `components/` folder (except API routes)
- Use grouped routes `(groupName)/` to organize feature-related pages
- Store page-specific components inside their respective route folders
- Use `@/*` alias for absolute imports
- Keep API routes in `app/api/`
- Use TypeScript for type safety

### ❌ DON'T:
- Don't duplicate components folders (one `components/` at root level only)
- Don't mix components in multiple locations
- Don't use relative imports when absolute imports are clearer
- Don't store all pages at the root level of `app/`

## Path Aliases
The following aliases are configured in `tsconfig.json`:
```json
{
  "@/*": "./",                    // Any file in root
  "@/app/*": "./app/*",           // App router files
  "@/components/*": "./components/*",  // Components
  "@/utils/*": "./utils/*",       // Utilities
  "@/types/*": "./types/*",       // Type definitions
  "@/styles/*": "./styles/*"      // Styles
}
```

## Migration Steps (if needed)
1. Move duplicate components from `app/components/` to root `components/`
2. Organize pages into route groups using `(groupName)/` syntax
3. Update imports to use the path aliases
4. Remove empty/duplicate folders
5. Organize API routes by feature under `app/api/`

## Import Examples
```tsx
// ✅ Recommended
import { Banner } from '@/components/Banner';
import { useUtils } from '@/utils/helpers';
import type { User } from '@/types/user';

// ❌ Avoid
import { Banner } from '../../../components/Banner';
import * as helpers from '../../../../utils/helpers';
```
