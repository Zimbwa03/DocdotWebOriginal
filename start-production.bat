@echo off
REM Docdot Web Application - Production Startup Script for Windows

echo 🚀 Starting Docdot Web Application in Production Mode...

REM Check if .env file exists
if not exist .env (
    echo ❌ Error: .env file not found!
    echo Please copy env.example to .env and configure your environment variables.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist node_modules (
    echo 📦 Installing dependencies...
    npm install
)

REM Build the application
echo 🔨 Building application...
npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed! Please check the errors above.
    pause
    exit /b 1
)

REM Start the production server
echo 🌟 Starting production server...
npm run start:prod
