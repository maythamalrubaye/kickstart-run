import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";

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

// Add direct file download routes
app.get('/download-android-final', (req, res) => {
  const filePath = path.join(process.cwd(), 'FINAL-WORKING-android-build.tar.gz');
  res.download(filePath, 'FINAL-WORKING-android-build.tar.gz');
});

app.get('/download-android-page', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Download Android Project</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 50px; background: #f5f5f5; }
            .container { background: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto; }
            .download-btn { background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 18px; display: inline-block; margin: 20px 0; }
            .download-btn:hover { background: #45a049; }
            pre { background: #333; color: #fff; padding: 15px; border-radius: 5px; overflow-x: auto; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Download Fixed Android Project</h1>
            <p>Click below to download your fixed KickStart Run Android project:</p>
            
            <a href="/download-android" class="download-btn">Download FIXED Android Project (.tar.gz)</a>
            
            <h3>Build Instructions:</h3>
            <pre>cd ~/Downloads
tar -xzf working-android-build.tar.gz
cd android
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
chmod +x gradlew
./gradlew clean bundleRelease</pre>
            
            <p><strong>Your AAB file will be at:</strong><br>
            <code>android/app/build/outputs/bundle/release/app-release.aab</code></p>
        </div>
    </body>
    </html>
  `);
});

(async () => {
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

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`YouthRunningTracker serving on port ${port}`);
    log(`Environment: ${process.env.NODE_ENV}`);
    log(`Access via: http://localhost:${port}`);
  });
})();
