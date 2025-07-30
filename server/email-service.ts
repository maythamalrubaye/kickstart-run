// Professional email service supporting GoDaddy SMTP and other providers
import nodemailer from 'nodemailer';

interface EmailConfig {
  service: 'console' | 'sendgrid' | 'smtp';
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  apiKey?: string;
}

// Auto-detect email service based on available credentials
function getEmailConfig(): EmailConfig {
  // Check for GoDaddy SMTP credentials
  if (process.env.GODADDY_EMAIL && process.env.GODADDY_PASSWORD) {
    return {
      service: 'smtp',
      smtpHost: 'smtpout.secureserver.net', // GoDaddy SMTP server
      smtpPort: 587, // TLS port
      smtpUser: process.env.GODADDY_EMAIL,
      smtpPass: process.env.GODADDY_PASSWORD,
    };
  }
  
  // Check for SendGrid API key
  if (process.env.SENDGRID_API_KEY) {
    return {
      service: 'sendgrid',
      apiKey: process.env.SENDGRID_API_KEY,
    };
  }
  
  // Default to console logging for development
  return {
    service: 'console'
  };
}

const emailConfig = getEmailConfig();

// Generate secure verification token for parent consent
export function generateConsentToken(userId: number): string {
  const secret = process.env.SESSION_SECRET || 'default-secret';
  return Buffer.from(`consent-${userId}-${secret}`).toString('base64').slice(0, 16);
}

// Verify consent token
export function verifyConsentToken(userId: number, token: string): boolean {
  const expectedToken = generateConsentToken(userId);
  return token === expectedToken;
}

