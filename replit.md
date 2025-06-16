# Docdot - Medical Education Platform

## Overview

Docdot is a comprehensive medical education platform built with React/TypeScript frontend and Node.js/Express backend. The application provides interactive quizzes, study tools, AI-powered learning assistance, and collaborative features for medical students. It integrates with Supabase for authentication and database management, and uses Drizzle ORM for database operations.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Library**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom theming
- **State Management**: TanStack Query for server state, React Context for global state
- **Authentication**: Supabase Auth with custom AuthContext wrapper

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Authentication**: Supabase Auth integration
- **API Design**: RESTful endpoints with Express routes

### Build System
- **Frontend**: Vite with React plugin
- **Backend**: ESBuild for production builds
- **Development**: tsx for TypeScript execution
- **Package Manager**: npm

## Key Components

### Authentication System
- Supabase authentication with email/password and OAuth (Google, Apple)
- JWT-based session management
- User profile synchronization between Supabase auth and application database
- Protected routes with authentication guards

### Database Schema
- **Users**: Extended user profiles with medical education context
- **Quiz System**: Questions, attempts, scoring, and analytics
- **Study Tools**: Flashcards, study sessions, timers, and planners
- **AI Integration**: Chat sessions, usage tracking, and AI-powered features
- **Social Features**: Study groups, leaderboards, and collaborative tools
- **Analytics**: Performance tracking, statistics, and progress monitoring

### AI Integration
- DeepSeek API integration for AI-powered tutoring
- Caching system for AI responses
- Multiple AI tools: quiz explanations, study assistance, and content generation
- Usage tracking and rate limiting

### Study Features
- Interactive quiz system with multiple categories
- Study timer with Pomodoro technique support
- Study planner with calendar integration
- Flashcard system with spaced repetition
- Study groups with video meeting integration (Zoom/Google Meet)

### Analytics & Gamification
- User statistics and performance tracking
- XP and leveling system
- Badge system for achievements
- Leaderboards for competitive learning
- Streak tracking and daily goals

## Data Flow

### Authentication Flow
1. User signs up/in through Supabase Auth
2. Authentication state synchronized with React Context
3. User profile created/updated in application database
4. Protected routes verify authentication status
5. API requests include authentication headers

### Quiz Flow
1. Questions loaded from JSON file or database
2. User attempts tracked in database
3. Real-time scoring and XP calculation
4. Statistics updated for analytics
5. AI explanations generated on demand

### Study Session Flow
1. User creates study session with timer/planner
2. Session data persisted to database
3. Progress tracked in real-time
4. Statistics updated on completion
5. Achievements unlocked based on performance

## External Dependencies

### Primary Services
- **Supabase**: Authentication, database hosting, real-time subscriptions
- **DeepSeek API**: AI-powered content generation and tutoring
- **Google Drive API**: Educational resource access and management
- **SendGrid**: Email notifications and reminders

### Key Libraries
- **Frontend**: React Query, Wouter, Shadcn/ui, Tailwind CSS
- **Backend**: Drizzle ORM, Express.js, Postgres client
- **Development**: Vite, TypeScript, ESLint, Prettier

### Authentication Providers
- Supabase Auth (primary)
- Google OAuth
- Apple OAuth

## Deployment Strategy

### Development Environment
- Replit hosting with Node.js 20 runtime
- PostgreSQL 16 database
- Hot reload with Vite HMR
- Environment variables for API keys and database connection

### Production Build
- Vite build for frontend static assets
- ESBuild compilation for backend
- Single-port deployment (port 5000)
- Static file serving through Express

### Environment Configuration
- Database URL configuration for Supabase
- API keys for external services
- Development/production environment detection
- CORS and security headers for production

### Performance Optimizations
- Query caching with TanStack Query
- AI response caching
- Database connection pooling
- Static asset optimization

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- June 16, 2025. Initial setup
- June 16, 2025. Comprehensive medical student logo integration - Added the professional medical student logo throughout the entire application including:
  * Landing page with animated logo display and visual enhancements
  * Navigation component with hover effects
  * Authentication forms
  * All main application pages (Home, Quiz, Study Guide, Leaderboard, Analytics, Badges, Notes, AI Tools)
  * Header sections with consistent branding
  * Footer components with inverted logo for dark backgrounds
  * Interactive elements with proper scaling and transitions
  * Maintained fallback support for all logo implementations
- June 16, 2025. Restored original Home page design - Reverted Home component to original marketing-focused layout with hero section, features grid, and call-to-action per user request