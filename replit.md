# Overview

This is a shared investment tracking web application designed for two users (Alle and Ali) to manage and monitor their joint investments. The application provides a dashboard interface for viewing portfolio performance, adding new investments, tracking transaction history, and managing participant information. Alle has administrator privileges allowing full CRUD operations, while Ali has viewer-only access.

The application is built as a full-stack TypeScript project with a React frontend and Express.js backend, featuring a modern dark-themed UI built with shadcn/ui components and Tailwind CSS.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite with React plugin and custom aliases

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints under `/api` prefix
- **Request Handling**: Express middleware for JSON parsing, logging, and error handling
- **Development**: Hot module replacement with Vite integration

## Authentication & Authorization
- **Simple Username-Based Auth**: No passwords, users select their profile (Alle or Ali)
- **Role-Based Access Control**: Admin role for full access, viewer role for read-only access
- **Session Management**: Client-side user state management via React Context

## Data Storage
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Development Storage**: In-memory storage implementation for development/testing

## Data Models
- **Users**: Simple user profiles with username, display name, and role
- **Investments**: Financial instruments with ownership percentages, values, and metadata
- **Transactions**: Audit trail of all investment-related actions with timestamps

## UI/UX Design Patterns
- **Responsive Design**: Mobile-first approach with collapsible sidebar navigation
- **Theme System**: Dark/light mode toggle with CSS custom properties
- **Component Library**: Consistent design system using shadcn/ui components
- **Form Handling**: React Hook Form with Zod validation for type safety

# External Dependencies

## Database & ORM
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe ORM for database operations
- **drizzle-zod**: Integration between Drizzle schemas and Zod validation

## Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight client-side routing
- **react-hook-form**: Form handling and validation
- **@hookform/resolvers**: Zod resolver for form validation

## UI Components & Styling
- **@radix-ui/react-***: Headless UI primitives for accessibility
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

## Development Tools
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **@replit/vite-plugin-***: Replit-specific development plugins