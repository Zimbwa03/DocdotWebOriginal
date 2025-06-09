import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db } from "./db";
import { sql } from "drizzle-orm";

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
    const result = await db.execute(sql`SELECT NOW() as current_time, version() as db_version`);
    console.log('✅ Supabase connection successful!');
    console.log(`   Current time: ${result.rows[0].current_time}`);
    console.log(`   Database: ${result.rows[0].db_version.split(' ')[0]}`);

    // Test if main tables exist
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'user_stats', 'quiz_attempts', 'leaderboard')
      ORDER BY table_name
    `);

    const tableNames = tables.rows.map(row => row.table_name);
    console.log(`📊 Available tables: ${tableNames.join(', ')}`);

    if (tableNames.length < 4) {
      console.warn('⚠️  Some expected tables are missing. Make sure you ran the Supabase schema SQL.');
    }

  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    console.error('Please check your DATABASE_URL environment variable and ensure Supabase is properly configured.');
  }
}

(async () => {
  // Test database connection before starting server
  await testDatabaseConnection();

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
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`🚀 Server running on port ${port}`);
    log(`📱 App available at: http://localhost:${port}`);
  });
})();