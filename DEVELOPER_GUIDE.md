# Developer Guide

This guide covers the architecture, coding conventions, and development practices for the Zelan Bakery frontend application.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Design System](#design-system)
3. [Component Structure](#component-structure)
4. [State Management](#state-management)
5. [API Integration](#api-integration)
6. [Routing](#routing)
7. [Authentication](#authentication)
8. [Coding Conventions](#coding-conventions)
9. [Adding New Features](#adding-new-features)
10. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Application Structure

```
┌─────────────────────────────────────────────────────────────┐
│                        index.html                           │
│                    (Google Fonts loaded)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        main.jsx                             │
│                   (React DOM render)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         App.jsx                             │
│                   (React Router setup)                      │
├─────────────────────────────────────────────────────────────┤
│  Routes:                                                    │
│    /          → HomePage                                    │
│    /menu/:id  → MenuDetailPage                              │
│    /login     → LoginPage                                   │
│    /admin/*   → AdminPage (Protected)                       │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Component  │───▶│   api.js     │───▶│   Backend    │
│   useState   │    │   (Axios)    │    │   Server     │
└──────────────┘    └──────────────┘    └──────────────┘
       │                                       │
       │◀──────────────────────────────────────┘
       │           (JSON Response)
       ▼
┌──────────────┐
│   UI Update  │
└──────────────┘
```

---

## Design System

### Color Palette

All colors are defined as CSS custom properties in `src/styles/global.css`:

```css
/* Primary Colors */
--warm-black: #1a1612;      /* Dark backgrounds, text */
--cream: #F5EDE4;           /* Light backgrounds */
--light-cream: #FAF7F2;     /* Lighter backgrounds */

/* Accent Colors */
--terracotta: #C62828;      /* Primary CTA buttons */
--gold: #E53935;            /* Pricing, highlights */
--sage: #7A8B6E;            /* Tertiary accent */
--warm-brown: #8B7355;      /* Supporting color */

/* Status Colors */
--danger: #DC3545;          /* Errors, delete actions */
--success: #28A745;         /* Success messages */
```

### Typography

| Usage | Font Family | Weights |
|-------|-------------|---------|
| Headings | Playfair Display (serif) | 400, 600 |
| Body Text | Josefin Sans (sans-serif) | 300, 400, 500, 600 |

### Spacing Scale

Use consistent spacing based on 4px increments:
- `0.5rem` (8px) - Tight spacing
- `1rem` (16px) - Standard spacing
- `1.5rem` (24px) - Medium spacing
- `2rem` (32px) - Large spacing
- `3rem` (48px) - Section spacing

### Button Variants

```css
.btn-primary    /* Terracotta background, white text */
.btn-secondary  /* Transparent, terracotta border */
.btn-whatsapp   /* WhatsApp green (#25D366) */
```

---

## Component Structure

### Page Components

Located in `src/pages/`:

| Component | Route | Description |
|-----------|-------|-------------|
| `HomePage.jsx` | `/` | Customer-facing landing page with menu, gallery, FAQ, about, and contact sections |
| `MenuDetailPage.jsx` | `/menu/:id` | Individual menu item detail view with image carousel, audio player, and related products |
| `LoginPage.jsx` | `/login` | Admin authentication |
| `AdminPage.jsx` | `/admin` | Protected admin dashboard with CRUD for menu items, categories, FAQs, and user management |

### Reusable Components

Located in `src/components/`:

| Component | Props | Description |
|-----------|-------|-------------|
| `MenuCard` | `item` | Displays menu item card with image, price, and link to detail page |

### MenuCard Component

The `MenuCard` component handles:
- Image display with overlay effect
- Multi-image support (prioritizes `images` array with `is_main` flag, falls back to `image_url`)
- Featured star badge
- Custom tag display (e.g., "Best Seller")
- Links to `/menu/:id` detail page via "Lihat Detail" CTA

```jsx
<MenuCard
  item={{
    id: 1,
    name: "Chocolate Cake",
    price: 25000,
    display_price: "Rp 25.000",
    description: "Rich chocolate cake",
    images: [
      { id: 1, image_url: "/uploads/images/cake.jpg", is_main: true }
    ],
    is_featured: true,
    tag: "Best Seller"
  }}
/>
```

### MenuDetailPage Features

The `MenuDetailPage` component provides:
- Product image carousel with thumbnail navigation
- Fullscreen image viewer
- Audio player for voice descriptions (MP3 upload or text-to-speech fallback)
- Auto-plays voice description on page load (500ms delay)
- Related products section (3 items from the same category)
- Back navigation to the menu section

### AdminPage Features

The `AdminPage` component provides:
- **Dashboard**: Stats overview (total items, categories, featured items, voice-enabled items)
- **Category Management**: Create and delete categories
- **Menu Items**: Full CRUD with multi-image upload (up to 4), voice file upload, featured flag, tags, unit field
- **FAQ Management**: Create, edit, and delete FAQ entries
- **User Management**: Register new admin accounts, change password
- **Toast Notifications**: Success/error feedback for all operations

---

## State Management

This application uses **React Hooks** for state management without external libraries.

### Local State Pattern

```jsx
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.getAll();
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

### Authentication State

Stored in `localStorage`:
- `authToken` - JWT or session token
- `isAuthenticated` - Boolean flag (string)
- `user` - User object (JSON string)

---

## API Integration

### API Client Configuration

The API client is configured in `src/services/api.js`:

```javascript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor adds auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Available API Modules

#### Categories API
```javascript
categoriesApi.getAll()           // GET /categories
categoriesApi.getById(id)        // GET /categories/:id
categoriesApi.create(data)       // POST /categories
categoriesApi.update(id, data)   // PUT /categories/:id
categoriesApi.delete(id)         // DELETE /categories/:id
```

#### Menu Items API
```javascript
menuApi.getAll(params)           // GET /menu
menuApi.getByCategory()          // GET /menu/by-category
menuApi.getById(id)              // GET /menu/:id
menuApi.create(formData)         // POST /menu (multipart)
menuApi.update(id, formData)     // PUT /menu/:id (multipart)
menuApi.delete(id)               // DELETE /menu/:id
menuApi.uploadVoice(id, formData)       // POST /menu/:id/voice (multipart)
menuApi.uploadImage(id, formData)       // POST /menu/:id/images (multipart)
menuApi.deleteImage(menuId, imageId)    // DELETE /menu/:menuId/images/:imageId
menuApi.setMainImage(menuId, imageId)   // PUT /menu/:menuId/images/:imageId/main
```

#### Specials API
```javascript
specialsApi.getAll(params)       // GET /specials
specialsApi.getById(id)          // GET /specials/:id
specialsApi.create(data)         // POST /specials
specialsApi.update(id, data)     // PUT /specials/:id
specialsApi.delete(id)           // DELETE /specials/:id
```

#### FAQ API
```javascript
faqApi.getAll()                  // GET /faqs
faqApi.getById(id)               // GET /faqs/:id
faqApi.create(data)              // POST /faqs
faqApi.update(id, data)          // PUT /faqs/:id
faqApi.delete(id)                // DELETE /faqs/:id
```

#### Authentication API
```javascript
authApi.login(credentials)       // POST /auth/login
authApi.logout()                 // POST /auth/logout
authApi.register(data)           // POST /auth/register
authApi.changePassword(data)     // PUT /auth/change-password
```

#### Gallery API
```javascript
galleryApi.getAll()              // GET /gallery
galleryApi.getById(id)           // GET /gallery/:id
galleryApi.create(formData)      // POST /gallery (multipart)
galleryApi.update(id, formData)  // PUT /gallery/:id (multipart)
galleryApi.delete(id)            // DELETE /gallery/:id
```

#### Utilities
```javascript
getFileUrl(path)                 // Constructs full URL for uploads
statsApi.get()                   // GET /stats
```

### File Upload Pattern

Use `FormData` for endpoints that accept file uploads:

```javascript
const formData = new FormData();
formData.append('name', itemName);
formData.append('price', price);
formData.append('image', imageFile);      // File object
formData.append('voiceFile', audioFile);  // File object

await menuApi.create(formData);
```

---

## Routing

### Route Configuration

```jsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/menu/:id" element={<MenuDetailPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route
      path="/admin/*"
      element={
        <ProtectedRoute>
          <AdminPage />
        </ProtectedRoute>
      }
    />
  </Routes>
</BrowserRouter>
```

### Protected Routes

The `ProtectedRoute` component checks authentication:

```jsx
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  const token = localStorage.getItem('authToken');

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
```

### Navigation

Use React Router's hooks for programmatic navigation:

```jsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/admin');  // Navigate to admin
navigate(-1);        // Go back
```

---

## Authentication

### Login Flow

1. User submits credentials on `/login`
2. `authApi.login()` sends POST to `/auth/login`
3. On success, store token and user in localStorage
4. Redirect to `/admin`

```javascript
const handleLogin = async (username, password) => {
  const response = await authApi.login({ username, password });
  localStorage.setItem('authToken', response.data.token);
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('user', JSON.stringify(response.data.user));
  navigate('/admin');
};
```

### Logout Flow

```javascript
const handleLogout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('user');
  navigate('/login');
};
```

### Register New Admin

Admins can register new admin accounts from the admin dashboard:

```javascript
const handleRegister = async (username, password) => {
  await authApi.register({ username, password });
};
```

### Change Password

Admins can change their password from the admin dashboard:

```javascript
const handleChangePassword = async (currentPassword, newPassword) => {
  await authApi.changePassword({ currentPassword, newPassword });
};
```

---

## Coding Conventions

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `MenuCard.jsx` |
| Pages | PascalCase + Page | `HomePage.jsx` |
| Styles | Same as component | `MenuCard.css` |
| Services | camelCase | `api.js` |

### Component Structure

```jsx
// 1. Imports
import { useState, useEffect } from 'react';
import './ComponentName.css';

// 2. Component definition
const ComponentName = ({ prop1, prop2 }) => {
  // 3. State declarations
  const [state, setState] = useState(initialValue);

  // 4. Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  // 5. Event handlers
  const handleEvent = () => {
    // Handler logic
  };

  // 6. Render
  return (
    <div className="component-name">
      {/* JSX */}
    </div>
  );
};

export default ComponentName;
```

### CSS Conventions

- Use kebab-case for class names: `.menu-card`, `.btn-primary`
- Scope styles to component: `.menu-card .title`
- Use CSS custom properties for theming
- Mobile-first approach with min-width media queries

```css
/* Base styles (mobile) */
.component {
  padding: 1rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .component {
    padding: 2rem;
  }
}
```

### Import Order

1. React and React libraries
2. Third-party libraries
3. Local components
4. Services/utilities
5. Styles

```jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import MenuCard from '../components/MenuCard';
import { menuApi } from '../services/api';

import './HomePage.css';
```

---

## Adding New Features

### Adding a New Page

1. Create component file in `src/pages/`:
   ```jsx
   // src/pages/NewPage.jsx
   import './NewPage.css';

   const NewPage = () => {
     return <div className="new-page">Content</div>;
   };

   export default NewPage;
   ```

2. Create corresponding CSS file:
   ```css
   /* src/pages/NewPage.css */
   .new-page {
     /* styles */
   }
   ```

3. Add route in `App.jsx`:
   ```jsx
   <Route path="/new-page" element={<NewPage />} />
   ```

### Adding a New API Endpoint

1. Add the API methods in `src/services/api.js`:
   ```javascript
   export const newFeatureApi = {
     getAll: () => api.get('/new-feature'),
     create: (data) => api.post('/new-feature', data),
     // ... other methods
   };
   ```

2. Import and use in your component:
   ```javascript
   import { newFeatureApi } from '../services/api';
   ```

### Adding a New Reusable Component

1. Create in `src/components/`:
   ```
   src/components/
   ├── NewComponent.jsx
   └── NewComponent.css
   ```

2. Export from component file
3. Import where needed

---

## Troubleshooting

### Common Issues

#### API Requests Failing in Development

**Problem**: 404 errors when calling API endpoints

**Solution**: The Vite dev server proxies both `/api` and `/uploads` requests to the backend. By default, the proxy points to the production Railway backend (`https://zelanbe-production.up.railway.app`). For local development, update `vite.config.js` to proxy to `http://localhost:3000`.

#### Images Not Loading

**Problem**: Uploaded images return 404

**Solution**:
1. Check that `VITE_UPLOADS_URL` is configured correctly
2. Ensure the backend serves static files from the uploads directory
3. Use `getFileUrl()` helper from api.js

#### Authentication Redirect Loop

**Problem**: Keeps redirecting to login page

**Solution**:
1. Check if `authToken` exists in localStorage
2. Verify the token hasn't expired
3. Check `isAuthenticated` flag is set to `'true'` (string)

#### Voice Not Playing on Detail Page

**Problem**: Menu item voice doesn't play on the detail page

**Solution**:
1. Check browser autoplay policies (user interaction may be required)
2. Verify the MP3 file exists at the specified path
3. Check browser console for audio errors
4. Ensure text-to-speech fallback is working (check `speechSynthesis` support)
5. Note: Voice auto-plays on `MenuDetailPage` load with a 500ms delay

### Development Tips

1. **Use React DevTools** - Install the browser extension for debugging component state
2. **Check Network Tab** - Monitor API requests and responses
3. **Console Logging** - Add temporary logs to trace data flow
4. **Vite HMR** - Changes auto-reload; if not, restart dev server

---

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `/api` | Backend API base URL |
| `VITE_UPLOADS_URL` | `''` | Base URL for uploaded files |

### Production Values (`.env.production`)

```
VITE_API_URL=https://zelanbe-production.up.railway.app/api
VITE_UPLOADS_URL=https://zelanbe-production.up.railway.app
```

Create a `.env.local` file for local overrides (not committed to git).

---

## Build & Deployment

### Vite Dev Server

The dev server runs on port **5173** with proxy configuration in `vite.config.js`:

```javascript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'https://zelanbe-production.up.railway.app',
      changeOrigin: true,
    },
    '/uploads': {
      target: 'https://zelanbe-production.up.railway.app',
      changeOrigin: true,
    }
  }
}
```

### Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.2.0 | UI framework |
| `react-dom` | ^18.2.0 | React DOM renderer |
| `react-router-dom` | ^6.20.1 | Client-side routing |
| `axios` | ^1.6.2 | HTTP client |
| `vite` | ^5.0.0 | Build tool & dev server |
| `@vitejs/plugin-react` | ^4.2.0 | React support for Vite |
