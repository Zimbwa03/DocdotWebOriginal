# Production Deployment Guide

## Overview
This guide covers deploying the Docdot Web Application to production after removing all testing code and optimizing for production use.

## Prerequisites
- Node.js 18+ installed
- Environment variables configured
- Database (Supabase) properly set up
- Domain and hosting service ready

## Environment Setup

### 1. Environment Variables
Create a `.env` file with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
DATABASE_URL=your-database-connection-string

# AI Configuration
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# Server Configuration
NODE_ENV=production
PORT=5000
```

### 2. Database Setup
Ensure your Supabase database is properly configured with all required tables:
- `users`
- `user_stats`
- `quiz_attempts`
- `ai_sessions`
- `ai_chats`
- `category_stats`
- `daily_stats`

## Deployment Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Application
```bash
npm run build
```

### 3. Start Production Server
```bash
npm run start:prod
```

### 4. Alternative: Deploy Command
```bash
npm run deploy
```

## Production Features

### Optimizations Made
- ✅ Removed all test files and debug code
- ✅ Simplified logging for production
- ✅ Optimized database connection verification
- ✅ Cleaned up unnecessary SQL migration files
- ✅ Updated environment configuration
- ✅ Added production deployment scripts

### Performance Considerations
- Database connection is verified on startup
- Simplified logging reduces overhead
- Production-optimized error handling
- Static file serving for client assets

## Monitoring

### Health Check
The application includes a basic health check through the database connection verification on startup.

### Logging
Production logging includes:
- API request/response times
- Error messages
- Database connection status

## Security Considerations
- Environment variables are properly configured
- Database connections use secure credentials
- API endpoints are protected with proper authentication
- CORS and security headers are configured

## Troubleshooting

### Common Issues
1. **Database Connection Failed**: Check your DATABASE_URL and Supabase credentials
2. **Port Already in Use**: Ensure port 5000 is available or change the PORT environment variable
3. **Build Errors**: Run `npm run check` to verify TypeScript compilation

### Support
For production issues, check:
1. Environment variable configuration
2. Database connectivity
3. API key validity
4. Server logs for specific error messages

## Maintenance
- Regularly update dependencies
- Monitor database performance
- Review and rotate API keys as needed
- Keep backup of production environment variables
