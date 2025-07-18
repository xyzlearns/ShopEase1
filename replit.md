# E-commerce Application

## Overview

This is a full-stack e-commerce application built with React, Express.js, and TypeScript. The application provides a complete online shopping experience with product browsing, cart management, and checkout functionality. It features a modern UI built with shadcn/ui components and Tailwind CSS, with a robust backend API for handling products, cart operations, and order processing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite for fast development and building

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: Session-based cart tracking with local storage fallback
- **File Uploads**: Multer for handling payment screenshot uploads

## Key Components

### Frontend Components
- **Navigation**: Responsive navigation with mobile menu and cart indicator
- **Product Cards**: Reusable product display components with ratings and actions
- **Cart Management**: Sidebar cart and dedicated cart page with quantity controls
- **Forms**: React Hook Form with Zod validation for checkout
- **UI Library**: Complete set of shadcn/ui components (buttons, cards, dialogs, etc.)

### Backend Components
- **Storage Layer**: Abstracted storage interface with in-memory implementation
- **API Routes**: RESTful endpoints for products, cart, and orders
- **File Handling**: Google Drive integration for payment screenshot storage
- **Order Processing**: Complete checkout flow with order creation

### Database Schema
- **Products**: Product catalog with categories, prices, ratings, and descriptions
- **Cart Items**: Session-based cart storage with product references
- **Orders**: Customer orders with billing information and order items

## Data Flow

### Product Management
1. Products are seeded in memory storage with sample data
2. API endpoints serve products with optional category filtering
3. Frontend displays products in grid layouts with search and filter capabilities

### Cart Operations
1. Session ID generated client-side and stored in localStorage
2. Cart operations (add, update, remove) sent to backend with session ID
3. Backend maintains cart state per session
4. Real-time cart updates reflected in UI components

### Checkout Process
1. Customer fills out shipping and billing information
2. Optional payment screenshot upload
3. Order creation with cart items and customer details
4. Cart cleared after successful order placement

## External Dependencies

### UI and Styling
- **Radix UI**: Headless UI components for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Icon library for UI elements
- **Class Variance Authority**: Component variant management

### Data and API
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form handling and validation
- **Zod**: Schema validation for forms and API data
- **Date-fns**: Date manipulation utilities

### Database and Storage
- **Drizzle ORM**: TypeScript-first ORM for PostgreSQL
- **Neon Database**: Serverless PostgreSQL provider
- **Google APIs**: Integration for file storage and sheets

## Recent Changes

### Payment Security Improvements (July 18, 2025)
- **Payment Screenshot Requirement**: Orders now require payment screenshot upload before completion
- **File Validation**: Added client and server-side validation for file type (JPEG, JPG, PNG) and size (max 5MB)
- **UI Enhancements**: Added visual feedback for payment completion status and disabled button states
- **Order Status**: Changed order status from 'pending' to 'payment_uploaded' when screenshot is provided
- **Error Handling**: Improved error messages for payment-related failures

### Security Measures
- **Frontend Validation**: Complete Order button disabled until payment screenshot is uploaded
- **Backend Validation**: Server-side validation prevents order creation without payment screenshot
- **File Security**: Strict file type and size validation on both client and server
- **User Feedback**: Clear messaging about payment requirements and file upload status

## Deployment Strategy

### Development Environment
- **Dev Server**: Vite development server with HMR
- **API Server**: Express server with automatic restarts
- **Database**: Neon Database with connection pooling

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: esbuild bundles server code for Node.js
- **Database**: Drizzle migrations for schema management
- **Environment**: Production-ready Express server serving both API and static files

### Build Commands
- `npm run dev`: Start development servers
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run db:push`: Push database schema changes

The application follows modern full-stack patterns with clear separation of concerns, type safety throughout, and a focus on user experience with responsive design and smooth interactions.