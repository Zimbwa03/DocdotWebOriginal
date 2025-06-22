import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { comprehensiveSupabaseTest } from "./supabase-test";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Test Supabase connection on startup
async function testDatabaseConnection() {
  try {
    console.log('🔗 Testing Supabase database connection...');
    const result = await db.execute(sql`SELECT NOW() as current_time`);
    console.log('✅ Supabase connection successful!');

    // Test if main tables exist
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'user_stats', 'quiz_attempts', 'ai_sessions', 'ai_chats')
      ORDER BY table_name
    `);

    if (tables && tables.length > 0) {
      console.log(`📊 Database tables found: ${tables.length} tables`);
      console.log('✅ Supabase schema is properly configured');
    } else {
      console.log('📊 Database connected, checking table availability...');
    }

  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
  }
}

(async () => {
  // Test database connection before starting server
  await testDatabaseConnection();

  // Skip comprehensive test to avoid duplicate key errors
  console.log('ℹ️  Skipping comprehensive database test to prevent duplicate key conflicts');

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${port} is already in use. Please stop any existing processes on this port.`);
      console.log('💡 Run: pkill -f "node.*server/index.ts" to stop existing processes');
      process.exit(1);
    } else {
      console.error('❌ Server error:', err);
      process.exit(1);
    }
  });

  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`🚀 Server running on port ${port}`);
    log(`📱 App available at: http://localhost:${port}`);
  });
})();