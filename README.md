# README.md

## Overview

This is a **Live TV Streaming Application** built to manage and watch Albanian TV channels. Users can browse channels by category, mark favorites, search, and stream video content through an HLS-compatible player. The application supports full CRUD operations for channel management with a modern, dark-themed cinematic UI.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (dark cinematic theme)
- **Video Playback**: react-player for HLS stream support
- **Forms**: react-hook-form with Zod validation via @hookform/resolvers

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Pattern**: RESTful endpoints under `/api/*` prefix
- **Build Tool**: esbuild for server bundling, Vite for client

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Migrations**: Drizzle Kit (`drizzle-kit push` for schema sync)
- **Connection**: node-postgres (pg) with connection pooling

### API Structure
- Routes defined in `shared/routes.ts` with Zod schemas for type-safe request/response validation
- Storage abstraction layer in `server/storage.ts` implementing `IStorage` interface
- Endpoints:
  - `GET /api/channels` - List all channels
  - `GET /api/channels/:id` - Get single channel
  - `POST /api/channels` - Create channel
  - `PUT /api/channels/:id` - Update channel
  - `DELETE /api/channels/:id` - Delete channel

### Shared Code
- `shared/schema.ts` - Database schema and Zod types shared between client/server
- `shared/routes.ts` - API route definitions with type-safe schemas
- Path aliases: `@/*` for client, `@shared/*` for shared code

### Development vs Production
- **Development**: Vite dev server with HMR, proxied through Express
- **Production**: Static file serving from `dist/public`, bundled server in `dist/index.cjs`

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable

### Key NPM Packages
- **drizzle-orm / drizzle-kit**: Database ORM and migration tooling
- **react-player**: Video streaming with HLS support
- **@tanstack/react-query**: Async state management
- **zod**: Runtime type validation
- **Radix UI**: Accessible component primitives (dialog, dropdown, tabs, etc.)

### Replit-Specific
- `@replit/vite-plugin-runtime-error-modal`: Error overlay in development
- `@replit/vite-plugin-cartographer`: Development tooling
- `@replit/vite-plugin-dev-banner`: Development banner

### Build Dependencies
- **Vite**: Frontend bundling and dev server
- **esbuild**: Server-side bundling for production
- **tsx**: TypeScript execution for development