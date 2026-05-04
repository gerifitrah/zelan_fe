# Zelan Bakery & Cake - Frontend

A modern, responsive React single-page application for Zelan Bakery & Cake shop featuring a customer-facing menu display and an admin dashboard for content management.

## Features

### Customer-Facing
- **Dynamic Menu Display** - Browse menu items with category filtering
- **Voice Descriptions** - Hover over menu items to hear audio descriptions (MP3 or text-to-speech)
- **Featured Items** - Highlighted items with animated badges
- **Promotional Specials** - Current offers and promotions section
- **FAQ Section** - Expandable accordion-style frequently asked questions
- **Contact Information** - Location map, business hours, and social media links
- **Responsive Design** - Optimized for mobile, tablet, and desktop

### Admin Dashboard
- **Menu Management** - Create, edit, and delete menu items with images and voice files
- **Category Management** - Organize menu items by categories
- **FAQ Management** - Manage frequently asked questions
- **Specials/Promotions** - Create and manage promotional content
- **Dashboard Statistics** - Overview of total items, categories, and featured items
- **Search & Filtering** - Find items quickly with search and category filters

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 18.2.0 |
| Routing | React Router DOM 6.20.1 |
| Build Tool | Vite 5.0.0 |
| HTTP Client | Axios 1.6.2 |
| Styling | CSS with Custom Properties |
| Fonts | Playfair Display, Josefin Sans (Google Fonts) |

## Prerequisites

- Node.js 16+ (recommended: Node 18 or higher)
- npm 8+ (comes with Node.js)
- Backend API server running (see backend repository)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd restaurant-app/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables** (optional)

   Create a `.env` file in the frontend root:
   ```env
   VITE_API_URL=/api
   VITE_UPLOADS_URL=
   ```

   For production, set these to your actual API endpoints.

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview production build locally |

## Project Structure

```
frontend/
├── public/                  # Static assets
│   ├── logo-light.png       # Logo variations
│   ├── logo-dark.png
│   └── owners.jpg           # About section image
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── MenuCard.jsx     # Menu item card with voice feature
│   │   └── MenuCard.css
│   ├── pages/               # Page components
│   │   ├── HomePage.jsx     # Public landing page
│   │   ├── LoginPage.jsx    # Admin login
│   │   └── AdminPage.jsx    # Admin dashboard
│   ├── services/
│   │   └── api.js           # Axios API client configuration
│   ├── styles/
│   │   └── global.css       # Global styles and CSS variables
│   └── main.jsx             # Application entry point
├── index.html               # HTML template
├── vite.config.js           # Vite configuration
└── package.json             # Dependencies and scripts
```

## Environment Configuration

### Development
The development server proxies API requests to `http://localhost:3000`:
- `/api` routes proxy to backend API
- `/uploads` routes proxy to backend file server

### Production
Set environment variables for your production API:
```env
VITE_API_URL=https://your-api-domain.com/api
VITE_UPLOADS_URL=https://your-api-domain.com
```

## API Integration

The frontend communicates with a backend API for:
- **Categories** - Menu category CRUD operations
- **Menu Items** - Menu item CRUD with file uploads
- **Specials** - Promotional content management
- **FAQs** - Frequently asked questions CRUD
- **Authentication** - Admin login/logout
- **Statistics** - Dashboard metrics

See [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) for detailed API documentation.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Responsive Breakpoints

| Breakpoint | Target |
|------------|--------|
| > 768px | Desktop |
| 768px | Tablet |
| 640px | Mobile Landscape |
| 480px | Mobile Portrait |

## License

Private - All rights reserved.

## Related

- Backend API repository (see parent directory)
