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
│    /        → HomePage                                      │
│    /login   → LoginPage                                     │
│    /admin/* → AdminPage (Protected)                         │
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
--terracotta: #C75B39;      /* Primary CTA buttons */
--gold: #D4A853;            /* Pricing, highlights */
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
| `HomePage.jsx` | `/` | Customer-facing landing page |
| `LoginPage.jsx` | `/login` | Admin authentication |
| `AdminPage.jsx` | `/admin` | Protected admin dashboard |

### Reusable Components

Located in `src/components/`:

| Component | Props | Description |
|-----------|-------|-------------|
| `MenuCard` | `item`, `uploadsUrl` | Displays menu item with voice feature |

### MenuCard Component

The `MenuCard` component handles:
- Image display with hover zoom effect
- Voice playback on hover (MP3 priority, TTS fallback)
- Featured badge with animation
- Custom tag display

```jsx
<MenuCard
  item={{
    id: 1,
    name: "Chocolate Cake",
    price: "25.00",
    displayPrice: "Rp 25.000",
    description: "Rich chocolate cake",
    image: "/uploads/images/cake.jpg",
    voiceFile: "/uploads/audio/cake.mp3",
    voiceDescription: "Delicious chocolate cake",
    featured: true,
    tag: "Best Seller"
  }}
  uploadsUrl="http://localhost:3000"
/>
```

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

**Solution**: Ensure the backend server is running on port 3000. The Vite dev server proxies `/api` requests to `http://localhost:3000`.

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

#### Voice Not Playing on Hover

**Problem**: Menu item voice doesn't play

**Solution**:
1. Check browser autoplay policies (user interaction may be required)
2. Verify the MP3 file exists at the specified path
3. Check browser console for audio errors
4. Ensure text-to-speech fallback is working (check `speechSynthesis` support)

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

Create a `.env.local` file for local overrides (not committed to git).