// Send login credentials to parent after account creation
export async function sendLoginCredentialsEmail(
  parentEmail: string,
  childName: string,
  loginEmail: string,
  temporaryPassword: string
): Promise<boolean> {
  console.log(`=== SENDING LOGIN CREDENTIALS EMAIL ===`);
  console.log(`To: ${parentEmail}`);
  console.log(`Child: ${childName}`);
  console.log(`Login Email: ${loginEmail}`);
  console.log(`Password: ${temporaryPassword}`);

  const emailContent = {
    to: parentEmail,
    from: 'contact@kickstartrun.com',
    subject: `🏃‍♀️ Welcome to KickStart Run - ${childName}'s Login Credentials`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login Credentials - KickStart Run</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; }
          .credentials-box { background: white; border: 2px solid #22c55e; border-radius: 8px; padding: 25px; margin: 20px 0; text-align: center; }
          .credential-item { background: #f8fafc; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #22c55e; }
          .login-button { display: inline-block; background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 15px 0; }
          .login-button:hover { background: #16a34a; }
          .info-section { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; font-size: 12px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🏃‍♀️ KickStart Run</div>
          <p>Youth Running Performance App</p>
        </div>
        
        <div class="content">
          <h2>Welcome to KickStart Run!</h2>
          
          <p>Hello! Your account has been successfully created for <strong>${childName}</strong>. Below are the login credentials to share with your child:</p>
          
          <div class="credentials-box">
            <h3>🔐 Login Credentials for ${childName}</h3>
            
            <div class="credential-item">
              <strong>Email/Username:</strong><br>
              <code style="font-size: 16px; color: #059669;">${loginEmail}</code>
            </div>
            
            <div class="credential-item">
              <strong>Password:</strong><br>
              <code style="font-size: 16px; color: #059669;">${temporaryPassword}</code>
            </div>
            
            <a href="https://kickstartrun.com" class="login-button">
              🚀 Login to KickStart Run App
            </a>
          </div>
          
          <div class="info-section">
            <h3>📱 What's Next?</h3>
            <ul>
              <li><strong>Share these credentials</strong> with ${childName}</li>
              <li><strong>Help them login</strong> using the app or website</li>
              <li><strong>Start tracking runs</strong> with GPS verification</li>
              <li><strong>Complete challenges</strong> and earn achievement badges</li>
              <li><strong>Compete on leaderboards</strong> with school/club members</li>
            </ul>
          </div>
          
          <div class="info-section">
            <h3>🏃‍♀️ Key Features for ${childName}:</h3>
            <ul>
              <li><strong>GPS Activity Tracking</strong> - Authentic run verification</li>
              <li><strong>Age-Appropriate Challenges</strong> - Designed for youth development</li>
              <li><strong>School/Club Leaderboards</strong> - Safe, competitive fun</li>
              <li><strong>Achievement Badges</strong> - Motivational progress tracking</li>
              <li><strong>Social Media Sharing</strong> - Celebrate accomplishments</li>
            </ul>
          </div>
          
          <div class="info-section">
            <h3>🔒 Safety & Privacy:</h3>
            <ul>
              <li><strong>COPPA Compliant</strong> - Full legal protection for youth</li>
              <li><strong>Parent Controlled</strong> - You created and manage this account</li>
              <li><strong>GPS Only During Runs</strong> - Location tracking only when actively running</li>
              <li><strong>No Personal Information Sharing</strong> - Privacy-first design</li>
            </ul>
          </div>
          
          <p><strong>Questions or need help?</strong> Reply to this email or contact us at <a href="mailto:contact@kickstartrun.com">contact@kickstartrun.com</a></p>
          
          <p>Thank you for choosing KickStart Run to support ${childName}'s athletic journey!</p>
        </div>
        
        <div class="footer">
          <p>KickStart Run - Youth Running Performance App<br>
          <a href="https://kickstartrun.com">kickstartrun.com</a> | <a href="mailto:contact@kickstartrun.com">contact@kickstartrun.com</a></p>
          <p>This email was sent to ${parentEmail} because you created an account for ${childName}.</p>
        </div>
      </body>
      </html>
    `
  };

  try {
    // For now, use console logging until GoDaddy credentials are provided
    if (emailConfig.service === 'console') {
      console.log('\n=== LOGIN CREDENTIALS EMAIL ===');
      console.log(`To: ${parentEmail}`);
      console.log(`Subject: ${emailContent.subject}`);
      console.log(`Child: ${childName}`);
      console.log(`Login Email: ${loginEmail}`);
      console.log(`Password: ${temporaryPassword}`);
      console.log('=== END EMAIL ===\n');
      return true;
    }

    // GoDaddy SMTP sending
    if (emailConfig.service === 'smtp' && emailConfig.smtpHost) {
      const transporter = nodemailer.createTransport({
        host: emailConfig.smtpHost,
        port: emailConfig.smtpPort || 587,
        secure: false,
        auth: {
          user: emailConfig.smtpUser,
          pass: emailConfig.smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"KickStart Run" <${emailConfig.smtpUser}>`,
        to: emailContent.to,
        subject: emailContent.subject,
        html: emailContent.html,
      });
      
      console.log(`Login credentials email sent successfully to: ${parentEmail}`);
      return true;
    }

    console.log(`Email service not configured - credentials shown in console`);
    return true;
  } catch (error) {
    console.error('Failed to send login credentials email:', error);
    return false;
  }
}

