# Academic Question Paper Repository

## Overview

This is a full-stack web application for managing and sharing academic question papers. The system allows students and administrators to upload, search, filter, and download previous years' question papers from various courses and universities. It features a modern React frontend with a comprehensive UI component library and an Express.js backend with PostgreSQL database storage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on top of Radix UI primitives
- **Styling**: Tailwind CSS with custom theming and CSS variables
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod schema validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit-based OIDC authentication with Passport.js
- **Session Management**: Express sessions with PostgreSQL session store
- **File Handling**: Multer for PDF file uploads with local filesystem storage
- **Development**: Hot module replacement via Vite integration

### Database Design
- **Primary Database**: PostgreSQL with Neon serverless connection
- **Session Storage**: Dedicated sessions table for user session persistence
- **User Management**: Users table storing profile information from OIDC provider
- **Document Storage**: Question papers table with metadata and file references
- **Schema Management**: Drizzle migrations for version control

### Authentication & Authorization
- **Provider**: Replit OIDC integration for seamless authentication
- **Session Strategy**: Server-side sessions with secure HTTP-only cookies
- **Access Control**: Route-level protection for admin functions
- **User Profiles**: Automatic user creation/update from OIDC claims

### File Management
- **Upload Strategy**: Local filesystem storage with organized directory structure
- **File Validation**: PDF-only uploads with size limitations (10MB)
- **Download Tracking**: Automatic increment of download counters
- **Security**: Filename sanitization and secure file serving

### API Design
- **Public Endpoints**: Question paper browsing and searching without authentication
- **Protected Endpoints**: Admin upload, management, and statistics with authentication
- **RESTful Structure**: Consistent HTTP methods and response patterns
- **Error Handling**: Centralized error middleware with proper status codes

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection via Neon
- **drizzle-orm**: Type-safe database ORM with PostgreSQL dialect
- **express**: Web application framework for Node.js
- **@tanstack/react-query**: Server state management for React

### Authentication Services
- **openid-client**: OIDC client implementation for Replit authentication
- **passport**: Authentication middleware for Express
- **express-session**: Session middleware with PostgreSQL store
- **connect-pg-simple**: PostgreSQL session store adapter

### UI Component Libraries
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library with React components
- **class-variance-authority**: Utility for creating variant-based component APIs

### Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **tsx**: TypeScript execution environment for Node.js

### File Processing
- **multer**: Multipart form data handling for file uploads
- **@types/multer**: TypeScript definitions for Multer

### Form & Validation
- **react-hook-form**: Performant forms with minimal re-renders
- **@hookform/resolvers**: Validation resolvers for React Hook Form
- **zod**: TypeScript-first schema validation
- **drizzle-zod**: Integration between Drizzle ORM and Zod schemas