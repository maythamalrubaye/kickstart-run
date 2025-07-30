import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-cream-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-green-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">KS</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">KickStart Run</h1>
                <p className="text-xs text-green-600">Youth Athletics Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Privacy Policy Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: January 29, 2025</p>

          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Introduction</h2>
            <p className="text-gray-700 mb-6">
              KickStart Run ("we," "our," or "us") is committed to protecting the privacy and safety of young athletes. 
              This Privacy Policy explains how we collect, use, and protect information when you use our youth running 
              performance application designed for ages 6-18.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">COPPA Compliance</h2>
            <p className="text-gray-700 mb-6">
              We are fully compliant with the Children's Online Privacy Protection Act (COPPA). For users under 13 years old:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>Parental consent is required before account creation</li>
              <li>Parents control all data collection and can request deletion at any time</li>
              <li>We collect only the minimum data necessary for app functionality</li>
              <li>No advertising or third-party tracking for children under 13</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Contact Information</h3>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>Email addresses for account creation and parent communication</li>
              <li>Parent email addresses for users under 13 (COPPA compliance)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Health & Fitness Data</h3>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>GPS-tracked running activities and distances</li>
              <li>Performance data for adaptive difficulty coaching</li>
              <li>Challenge completion and progress tracking</li>
              <li>Age-appropriate fitness metrics and improvements</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Location Data</h3>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>Precise GPS location during running activities for distance verification</li>
              <li>General location for school/club leaderboard assignment</li>
              <li>Location data is used only for app functionality, never for advertising</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Payment Information</h3>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>Subscription billing through secure Stripe payment processing</li>
              <li>Payment data is processed by Stripe and not stored on our servers</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Usage Data</h3>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>User ID for account management and progress tracking</li>
              <li>App interaction data for improving user experience</li>
              <li>Challenge completion and leaderboard participation</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">How We Use Your Information</h2>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li><strong>Core App Functionality:</strong> GPS tracking, challenge progression, leaderboards</li>
              <li><strong>AI Coaching:</strong> Adaptive difficulty analysis and personalized recommendations</li>
              <li><strong>Safety & Compliance:</strong> Age-appropriate content and parental controls</li>
              <li><strong>Communication:</strong> Account updates and parent notifications</li>
              <li><strong>Service Improvement:</strong> App performance and user experience enhancement</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Data Sharing and Third Parties</h2>
            <p className="text-gray-700 mb-6">
              We do not sell, rent, or share personal information with third parties for advertising purposes. 
              Limited data sharing occurs only for:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>Payment processing through Stripe (secure, encrypted transactions)</li>
              <li>Legal compliance when required by law</li>
              <li>Safety purposes if we believe a child is at risk</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Data Security</h2>
            <p className="text-gray-700 mb-6">
              We implement industry-standard security measures including:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>Encrypted data transmission and storage</li>
              <li>Secure user authentication and session management</li>
              <li>Regular security audits and updates</li>
              <li>Access controls limiting data access to authorized personnel only</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Data Retention</h2>
            <p className="text-gray-700 mb-6">
              We retain personal information only as long as necessary for app functionality and compliance:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>Active account data: Retained during subscription period</li>
              <li>Closed accounts: Data deleted within 30 days of closure</li>
              <li>COPPA requests: Immediate data deletion upon parent request</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Your Rights</h2>
            <p className="text-gray-700 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and associated data</li>
              <li>Export your data in a portable format</li>
              <li>Opt out of non-essential communications</li>
              <li>For users under 13: Parents can exercise all rights on behalf of their children</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">International Users</h2>
            <p className="text-gray-700 mb-6">
              If you are located outside the United States, please note that we may transfer, process, 
              and store your information in the United States. By using our app, you consent to this transfer.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Changes to This Policy</h2>
            <p className="text-gray-700 mb-6">
              We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. 
              We will notify users of significant changes via email and app notifications.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact Us</h2>
            <p className="text-gray-700 mb-6">
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-green-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-2"><strong>Email:</strong> contact@kickstartrun.com</p>
              <p className="text-gray-700 mb-2"><strong>Support:</strong> contact@kickstartrun.com</p>
              <p className="text-gray-700 mb-2"><strong>Response Time:</strong> Within 72 hours</p>
            </div>

            <div className="mt-12 p-6 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">For Parents</h3>
              <p className="text-gray-700">
                If your child is under 13 and you have questions about their account or want to request 
                data deletion, please email us at <strong>contact@kickstartrun.com</strong> with your 
                child's username and your verification details.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 KickStart Run. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}