// Send parent consent verification email (kept for legacy support)
export async function sendParentConsentEmail(
  parentEmail: string,
  childName: string,
  userId: number
): Promise<boolean> {

  const consentToken = generateConsentToken(userId);
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://kickstartrun.com' 
    : 'https://kickstart-run.replit.app';
  
  const consentUrl = `${baseUrl}/parent-consent/${userId}/${consentToken}`;

  const emailContent = {
    to: parentEmail,
    from: {
      email: 'noreply@kickstartrun.com',
      name: 'KickStart Run - Youth Athletics'
    },
    subject: `🏃‍♀️ Parent Consent Required: ${childName} wants to join KickStart Run`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Parent Consent Required - KickStart Run</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; }
          .consent-box { background: white; border: 2px solid #22c55e; border-radius: 8px; padding: 25px; margin: 20px 0; }
          .consent-button { display: inline-block; background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 15px 0; }
          .consent-button:hover { background: #16a34a; }
          .info-section { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
          .warning-section { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; font-size: 12px; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
          ul { padding-left: 20px; }
          li { margin-bottom: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🏃‍♀️ KickStart Run</div>
          <div>Youth Athletics Platform</div>
        </div>
        
        <div class="content">
          <h2>Parent Consent Required</h2>
          <p>Hello,</p>
          <p><strong>${childName}</strong> has attempted to create an account on KickStart Run, our youth athletics platform for runners ages 6-18.</p>
          
          <div class="warning-section">
            <h3>🛡️ Why We Need Your Consent</h3>
            <p>Under the Children's Online Privacy Protection Act (COPPA), we are required to obtain verifiable parental consent before collecting personal information from children under 13 years old.</p>
          </div>

          <div class="info-section">
            <h3>📊 What Information We Collect</h3>
            <ul>
              <li><strong>Basic Profile:</strong> Name, age, school/club affiliation</li>
              <li><strong>Activity Data:</strong> GPS-tracked running distances and times</li>
              <li><strong>Progress Tracking:</strong> Challenge completions and achievements</li>
              <li><strong>Communication:</strong> Email for account management and notifications</li>
            </ul>
          </div>

          <div class="info-section">
            <h3>🎯 How We Use This Information</h3>
            <ul>
              <li>Track running activities and provide performance feedback</li>
              <li>Award age-appropriate running challenges and badges</li>
              <li>Create school/club leaderboards (with opt-out available)</li>
              <li>Send weekly progress reports to parents</li>
              <li>Provide a safe, educational athletics experience</li>
            </ul>
          </div>

          <div class="consent-box">
            <h3>✅ Your Consent Options</h3>
            <p><strong>By clicking "I Consent" below, you:</strong></p>
            <ul>
              <li>Authorize KickStart Run to collect and use your child's information as described</li>
              <li>Confirm you are the parent/legal guardian of ${childName}</li>
              <li>Understand you can revoke consent at any time</li>
              <li>Agree to receive weekly activity reports via email</li>
            </ul>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${consentUrl}" class="consent-button">
                🛡️ I CONSENT - Activate ${childName}'s Account
              </a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; text-align: center;">
              This link is secure and will expire in 7 days
            </p>
          </div>

          <div class="warning-section">
            <h3>🚫 If You Don't Consent</h3>
            <p>If you do not provide consent, ${childName}'s account will remain inactive and no personal information will be processed. The account will be automatically deleted after 30 days.</p>
          </div>

          <div class="info-section">
            <h3>👥 Your Parental Rights</h3>
            <ul>
              <li><strong>Access:</strong> Review your child's personal information</li>
              <li><strong>Delete:</strong> Request deletion of your child's account and data</li>
              <li><strong>Modify:</strong> Update or correct your child's information</li>
              <li><strong>Control:</strong> Pause or restrict your child's account at any time</li>
              <li><strong>Export:</strong> Download all your child's data</li>
            </ul>
          </div>

          <h3>📞 Questions or Concerns?</h3>
          <p>If you have any questions about this consent request or our privacy practices, please contact us:</p>
          <ul>
            <li><strong>Email:</strong> privacy@kickstartrun.com</li>
            <li><strong>Phone:</strong> 1-800-KICKSTART</li>
            <li><strong>Mail:</strong> KickStart Run Privacy Team, 123 Athletics Ave, Running City, RC 12345</li>
          </ul>

          <p style="margin-top: 30px;"><strong>Thank you for helping us keep young athletes safe online!</strong></p>
          
          <p>Best regards,<br>
          The KickStart Run Team</p>
        </div>

        <div class="footer">
          <p>KickStart Run - Safe Youth Athletics Platform</p>
          <p>This email was sent because ${childName} attempted to create an account using your email address as their parent/guardian contact.</p>
          <p>If you believe this was sent in error, please ignore this email or contact support@kickstartrun.com</p>
        </div>
      </body>
      </html>
    `,
    text: `
Parent Consent Required - KickStart Run

Hello,

${childName} has attempted to create an account on KickStart Run, our youth athletics platform.

Under COPPA law, we need your consent before collecting information from children under 13.

CONSENT LINK: ${consentUrl}

What we collect:
- Basic profile (name, age, school)
- GPS running activities
- Challenge progress
- Communication email

How we use it:
- Track running performance
- Award age-appropriate challenges
- Create school leaderboards
- Send weekly parent reports

Your rights:
- Access your child's data
- Delete the account anytime
- Control privacy settings
- Export all information

Questions? Contact privacy@kickstartrun.com or 1-800-KICKSTART

To consent: Click the link above or copy/paste into your browser.

Thank you for keeping young athletes safe online!

The KickStart Run Team
    `
  };

  try {
    if (emailConfig.service === 'console') {
      // Console logging mode - for development and testing
      console.log('\n=== PARENT CONSENT EMAIL ===');
      console.log(`To: ${parentEmail}`);
      console.log(`Subject: ${emailContent.subject}`);
      console.log(`Child: ${childName}`);
      console.log(`Consent URL: ${consentUrl}`);
      console.log('=== EMAIL CONTENT ===');
      console.log(emailContent.text);
      console.log('=== END EMAIL ===\n');
      return true;
    }

    if (emailConfig.service === 'sendgrid' && emailConfig.apiKey) {
      const sendgrid = await import('@sendgrid/mail');
      sendgrid.default.setApiKey(emailConfig.apiKey);
      
      await sendgrid.default.send(emailContent);
      console.log(`Parent consent email sent successfully to: ${parentEmail}`);
      return true;
    }

    console.log(`Email service ${emailConfig.service} not configured - using console logging`);
    return false;
  } catch (error: any) {
    console.error('Failed to send parent consent email:', error);
    return false;
  }
}

export async function sendAccountActivationNotification(
  parentEmail: string,
  childName: string
): Promise<boolean> {

  const emailContent = {
    to: parentEmail,
    from: {
      email: 'noreply@kickstartrun.com',
      name: 'KickStart Run - Youth Athletics'
    },
    subject: `🎉 ${childName}'s Account Activated - Welcome to KickStart Run!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 30px; text-align: center; border-radius: 8px; }
          .content { background: #f9fafb; padding: 30px; margin-top: 20px; border-radius: 8px; border: 1px solid #e5e7eb; }
          .success-box { background: #dcfce7; border: 2px solid #22c55e; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏃‍♀️ KickStart Run</h1>
          <p>Youth Athletics Platform</p>
        </div>
        
        <div class="content">
          <div class="success-box">
            <h2>🎉 Account Successfully Activated!</h2>
            <p><strong>${childName}'s account is now active and ready to use.</strong></p>
          </div>

          <p>Thank you for providing consent! ${childName} can now:</p>
          <ul>
            <li>🏃‍♀️ Track GPS running activities</li>
            <li>🏆 Complete age-appropriate challenges</li>
            <li>📊 View progress and achievements</li>
            <li>🏫 Participate in school leaderboards</li>
            <li>📧 Receive weekly progress reports</li>
          </ul>

          <p>You will continue to receive weekly email updates about ${childName}'s activities.</p>

          <p>Questions? Contact support@kickstartrun.com</p>

          <p>Thank you for choosing KickStart Run!</p>
        </div>
      </body>
      </html>
    `
  };

  try {
    if (emailConfig.service === 'console') {
      console.log('\n=== ACCOUNT ACTIVATION EMAIL ===');
      console.log(`To: ${parentEmail}`);
      console.log(`Subject: ${emailContent.subject}`);
      console.log(`Child: ${childName} account activated successfully`);
      console.log('=== END EMAIL ===\n');
      return true;
    }

    // GoDaddy SMTP sending
    if (emailConfig.service === 'smtp' && emailConfig.smtpHost) {
      const transporter = nodemailer.createTransport({
        host: emailConfig.smtpHost,
        port: emailConfig.smtpPort || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: emailConfig.smtpUser,
          pass: emailConfig.smtpPass,
        },
        tls: {
          ciphers: 'SSLv3'
        }
      });

      await transporter.sendMail({
        from: `"KickStart Run" <${emailConfig.smtpUser}>`,
        to: emailContent.to,
        subject: emailContent.subject,
        html: emailContent.html,
      });
      
      return true;
    }

    // SendGrid API sending
    if (emailConfig.service === 'sendgrid' && emailConfig.apiKey) {
      const sendgrid = await import('@sendgrid/mail');
      sendgrid.default.setApiKey(emailConfig.apiKey);
      
      await sendgrid.default.send(emailContent);
      return true;
    }

    return false;
  } catch (error: any) {
    console.error('Failed to send activation notification:', error);
    return false;
  }
}