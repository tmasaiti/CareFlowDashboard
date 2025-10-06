# ProjectFrost Care Management Portal

## Overview

ProjectFrost is a healthcare care management web application designed for healthcare professionals (specifically doctors like Dr. Evelyn Reed) to manage patients, create and monitor care plans, and track comprehensive medical histories. The application provides a dashboard for viewing patient statistics, managing tasks, tracking alerts, and maintaining detailed patient records with medical histories and communication logs.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**Routing**: Wouter for client-side routing

**State Management**: 
- TanStack React Query for server state and API calls
- Dexie (IndexedDB wrapper) for local client-side database storage
- React hooks for component-level state

**UI Component System**:
- Shadcn/ui components built on Radix UI primitives
- Tailwind CSS for styling with custom healthcare-optimized design system
- Material Design philosophy with medical UI patterns
- Dual theme support (light/dark mode) with healthcare-specific color coding for status indicators

**Design System**:
- Custom color palette optimized for medical contexts with distinct status indicators (Done/Green, Pending/Yellow, Critical/Red, etc.)
- Responsive layouts supporting mobile through desktop
- Information-dense interfaces prioritizing clinical data clarity
- Professional medical aesthetic balancing precision with approachability

### Backend Architecture

**Server Framework**: Express.js running on Node.js

**API Design**: RESTful endpoints prefixed with `/api`

**Data Storage Interface**: Abstract storage layer (IStorage interface) with in-memory implementation (MemStorage)
- Designed to support future database integration
- Currently uses Map-based in-memory storage for users
- Supports CRUD operations through defined interface methods

**Development Setup**:
- Vite middleware integration for HMR in development
- Custom logging middleware for API requests
- Error handling middleware for standardized error responses

### Data Architecture

**Client-Side Database (Dexie/IndexedDB)**:

Currently stores all application data locally:
- **Patients**: Comprehensive patient demographics, contact info, medical record numbers, insurance details
- **Medical History**: Diagnoses, allergies, medications, procedures with severity and status tracking
- **Care Plans**: Patient-specific care plans with goals, interventions, and progress tracking
- **Care Plan Templates**: Reusable templates categorized by age, health condition, needs, or impairment type
- **Tasks**: Care-related tasks with status, priority, due dates
- **Communications**: Patient communication logs with methods and notes

**Data Models**:
- TypeScript interfaces define strict typing for all entities
- Status enums for patients (Active, On-hold, Discharged) and tasks (done, pending, onhold, critical, missed, arrived)
- Relational structure using patient IDs to link medical history, care plans, and communications

### Authentication & Session Management

**Current State**: Placeholder authentication system
- Login page accepts username/password
- No actual authentication validation implemented
- Mock redirect to dashboard on login
- Designed to integrate with PostgreSQL session storage (connect-pg-simple package included)

**Planned Architecture**:
- PostgreSQL-backed session management
- User schema defined in shared/schema.ts with Drizzle ORM
- Zod validation for user input

### Build & Deployment

**Build Process**:
- Vite bundles frontend to `dist/public`
- esbuild bundles backend to `dist` with ESM format
- TypeScript compilation without emit for type checking

**Development**:
- Hot Module Replacement via Vite
- Replit-specific plugins for development experience
- Source maps for debugging

**Production**:
- Static frontend serving from Express
- Environment-based configuration
- HTTPS/SSL support expected for production deployment

## External Dependencies

### Core Framework Dependencies
- **React 18**: UI framework with TypeScript
- **Express**: Backend web server
- **Vite**: Frontend build tool and dev server
- **Wouter**: Lightweight client-side routing

### Database & ORM
- **Drizzle ORM**: TypeScript ORM configured for PostgreSQL
- **Drizzle Kit**: Schema management and migrations
- **@neondatabase/serverless**: PostgreSQL serverless driver
- **Dexie**: IndexedDB wrapper for client-side storage
- **connect-pg-simple**: PostgreSQL session store for Express (configured but not yet active)

### UI Component Libraries
- **Radix UI**: Headless component primitives (Dialog, Dropdown, Select, Tabs, Toast, etc.)
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **Lucide React**: Icon library

### Form & Validation
- **React Hook Form**: Form state management
- **@hookform/resolvers**: Form validation resolvers
- **Zod**: Runtime type validation and schema validation

### State Management & Data Fetching
- **TanStack React Query**: Server state management and caching
- **Dexie React Hooks**: React integration for IndexedDB queries

### Development Tools
- **TypeScript**: Type safety across the stack
- **PostCSS & Autoprefixer**: CSS processing
- **@replit/vite-plugin-***: Replit-specific development enhancements

### Date & Time
- **date-fns**: Date manipulation and formatting library

### Session & Security
- **express-session**: Session middleware (configured for future use)
- Database URL required for PostgreSQL connection (environment variable: DATABASE_URL)

### Planned Integrations
- PostgreSQL database (schema defined, ready for migration via Drizzle)
- Secure HTTPS deployment with dedicated IP
- Session-based authentication with PostgreSQL storage