# Docdot Web Application

A comprehensive medical education platform with AI-powered tutoring, quiz system, and lecture recording capabilities.

## 🚀 Production Ready

This application has been optimized for production deployment with all testing code removed and performance optimizations applied.

## Features

- **AI-Powered Tutoring**: Interactive AI sessions for medical education
- **Quiz System**: Comprehensive quiz functionality with progress tracking
- **Lecture Recording**: Record and manage educational content
- **User Analytics**: Track learning progress and performance
- **Real-time Chat**: Interactive AI chat for immediate assistance

## Quick Start

### Development
```bash
npm install
npm run dev
```

### Production
```bash
npm install
npm run deploy
```

## Environment Setup

Copy `env.example` to `.env` and configure your environment variables:

```bash
cp env.example .env
```

Required variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `DATABASE_URL` - Your database connection string
- `GEMINI_API_KEY` - Your Google Gemini API key

## Documentation

- [Production Deployment Guide](./PRODUCTION_DEPLOYMENT.md)
- [Lecture Setup Guide](./LECTURE_SETUP_GUIDE.md)
- [Lecture Recording Feature](./LECTURE_RECORDING_FEATURE.md)

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini, OpenAI, Anthropic
- **Build**: Vite, ESBuild

## License

MIT 
