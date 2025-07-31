import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertChallengeSchema } from "@shared/schema";
import { sharingStreakService } from "./sharing-streak-service";
import { hash, compare } from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

interface SessionUser {
  id: number;
  email: string;
  athleteName: string;
  schoolClub?: string;
  age: number;
  subscriptionActive: boolean;  
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  trialStartDate?: Date | null;
}

declare global {
  namespace Express {
    interface User extends SessionUser {}
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      service: "YouthRunningTracker",
      environment: process.env.NODE_ENV 
    });
  });

  // Download ACTUAL app AAB file endpoint  
  app.get("/kickstart-run-release.aab", async (req, res) => {
    const { join } = await import('path');
    const filePath = join(process.cwd(), 'kickstart-run-ACTUAL.aab');
    res.download(filePath, 'kickstart-run-ACTUAL.aab', (err) => {
      if (err) {
        console.error('Error downloading actual app AAB file:', err);
        res.status(404).send('Actual app AAB file not found');
      }
    });
  });

  // Download page for ACTUAL app AAB file
  app.get("/download-aab", async (req, res) => {
    const { readFileSync, existsSync } = await import('fs');
    const { join } = await import('path');
    const htmlPath = join(process.cwd(), 'download-actual-app.html');
    
    if (existsSync(htmlPath)) {
      res.sendFile(htmlPath);
    } else {
      res.status(404).send('Download page not found');
    }
  });

  // Apple Store iPad screenshots
  app.get("/apple-store-fixes", async (req, res) => {
    const { readFileSync, existsSync } = await import('fs');
    const { join } = await import('path');
    const htmlPath = join(process.cwd(), 'apple-export-compliance-guide.html');
    
    if (existsSync(htmlPath)) {
      res.sendFile(htmlPath);
    } else {
      res.status(404).send('Apple Store guide not found');
    }
  });

  // Download iPad screenshots zip
  app.get("/download-ipad-screenshots", async (req, res) => {
    const { join } = await import('path');
    const filePath = join(process.cwd(), 'ipad-screenshots-for-apple-store.zip');
    res.download(filePath, 'ipad-screenshots-for-apple-store.zip', (err) => {
      if (err) {
        console.error('Error downloading iPad screenshots:', err);
        res.status(404).send('Screenshots zip not found - please create screenshots first');
      }
    });
  });

  // Download Android AAB
  app.get("/download-android-aab", async (req, res) => {
    const { join } = await import('path');
    const { existsSync } = await import('fs');
    const aabFiles = [
      'kickstart-run-FINAL.aab',           // Final working AAB
      'kickstart-run-VALIDATED.aab',       // Previous attempt
      'kickstart-run-FIXED.aab',           // Previous attempt
      'kickstart-run-PROPER-ANDROID.aab',
      'kickstart-run-ACTUAL.aab', 
      'kickstart-run-complete.aab'
    ];
    
    // Find the most recent AAB file
    let aabFile = null;
    for (const file of aabFiles) {
      const filePath = join(process.cwd(), file);
      if (existsSync(filePath)) {
        aabFile = filePath;
        break;
      }
    }
    
    if (aabFile) {
      res.download(aabFile, 'kickstart-run-android.aab', (err) => {
        if (err) {
          console.error('Error downloading AAB:', err);
          res.status(404).send('AAB download failed');
        }
      });
    } else {
      res.status(404).send('No AAB file found - please build Android app first');
    }
  });

  // Android AAB download page
  app.get("/android-aab-download", async (req, res) => {
    const { join } = await import('path');
    const filePath = join(process.cwd(), 'download-android-aab.html');
    res.sendFile(filePath);
  });

  // Google Play troubleshooting guide
  app.get("/google-play-troubleshooting", async (req, res) => {
    const { join } = await import('path');
    const filePath = join(process.cwd(), 'google-play-troubleshooting.html');
    res.sendFile(filePath);
  });

  // GitHub Actions cloud build solution
  app.get("/github-aab-build", async (req, res) => {
    const { join } = await import('path');
    const filePath = join(process.cwd(), 'github-aab-download.html');
    res.sendFile(filePath);
  });

  // GitHub setup instructions
  app.get("/github-setup-instructions.md", async (req, res) => {
    const { join } = await import('path');
    const filePath = join(process.cwd(), 'github-setup-instructions.md');
    res.sendFile(filePath);
  });

  // Download GitHub workflow file
  app.get("/github-workflow-download", async (req, res) => {
    const { join } = await import('path');
    const filePath = join(process.cwd(), '.github/workflows/build-android.yml');
    res.download(filePath, 'build-android.yml');
  });

  // Download essential files page
  app.get("/download-essential-files", async (req, res) => {
    const { join } = await import('path');
    const filePath = join(process.cwd(), 'download-essential-files.html');
    res.sendFile(filePath);
  });

  // Upload guide
  app.get("/upload-screenshots-guide.html", async (req, res) => {
    const { join } = await import('path');
    res.sendFile(join(process.cwd(), 'upload-screenshots-guide.html'));
  });

  // Simple upload interface
  app.get("/simple-upload", async (req, res) => {
    const { join } = await import('path');
    const filePath = join(process.cwd(), 'simple-upload.html');
    res.sendFile(filePath);
  });

  // Screenshot tool instructions
  app.get("/ipad-screenshots", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
          <title>iPad Screenshots for Apple App Store</title>
          <style>
              body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px; background: #f5f5f7; }
              .container { max-width: 800px; margin: 0 auto; }
              .screenshots { display: grid; gap: 20px; }
              .screenshot-item { padding: 20px; background: white; border-radius: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .screenshot-link { color: #007aff; text-decoration: none; font-size: 18px; font-weight: 600; }
              .screenshot-link:hover { text-decoration: underline; }
              .instructions { background: #e3f2fd; padding: 25px; border-radius: 15px; margin-bottom: 30px; border: 1px solid #2196f3; }
              h1 { color: #1d1d1f; text-align: center; }
              h3 { color: #1d1d1f; margin-top: 0; }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>📱 iPad Screenshots for Apple App Store</h1>
              
              <div class="instructions">
                  <h3>Instructions for Real App Screenshots (2048x2732):</h3>
                  <ol>
                      <li><strong>Login:</strong> Use test@kickstartrun.com / TestPass123!</li>
                      <li><strong>Browser Setup:</strong> Open Developer Tools → Device Mode → Set to 2048x2732</li>
                      <li><strong>Navigate:</strong> Take screenshots of the 5 pages below</li>
                      <li><strong>Save:</strong> Save each as PNG with exact filename shown</li>
                      <li><strong>Download:</strong> Use download link to get zip file for Mac</li>
                  </ol>
              </div>
              
              <div class="screenshots">
                  <div class="screenshot-item">
                      <a href="/" class="screenshot-link" target="_blank">
                          📊 Dashboard (/)
                      </a>
                      <p><strong>Save as:</strong> kickstart-run-ipad-dashboard-2048x2732.png</p>
                      <small>Main dashboard with performance stats and activity overview</small>
                  </div>
                  
                  <div class="screenshot-item">
                      <a href="/activity-tracker" class="screenshot-link" target="_blank">
                          🏃 Activity Tracker (/activity-tracker)
                      </a>
                      <p><strong>Save as:</strong> kickstart-run-ipad-activity-tracker-2048x2732.png</p>
                      <small>GPS tracking interface with live activity monitoring</small>
                  </div>
                  
                  <div class="screenshot-item">
                      <a href="/challenges" class="screenshot-link" target="_blank">
                          🏆 Challenges (/challenges)
                      </a>
                      <p><strong>Save as:</strong> kickstart-run-ipad-challenges-2048x2732.png</p>
                      <small>Age-appropriate challenges and achievement system</small>
                  </div>
                  
                  <div class="screenshot-item">
                      <a href="/leaderboard" class="screenshot-link" target="_blank">
                          🥇 Leaderboard (/leaderboard)
                      </a>
                      <p><strong>Save as:</strong> kickstart-run-ipad-leaderboard-2048x2732.png</p>
                      <small>School and club rankings with privacy controls</small>
                  </div>
                  
                  <div class="screenshot-item">
                      <a href="/profile" class="screenshot-link" target="_blank">
                          👤 Profile (/profile)
                      </a>
                      <p><strong>Save as:</strong> kickstart-run-ipad-profile-2048x2732.png</p>
                      <small>Student athlete profile with COPPA compliance</small>
                  </div>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                  <a href="/upload-screenshots-guide.html" style="background: #28a745; color: white; padding: 15px 30px; border-radius: 10px; text-decoration: none; font-weight: bold; margin-right: 10px;">
                      📤 Upload Screenshots
                  </a>
                  <a href="/download-ipad-screenshots" style="background: #007aff; color: white; padding: 15px 30px; border-radius: 10px; text-decoration: none; font-weight: bold;">
                      📥 Download Zip
                  </a>
                  <p><small>Take screenshots → Upload them → Download zip for Apple Store</small></p>
              </div>
              
              <div class="instructions">
                  <h3>🚀 Next Steps After Screenshots:</h3>
                  <ol>
                      <li><strong>Export Compliance:</strong> Go to App Information → Export Compliance → Answer "No" to cryptography</li>
                      <li><strong>Upload Screenshots:</strong> Add all 5 iPad screenshots to 13-inch iPad Display section</li>
                      <li><strong>Submit:</strong> Review will start automatically once both issues are resolved</li>
                  </ol>
              </div>
          </div>
      </body>
      </html>
    `);
  });

  // Privacy Policy route - Direct HTML for App Store submission
  app.get("/privacy", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Privacy Policy - KickStart Run</title>
          <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
          <div class="min-h-screen bg-gradient-to-br from-green-50 to-cream-50">
              <!-- Header -->
              <header class="bg-white/90 backdrop-blur-sm border-b border-green-100 sticky top-0 z-50">
                  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div class="flex justify-between items-center h-16">
                          <div class="flex items-center space-x-3">
                              <div class="w-10 h-10 bg-gradient-to-br from-green-600 to-green-500 rounded-xl flex items-center justify-center">
                                  <span class="text-white font-bold text-lg">KS</span>
                              </div>
                              <div>
                                  <h1 class="text-xl font-bold text-gray-900">KickStart Run</h1>
                                  <p class="text-xs text-green-600">Youth Athletics Platform</p>
                              </div>
                          </div>
                      </div>
                  </div>
              </header>

              <!-- Privacy Policy Content -->
              <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                  <div class="bg-white rounded-2xl shadow-lg p-8">
                      <h1 class="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
                      <p class="text-gray-600 mb-8">Last updated: January 29, 2025</p>

                      <div class="prose prose-lg max-w-none">
                          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">Introduction</h2>
                          <p class="text-gray-700 mb-6">
                              KickStart Run ("we," "our," or "us") is committed to protecting the privacy and safety of young athletes.
                              This Privacy Policy explains how we collect, use, and protect information when you use our youth running
                              performance application designed for ages 6-18.
                          </p>

                          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">COPPA Compliance</h2>
                          <p class="text-gray-700 mb-6">
                              We fully comply with the Children's Online Privacy Protection Act (COPPA). For users under 13 years of age:
                          </p>
                          <ul class="list-disc list-inside text-gray-700 mb-6 space-y-2">
                              <li>We require verifiable parental consent before collecting any personal information</li>
                              <li>Parents have the right to review, delete, or refuse further collection of their child's information</li>
                              <li>We do not condition participation on providing more information than necessary</li>
                              <li>We provide clear notices about our information practices</li>
                          </ul>

                          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">Information We Collect</h2>
                          <h3 class="text-xl font-semibold text-gray-900 mt-6 mb-3">Personal Information</h3>
                          <ul class="list-disc list-inside text-gray-700 mb-6 space-y-2">
                              <li>Name and age (for age-appropriate content and COPPA compliance)</li>
                              <li>Email address (parent/guardian email for users under 13)</li>
                              <li>School or club affiliation (optional, for leaderboards)</li>
                              <li>Account credentials (encrypted passwords)</li>
                          </ul>

                          <h3 class="text-xl font-semibold text-gray-900 mt-6 mb-3">Fitness and Health Data</h3>
                          <ul class="list-disc list-inside text-gray-700 mb-6 space-y-2">
                              <li>GPS location data during running sessions (for distance tracking and verification)</li>
                              <li>Running distance, time, and pace metrics</li>
                              <li>Challenge completion and performance analytics</li>
                              <li>Progress tracking and achievement data</li>
                          </ul>

                          <h3 class="text-xl font-semibold text-gray-900 mt-6 mb-3">Usage Data</h3>
                          <ul class="list-disc list-inside text-gray-700 mb-6 space-y-2">
                              <li>App usage patterns and feature interactions</li>
                              <li>Device information (type, operating system, app version)</li>
                              <li>Log data (IP address, access times, pages viewed)</li>
                          </ul>

                          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">How We Use Your Information</h2>
                          <ul class="list-disc list-inside text-gray-700 mb-6 space-y-2">
                              <li><strong>GPS Tracking:</strong> Used for tracking purposes to enable AI coaching through our Adaptive Difficulty Challenge Scaling system</li>
                              <li><strong>Performance Analytics:</strong> To provide personalized challenges and coaching suggestions</li>
                              <li><strong>Progress Tracking:</strong> To monitor athletic development and achievement unlocking</li>
                              <li><strong>Safety Monitoring:</strong> To ensure age-appropriate activities and content</li>
                              <li><strong>Account Management:</strong> To maintain user accounts and provide customer support</li>
                              <li><strong>Communication:</strong> To send important safety information and account updates</li>
                          </ul>

                          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">Information Sharing</h2>
                          <p class="text-gray-700 mb-6">
                              We do not sell, trade, or otherwise transfer personal information to third parties except:
                          </p>
                          <ul class="list-disc list-inside text-gray-700 mb-6 space-y-2">
                              <li>With explicit parental consent (for users under 13)</li>
                              <li>To comply with legal obligations or protect safety</li>
                              <li>With trusted service providers who assist in app operation (under strict confidentiality agreements)</li>
                              <li>For school/club leaderboards (only with explicit consent and limited to athletic performance data)</li>
                          </ul>

                          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">Data Security</h2>
                          <p class="text-gray-700 mb-6">
                              We implement enterprise-grade security measures including:
                          </p>
                          <ul class="list-disc list-inside text-gray-700 mb-6 space-y-2">
                              <li>Encrypted data transmission and storage</li>
                              <li>Regular security audits and updates</li>
                              <li>Limited access controls for staff</li>
                              <li>Secure payment processing through Stripe</li>
                              <li>Age-appropriate content filtering</li>
                          </ul>

                          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">Your Rights</h2>
                          <p class="text-gray-700 mb-6">
                              You have the right to:
                          </p>
                          <ul class="list-disc list-inside text-gray-700 mb-6 space-y-2">
                              <li>Access and review personal information</li>
                              <li>Request data correction or deletion</li>
                              <li>Withdraw consent for data collection</li>
                              <li>Export personal data</li>
                              <li>Opt out of non-essential data collection</li>
                              <li>Receive data breach notifications</li>
                          </ul>

                          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact Information</h2>
                          <p class="text-gray-700 mb-6">
                              For privacy questions, data requests, or COPPA-related inquiries, contact us at:
                          </p>
                          <div class="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                              <p class="text-gray-800"><strong>Email:</strong> contact@kickstartrun.com</p>
                              <p class="text-gray-800"><strong>Response Time:</strong> Within 72 hours</p>
                          </div>

                          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">Policy Updates</h2>
                          <p class="text-gray-700 mb-6">
                              We may update this Privacy Policy periodically. Parents and users will be notified of material changes
                              via email and in-app notifications. Continued use of the app constitutes acceptance of updated terms.
                          </p>

                          <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
                              <h3 class="text-lg font-semibold text-blue-900 mb-2">Youth Safety Commitment</h3>
                              <p class="text-blue-800">
                                  KickStart Run is designed with youth safety as our primary concern. We maintain the highest standards
                                  for data protection, age-appropriate content, and parental oversight to ensure a safe and positive
                                  experience for all young athletes.
                              </p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </body>
      </html>
    `);
  });

  // Safety Guidelines route - Direct HTML
  app.get("/safety", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Safety Guidelines - KickStart Run</title>
          <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
          <div class="min-h-screen bg-gradient-to-br from-green-50 to-cream-50">
              <header class="bg-white/90 backdrop-blur-sm border-b border-green-100 sticky top-0 z-50">
                  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div class="flex justify-between items-center h-16">
                          <div class="flex items-center space-x-3">
                              <div class="w-10 h-10 bg-gradient-to-br from-green-600 to-green-500 rounded-xl flex items-center justify-center">
                                  <span class="text-white font-bold text-lg">KS</span>
                              </div>
                              <div>
                                  <h1 class="text-xl font-bold text-gray-900">KickStart Run</h1>
                                  <p class="text-xs text-green-600">Youth Athletics Platform</p>
                              </div>
                          </div>
                      </div>
                  </div>
              </header>

              <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                  <div class="bg-white rounded-2xl shadow-lg p-8">
                      <h1 class="text-4xl font-bold text-gray-900 mb-2">Youth Safety Guidelines</h1>
                      <p class="text-gray-600 mb-8">Comprehensive safety protocols for young athletes</p>
                      
                      <div class="prose prose-lg max-w-none">
                          <div class="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                              <h3 class="text-lg font-semibold text-red-900 mb-2">⚠️ Important Safety Notice</h3>
                              <p class="text-red-800">
                                  All physical activities carry inherent risks. Parents and guardians are fully responsible for supervising their children during all running activities.
                              </p>
                          </div>

                          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">Age-Appropriate Activity Limits</h2>
                          <div class="grid md:grid-cols-3 gap-6 mb-8">
                              <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                  <h3 class="text-lg font-semibold text-blue-900 mb-2">Ages 6-8</h3>
                                  <ul class="text-blue-800 space-y-1">
                                      <li>• Maximum: 1.5km per session</li>
                                      <li>• Focus: Fun and form</li>
                                      <li>• Duration: 15-20 minutes</li>
                                  </ul>
                              </div>
                              <div class="bg-green-50 border border-green-200 rounded-lg p-6">
                                  <h3 class="text-lg font-semibold text-green-900 mb-2">Ages 9-12</h3>
                                  <ul class="text-green-800 space-y-1">
                                      <li>• Maximum: 4.5km per session</li>
                                      <li>• Focus: Skill development</li>
                                      <li>• Duration: 30-40 minutes</li>
                                  </ul>
                              </div>
                              <div class="bg-purple-50 border border-purple-200 rounded-lg p-6">
                                  <h3 class="text-lg font-semibold text-purple-900 mb-2">Ages 13-18</h3>
                                  <ul class="text-purple-800 space-y-1">
                                      <li>• Maximum: 12km per session</li>
                                      <li>• Focus: Performance training</li>
                                      <li>• Duration: 45-90 minutes</li>
                                  </ul>
                              </div>
                          </div>

                          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">Safety Requirements</h2>
                          <ul class="list-disc list-inside text-gray-700 mb-6 space-y-2">
                              <li>Adult supervision required for all ages during outdoor activities</li>
                              <li>Proper running shoes and age-appropriate athletic clothing</li>
                              <li>Adequate hydration before, during, and after activities</li>
                              <li>Weather-appropriate safety measures (avoid extreme conditions)</li>
                              <li>Safe running environments away from traffic and hazards</li>
                              <li>Immediate medical attention for any injuries or distress</li>
                          </ul>

                          <div class="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
                              <h3 class="text-lg font-semibold text-amber-900 mb-2">🏥 Emergency Protocols</h3>
                              <p class="text-amber-800 mb-4">
                                  In case of injury, illness, or emergency during running activities:
                              </p>
                              <ol class="list-decimal list-inside text-amber-800 space-y-1">
                                  <li>Stop activity immediately</li>
                                  <li>Assess situation and provide first aid if trained</li>
                                  <li>Contact emergency services if needed (911/local emergency number)</li>
                                  <li>Notify parents/guardians immediately</li>
                                  <li>Document incident for safety review</li>
                              </ol>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </body>
      </html>
    `);
  });

  // Support Center route - Direct HTML
  app.get("/support", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Support Center - KickStart Run</title>
          <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
          <div class="min-h-screen bg-gradient-to-br from-green-50 to-cream-50">
              <header class="bg-white/90 backdrop-blur-sm border-b border-green-100 sticky top-0 z-50">
                  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div class="flex justify-between items-center h-16">
                          <div class="flex items-center space-x-3">
                              <div class="w-10 h-10 bg-gradient-to-br from-green-600 to-green-500 rounded-xl flex items-center justify-center">
                                  <span class="text-white font-bold text-lg">KS</span>
                              </div>
                              <div>
                                  <h1 class="text-xl font-bold text-gray-900">KickStart Run</h1>
                                  <p class="text-xs text-green-600">Youth Athletics Platform</p>
                              </div>
                          </div>
                      </div>
                  </div>
              </header>

              <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                  <div class="bg-white rounded-2xl shadow-lg p-8">
                      <h1 class="text-4xl font-bold text-gray-900 mb-2">Support Center</h1>
                      <p class="text-gray-600 mb-8">Get help with KickStart Run</p>
                      
                      <div class="prose prose-lg max-w-none">
                          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact Information</h2>
                          <div class="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                              <div>
                                  <h3 class="text-lg font-semibold text-green-900 mb-2">Contact Support</h3>
                                  <p class="text-green-800"><strong>Email:</strong> contact@kickstartrun.com</p>
                                  <p class="text-green-800"><strong>Response:</strong> Within 24 hours</p>
                                  <p class="text-green-800 mt-2">For all inquiries including privacy, safety, technical support, and general questions.</p>
                              </div>
                          </div>

                          <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">Frequently Asked Questions</h2>
                          
                          <div class="space-y-6">
                              <div class="border-l-4 border-blue-500 pl-6">
                                  <h3 class="text-lg font-semibold text-gray-900 mb-2">How do I create an account for my child?</h3>
                                  <p class="text-gray-700">Parents create accounts for children under 18. Visit our registration page, complete the parent account creation form, and you'll receive login credentials for your child.</p>
                              </div>

                              <div class="border-l-4 border-green-500 pl-6">
                                  <h3 class="text-lg font-semibold text-gray-900 mb-2">Is GPS tracking safe for children?</h3>
                                  <p class="text-gray-700">Yes, GPS data is only collected during running sessions with parental consent. We use this data exclusively for distance verification and personalized coaching. Location data is not shared with third parties.</p>
                              </div>

                              <div class="border-l-4 border-purple-500 pl-6">
                                  <h3 class="text-lg font-semibold text-gray-900 mb-2">What are the subscription costs?</h3>
                                  <p class="text-gray-700">KickStart Run offers a 30-day free trial, followed by a $9.99/month subscription. You can cancel anytime through your account settings.</p>
                              </div>

                              <div class="border-l-4 border-orange-500 pl-6">
                                  <h3 class="text-lg font-semibold text-gray-900 mb-2">How do school leaderboards work?</h3>
                                  <p class="text-gray-700">School leaderboards display all schools and their rankings. All students contribute points based on their GPS-verified running distance.</p>
                              </div>

                              <div class="border-l-4 border-red-500 pl-6">
                                  <h3 class="text-lg font-semibold text-gray-900 mb-2">How do I delete my child's account?</h3>
                                  <p class="text-gray-700">Contact contact@kickstartrun.com with your deletion request. We will permanently remove all personal data within 30 days in compliance with COPPA regulations.</p>
                              </div>
                          </div>

                          <div class="bg-red-50 border border-red-200 rounded-lg p-6 mt-8">
                              <h3 class="text-lg font-semibold text-red-900 mb-4">🗑️ Account Deletion Request</h3>
                              <p class="text-red-800 mb-4">
                                  <strong>For Parents:</strong> Request complete deletion of your child's account and all associated data.
                              </p>
                              <div class="space-y-3">
                                  <p class="text-red-800"><strong>Email:</strong> contact@kickstartrun.com</p>
                                  <p class="text-red-800"><strong>Subject:</strong> "Account Deletion Request"</p>
                                  <p class="text-red-800"><strong>Include:</strong> Child's name, parent email, and account details</p>
                                  <p class="text-red-800"><strong>Timeline:</strong> Complete data removal within 30 days</p>
                              </div>
                              <div class="bg-red-100 border border-red-300 rounded p-4 mt-4">
                                  <p class="text-red-900 text-sm">
                                      <strong>COPPA Compliance:</strong> We will permanently delete all personal information, 
                                      GPS data, performance records, and account information upon parental request.
                                  </p>
                              </div>
                          </div>

                          <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
                              <h3 class="text-lg font-semibold text-blue-900 mb-2">📱 Technical Support</h3>
                              <p class="text-blue-800 mb-4">
                                  For technical issues, app crashes, or GPS tracking problems:
                              </p>
                              <ol class="list-decimal list-inside text-blue-800 space-y-1">
                                  <li>Try restarting the app</li>
                                  <li>Check your internet connection</li>
                                  <li>Ensure location permissions are enabled</li>
                                  <li>Update to the latest app version</li>
                                  <li>Contact support with device and app version details</li>
                              </ol>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </body>
      </html>
    `);
  });

  // Simple test route to verify server connectivity
  app.get("/test", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>YouthRunningTracker - Server Test</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .status { color: #16a34a; font-weight: bold; }
          .info { background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .button { background: #16a34a; color: white; padding: 12px 24px; border: none; border-radius: 6px; text-decoration: none; display: inline-block; margin: 10px 5px; }
          .button:hover { background: #15803d; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🏃 YouthRunningTracker</h1>
          <p class="status">✅ Server Status: ONLINE</p>
          
          <div class="info">
            <h3>Server Information</h3>
            <p><strong>Service:</strong> YouthRunningTracker</p>
            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
            <p><strong>Environment:</strong> ${process.env.NODE_ENV}</p>
            <p><strong>Port:</strong> ${process.env.PORT || '5000'}</p>
          </div>
          
          <h3>Access the Application</h3>
          <p>The YouthRunningTracker app is running correctly. If you're seeing this page instead of the app:</p>
          
          <div>
            <a href="/" class="button">🏠 Go to Main App</a>
            <a href="/health" class="button">🔍 Health Check</a>
            <a href="javascript:window.location.reload(true)" class="button">🔄 Force Refresh</a>
          </div>
          
          <div class="info">
            <h4>Troubleshooting</h4>
            <p>1. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)</p>
            <p>2. Clear browser cache for this domain</p>
            <p>3. Try opening the app in a new browser tab</p>
            <p>4. If using Replit preview, click the refresh button in the preview frame</p>
          </div>
        </div>
      </body>
      </html>
    `);
  });
  
  // Use default memory session store to eliminate deserialization errors
  app.use(session({
    secret: process.env.SESSION_SECRET || 'kickstart-ai-secret-key-2025',
    resave: false,
    saveUninitialized: false,
    name: 'kickstart.sid',
    cookie: { 
      secure: false, 
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax'
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Passport configuration
  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await storage.getUserByEmail(email);
        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        const isValidPassword = await compare(password, user.password);
        if (!isValidPassword) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        // Check if account is pending parent consent
        if (user.accountStatus === 'pending_parent_consent') {
          return done(null, false, { message: 'Account pending parent approval' });
        }
        return done(null, {
          id: user.id,
          email: user.email,
          athleteName: user.athleteName,
          schoolClub: user.schoolClub ?? undefined,
          age: user.age,
          subscriptionActive: user.subscriptionActive ?? false,
          stripeCustomerId: user.stripeCustomerId ?? undefined,
          stripeSubscriptionId: user.stripeSubscriptionId ?? undefined,
          trialStartDate: user.trialStartDate ?? undefined
        });
      } catch (error) {
        return done(error);
      }
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (user) {
        done(null, {
          id: user.id,
          email: user.email,
          athleteName: user.athleteName,
          schoolClub: user.schoolClub ?? undefined,
          age: user.age,
          subscriptionActive: user.subscriptionActive ?? false,
          stripeCustomerId: user.stripeCustomerId ?? undefined,
          stripeSubscriptionId: user.stripeSubscriptionId ?? undefined,
          trialStartDate: user.trialStartDate ?? undefined
        });
      } else {
        done(null, false);
      }
    } catch (error) {
      done(error);
    }
  });

  // Authentication endpoints
  app.get("/api/user", (req, res) => {
    console.log(`User API called. Session ID: ${req.sessionID}`);
    console.log(`Authenticated: ${req.isAuthenticated()}`);
    console.log(`User in session: ${req.user ? 'exists' : 'undefined'}`);
    
    if (req.isAuthenticated() && req.user) {
      res.json({ user: req.user });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  app.post("/api/signup", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Hash password
      const hashedPassword = await hash(userData.password, 10);
      
      // Create new user
      const newUser = await storage.createUser({
        ...userData,
        password: hashedPassword,
        subscriptionActive: true, // Start with trial

        accountStatus: 'active', // Parent-only signup means immediate approval
        parentEmail: userData.email, // Parent creates account, so their email is parent email
        coppaConsent: true,
        ferpaConsent: true,
        dataProcessingConsent: true,
        marketingConsent: false
      });

      // Log the user in automatically after signup
      req.login({
        id: newUser.id,
        email: newUser.email,
        athleteName: newUser.athleteName,
        schoolClub: newUser.schoolClub ?? undefined,
        age: newUser.age,
        subscriptionActive: newUser.subscriptionActive ?? false,
        stripeCustomerId: newUser.stripeCustomerId ?? undefined,
        stripeSubscriptionId: newUser.stripeSubscriptionId ?? undefined,
        trialStartDate: newUser.trialStartDate ?? undefined
      }, (err) => {
        if (err) {
          return res.status(500).json({ error: "Failed to log in after signup" });
        }
        res.json({ 
          message: "User created successfully", 
          user: {
            id: newUser.id,
            email: newUser.email,
            athleteName: newUser.athleteName,
            schoolClub: newUser.schoolClub,
            age: newUser.age,
            subscriptionActive: newUser.subscriptionActive
          }
        });
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.json({ 
      message: "Login successful", 
      user: req.user 
    });
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // Stripe subscription endpoints
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  app.post('/api/get-or-create-subscription', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    let user = req.user;

    if (user.stripeSubscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        res.json({
          subscriptionId: subscription.id,
          clientSecret: typeof subscription.latest_invoice === 'object' && subscription.latest_invoice && 'payment_intent' in subscription.latest_invoice && subscription.latest_invoice.payment_intent && typeof subscription.latest_invoice.payment_intent === 'object' && 'client_secret' in subscription.latest_invoice.payment_intent ? subscription.latest_invoice.payment_intent.client_secret : undefined,
        });
        return;
      } catch (error) {
        console.error('Error retrieving subscription:', error);
      }
    }
    
    if (!user.email) {
      throw new Error('No user email on file');
    }

    try {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.athleteName,
      });

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price: 'price_1RpyUfFxSZkvIeIKi664uzHM', // Your $9.99/month price ID
        }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        trial_period_days: 30,
      });

      // Update user with Stripe customer and subscription IDs
      // Note: This would need storage methods to be implemented
      
      res.json({
        subscriptionId: subscription.id,
        clientSecret: typeof subscription.latest_invoice === 'object' && subscription.latest_invoice && 'payment_intent' in subscription.latest_invoice && subscription.latest_invoice.payment_intent && typeof subscription.latest_invoice.payment_intent === 'object' && 'client_secret' in subscription.latest_invoice.payment_intent ? subscription.latest_invoice.payment_intent.client_secret : undefined,
      });
    } catch (error: any) {
      return res.status(400).json({ error: { message: error.message } });
    }
  });

  // Basic API endpoints
  app.get("/api/challenges", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        // Return challenges with default status for unauthenticated users
        const challenges = await storage.getChallenges();
        const userChallenges = challenges.map(challenge => ({
          id: Math.random(), // Temporary ID for unauthenticated user
          userId: null,
          challengeId: challenge.id,
          status: 'locked',
          progress: 0,
          attempts: 0,
          challenge: challenge
        }));
        return res.json(userChallenges);
      }

      const userChallenges = await storage.getUserChallenges(req.user.id);
      res.json(userChallenges);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Activity tracking route with enhanced error handling
  app.post("/api/activities", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { challengeId, distance, duration, pace, calories, startedAt, aiAnalysis } = req.body;
      
      // Validate input data to prevent crashes
      if (!distance || isNaN(parseFloat(distance)) || parseFloat(distance) <= 0) {
        return res.status(400).json({ message: "Invalid distance value" });
      }
      
      if (!duration || isNaN(parseInt(duration)) || parseInt(duration) <= 0) {
        return res.status(400).json({ message: "Invalid duration value" });
      }
      
      if (!pace || isNaN(parseFloat(pace))) {
        return res.status(400).json({ message: "Invalid pace value" });
      }

      const activityData = {
        userId: req.user!.id,
        challengeId: challengeId ? parseInt(String(challengeId)) : null,
        distance: parseFloat(distance).toString(),
        duration: parseInt(String(duration)),
        pace: parseFloat(pace).toString(),
        calories: calories ? parseInt(String(calories)) : null,
        startedAt: new Date(startedAt || new Date()),
        aiAnalysis: aiAnalysis || {
          suggestions: [
            "Great job completing this activity!",
            "Keep maintaining your consistent pace",
            "Remember to stay hydrated"
          ]
        }
      };

      const activity = await storage.createActivity(activityData);

      // Auto-complete distance challenges based on GPS activity distance
      let completedChallenges: any[] = [];
      try {
        if (parseFloat(distance) > 0) {
          completedChallenges = await storage.autoCompleteDistanceChallenges(req.user!.id, parseFloat(distance));
        }
      } catch (autoCompleteError) {
        console.error('Auto-complete distance challenges failed:', autoCompleteError);
        // Don't fail the main activity creation if auto-complete fails
      }

      res.json({ 
        activity, 
        challengesCompleted: completedChallenges
      });
    } catch (error: any) {
      console.error("Activity creation error:", error);
      res.status(500).json({ message: "Failed to save activity: " + error.message });
    }
  });

  // Mark challenge as done manually
  app.post("/api/challenges/:id/mark-done", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const challengeId = parseInt(req.params.id);
      const result = await storage.markChallengeAsDone(req.user!.id, challengeId);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user rank based on GPS distance only (1 point per km, rounded to 1 decimal)
  app.get("/api/user-rank", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Calculate user's rank among all users
      const userRank = await storage.getUserRank(req.user!.id);
      res.json(userRank);
    } catch (error: any) {
      console.error('User rank error:', error);
      res.status(500).json({ message: "Error fetching user rank" });
    }
  });

  // Get global rankings (all users ranked by points)
  app.get("/api/global-rankings", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const rankings = await storage.getGlobalRankings();
      res.json(Array.isArray(rankings) ? rankings : []);
    } catch (error: any) {
      console.error('Global rankings error:', error);
      res.status(500).json({ message: "Error fetching global rankings" });
    }
  });

  // Get school rankings (schools ranked by total points with activation status)
  app.get("/api/school-rankings", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const schoolRankings = await storage.getSchoolClubRankings();
      res.json(Array.isArray(schoolRankings) ? schoolRankings : []);
    } catch (error: any) {
      console.error('School rankings error:', error);
      res.status(500).json({ message: "Error fetching school rankings" });
    }
  });

  // Get age group rankings - all age groups display rankings
  app.get("/api/age-group-rankings", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const ageGroups = ['elementary', 'middle', 'high'];
      const allRankings: { [key: string]: any } = {};

      for (const group of ageGroups) {
        try {
          const rankings = await storage.getAgeGroupRankings(group);
          const isActive = rankings.length > 0 && rankings[0]?.ageGroupActive;
          const totalParticipants = rankings.length > 0 ? rankings[0]?.totalParticipants : 0;
          
          allRankings[group] = {
            rankings: Array.isArray(rankings) ? rankings : [],
            isActive: isActive || false,
            totalParticipants: totalParticipants || 0,
            needsMoreParticipants: Math.max(0, 5 - totalParticipants)
          };
        } catch (dbError: any) {
          console.error(`Age group ${group} rankings database error:`, dbError);
          allRankings[group] = {
            rankings: [],
            isActive: false,
            totalParticipants: 0,
            needsMoreParticipants: 5
          };
        }
      }

      res.json(allRankings);
    } catch (error: any) {
      console.error('Age group rankings error:', error);
      res.json({});
    }
  });

  // Get all schools and clubs for dropdown and ensure all appear in rankings (even with 0 points)
  app.get("/api/schools", async (req, res) => {
    try {
      const schoolsAndClubs = [
        "American International School of Bucharest",
        "American International School of Budapest", 
        "American International School of Zagreb",
        "American International School Vienna",
        "American School of Warsaw",
        "American International School of Vilnius",
        "Anglo-American School of Sofia",
        "Baku International School",
        "Bishkek International School",
        "International School of Prague",
        "International School of Helsinki",
        "International School of Krakow",
        "International School of Latvia",
        "International School of Estonia",
        "International School of Belgrade",
        "Istanbul International Community School",
        "NOVA International School Skopje",
        "Pechersk School International",
        "Tashkent International School",
        "The International School of Azerbaijan",
        "Vienna International School"
      ];
      
      res.json(schoolsAndClubs.sort());
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get complete school and club rankings (including organizations with 0 students for motivation)
  app.get("/api/complete-school-rankings", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Get all schools and clubs
      const allSchoolsAndClubs = [
        "American International School of Bucharest",
        "American International School of Budapest", 
        "American International School of Zagreb",
        "American International School Vienna",
        "American School of Warsaw",
        "American International School of Vilnius",
        "Anglo-American School of Sofia",
        "Baku International School",
        "Bishkek International School",
        "International School of Prague",
        "International School of Helsinki",
        "International School of Krakow",
        "International School of Latvia",
        "International School of Estonia",
        "International School of Belgrade",
        "Istanbul International Community School",
        "NOVA International School Skopje",
        "Pechersk School International",
        "Tashkent International School",
        "The International School of Azerbaijan",
        "Vienna International School"
      ];

      // Get actual school rankings from database
      const schoolRankings = await storage.getSchoolClubRankings();
      const existingSchoolMap = new Map(
        schoolRankings.map(school => [school.schoolClub, school])
      );

      // Combine all schools and clubs with their data (or 0 points if no students)
      const completeRankings = allSchoolsAndClubs.map(orgName => {
        const existingData = existingSchoolMap.get(orgName);
        return existingData || {
          schoolClub: orgName,
          totalPoints: 0,
          athleteCount: 0,
          avgPoints: 0,
          isActive: true
        };
      });

      // Sort by total points (descending)
      completeRankings.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));

      res.json(completeRankings);
    } catch (error: any) {
      console.error('Complete school rankings error:', error);
      res.status(500).json({ message: "Error fetching complete school rankings" });
    }
  });

  // Sharing streak endpoints
  app.get("/api/sharing-streak", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const streak = await sharingStreakService.getUserStreak(req.user.id);
      const isAtRisk = await sharingStreakService.isStreakAtRisk(req.user.id);

      res.json({
        ...streak,
        isAtRisk
      });
    } catch (error: any) {
      console.error('Sharing streak error:', error);
      res.status(500).json({ message: "Error fetching sharing streak" });
    }
  });

  app.post("/api/record-share", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { platform, shareType, achievementId, challengeId } = req.body;
      
      if (!platform || !shareType) {
        return res.status(400).json({ message: "Platform and shareType are required" });
      }

      const updatedStreak = await sharingStreakService.recordShare(
        req.user.id,
        platform,
        shareType,
        achievementId,
        challengeId
      );

      res.json({
        success: true,
        streak: updatedStreak,
        message: `Share recorded! Current streak: ${updatedStreak.currentStreak} days`
      });
    } catch (error: any) {
      console.error('Record share error:', error);
      res.status(500).json({ message: "Error recording share" });
    }
  });

  app.get("/api/sharing-leaderboard", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const leaderboard = await sharingStreakService.getStreakLeaderboard(10);
      res.json(leaderboard);
    } catch (error: any) {
      console.error('Sharing leaderboard error:', error);
      res.status(500).json({ message: "Error fetching sharing leaderboard" });
    }
  });

  app.get("/api/share-history", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const history = await sharingStreakService.getUserShareHistory(req.user.id, 20);
      res.json(history);
    } catch (error: any) {
      console.error('Share history error:', error);
      res.status(500).json({ message: "Error fetching share history" });
    }
  });

  // Adaptive Difficulty API
  app.get("/api/challenges/:id/adaptive-difficulty", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const challengeId = parseInt(req.params.id);
      if (isNaN(challengeId)) {
        return res.status(400).json({ message: "Invalid challenge ID" });
      }

      const { AdaptiveDifficultyService } = await import("./adaptive-difficulty");
      const adaptiveDifficultyService = new AdaptiveDifficultyService();
      const difficulty = await adaptiveDifficultyService.calculateAdaptiveDifficulty(req.user!.id, challengeId);
      
      res.json(difficulty);
    } catch (error: any) {
      console.error("Error calculating adaptive difficulty:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // User Performance Analytics
  app.get("/api/user-analytics", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { AdaptiveDifficultyService } = await import("./adaptive-difficulty");
      const adaptiveDifficultyService = new AdaptiveDifficultyService();
      const analytics = await adaptiveDifficultyService.getUserPerformanceAnalytics(req.user!.id);
      
      res.json(analytics);
    } catch (error: any) {
      console.error("Error fetching user analytics:", error);
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}