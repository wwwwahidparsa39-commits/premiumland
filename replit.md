# Overview

Premium Land is a Persian (Farsi) e-commerce web application for selling digital premium accounts and subscriptions. It features a storefront with product listings, a shopping cart, an announcement/banner system, and a simple admin panel for managing products and announcements. The entire UI is RTL (right-to-left) and uses the Vazirmatn Persian font.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend
- **Framework**: React with TypeScript, bundled by Vite
- **Routing**: Wouter (lightweight client-side router) with 4 pages: Home, Shop, Cart, Admin
- **State Management**: 
  - Server state via TanStack React Query (products, announcements fetched from API)
  - Cart state via a custom `useCart` hook that persists to localStorage
  - Theme state via React Context (`ThemeContext`) supporting dark/light modes
- **UI Components**: shadcn/ui component library (new-york style) built on Radix UI primitives with Tailwind CSS
- **Styling**: Tailwind CSS with CSS variables for theming, dark mode as default, cyan (#06b6d4) accent color with glow effects
- **RTL Support**: Full RTL layout using `dir="rtl"` and Vazirmatn Google Font
- **Notifications**: react-hot-toast for user-facing toasts
- **Admin Auth**: Simple client-side password check (password "1234"), no server-side auth

## Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript, executed via tsx
- **API Pattern**: RESTful JSON API under `/api/` prefix
- **Route Definition**: Shared route definitions in `shared/routes.ts` with Zod schemas for input validation and response types — used by both frontend and backend
- **Dev Server**: Vite dev server integrated as Express middleware with HMR support
- **Production**: Vite builds client to `dist/public`, esbuild bundles server to `dist/index.cjs`

## Shared Code
- `shared/schema.ts` — Drizzle ORM table definitions and Zod insert schemas for `products` and `announcements`
- `shared/routes.ts` — API route path constants, HTTP methods, input/output schemas shared between client and server

## Database
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL via `node-postgres` (pg) Pool
- **Connection**: `DATABASE_URL` environment variable required
- **Schema Push**: `npm run db:push` uses drizzle-kit to push schema to database
- **Tables**:
  - `products`: id (serial), title (text), description (text), price (integer), image (text, nullable), created_at (timestamp)
  - `announcements`: id (serial), title (text), description (text, nullable), image_url (text), button_text (text, nullable), button_link (text, nullable), is_active (boolean), order (integer), created_at (timestamp)

## API Endpoints
- `GET /api/products` — List all products
- `POST /api/products` — Create a product
- `PATCH /api/products/:id` — Update a product
- `DELETE /api/products/:id` — Delete a product
- `GET /api/announcements` — List all announcements
- `GET /api/announcements/active` — List active announcements only
- `POST /api/announcements` — Create an announcement
- `PATCH /api/announcements/:id` — Update an announcement
- `DELETE /api/announcements/:id` — Delete an announcement

## Build & Development
- `npm run dev` — Start development server with Vite HMR
- `npm run build` — Build client with Vite, bundle server with esbuild
- `npm run start` — Run production build
- `npm run db:push` — Push Drizzle schema to PostgreSQL

# External Dependencies

- **PostgreSQL** — Primary database, connected via `DATABASE_URL` environment variable
- **Google Fonts** — Vazirmatn font for Persian typography, loaded via CDN
- **Telegram** — Support link points to `t.me/permumland`
- **Replit Plugins** — `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner` used in development
- **No file upload** — Product images are URLs entered by the admin directly
- **No external auth service** — Admin authentication is a hardcoded client-side password