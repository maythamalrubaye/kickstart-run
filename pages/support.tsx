import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Mail, MessageSquare, Book, Shield, Clock, Users } from "lucide-react";

export default function SupportPage() {
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

      {/* Support Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <HelpCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Support Center</h1>
          <p className="text-xl text-gray-600">Get help with KickStart Run - We're here for you and your young athlete</p>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-green-200 hover:border-green-300 transition-colors">
            <CardHeader className="text-center">
              <Mail className="w-12 h-12 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-green-600">Email Support</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">Get detailed help via email</p>
              <div className="space-y-2">
                <p><strong>General Support:</strong></p>
                <p className="font-mono text-sm">contact@kickstartrun.com</p>
                <p><strong>Parent Questions:</strong></p>
                <p className="font-mono text-sm">contact@kickstartrun.com</p>
                <p><strong>Safety Concerns:</strong></p>
                <p className="font-mono text-sm">contact@kickstartrun.com</p>
              </div>
              <p className="text-xs text-gray-500 mt-4">Response within 24 hours</p>
            </CardContent>
          </Card>



          <Card className="border-purple-200 hover:border-purple-300 transition-colors">
            <CardHeader className="text-center">
              <MessageSquare className="w-12 h-12 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-purple-600">Live Chat</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">Instant help when you need it</p>
              <Button 
                className="bg-purple-600 hover:bg-purple-700 w-full mb-4"
                onClick={() => window.open('https://tawk.to/chat/kickstartrun', '_blank')}
              >
                Start Live Chat
              </Button>
              <div className="text-sm text-gray-600">
                <p><strong>Available:</strong></p>
                <p>Daily: 8AM-10PM EST</p>
                <p>Average response: &lt;2 minutes</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <div className="flex items-center mb-6">
            <Book className="w-8 h-8 text-green-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Getting Started</h3>
              <div className="space-y-4 text-gray-700">
                <div>
                  <p className="font-medium">How do I create an account for my child?</p>
                  <p>Parents create accounts on behalf of their children. Simply click "Parent Account Creation" and provide your child's information along with your parent email for COPPA compliance.</p>
                </div>
                <div>
                  <p className="font-medium">What ages is KickStart Run appropriate for?</p>
                  <p>KickStart Run is designed for young athletes ages 6-18, with age-appropriate challenges and safety features for each group (Elementary 6-8, Middle School 9-12, High School 13-18).</p>
                </div>
                <div>
                  <p className="font-medium">Do I need special equipment?</p>
                  <p>Just a smartphone! The app uses GPS tracking for run verification. We recommend comfortable running shoes and appropriate athletic clothing.</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">App Features</h3>
              <div className="space-y-4 text-gray-700">
                <div>
                  <p className="font-medium">How does GPS tracking work?</p>
                  <p>The app tracks your child's running activities using their phone's GPS. This ensures all distance achievements are authentic and creates fair competition on leaderboards.</p>
                </div>
                <div>
                  <p className="font-medium">What is Adaptive Difficulty?</p>
                  <p>Our AI system analyzes your child's performance and automatically adjusts challenge difficulty to provide the right level of challenge - not too easy, not too hard.</p>
                </div>
                <div>
                  <p className="font-medium">How do school leaderboards work?</p>
                  <p>School leaderboards display all schools and their rankings. All students contribute points to their school based on GPS-tracked distances.</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Safety & Privacy</h3>
              <div className="space-y-4 text-gray-700">
                <div>
                  <p className="font-medium">Is my child's data safe?</p>
                  <p>Yes! We're fully COPPA compliant with parental consent required for under-13 users. Parents control all data sharing and can request data deletion at any time.</p>
                </div>
                <div>
                  <p className="font-medium">Can other users contact my child?</p>
                  <p>No. KickStart Run has no direct messaging or communication features. Interaction is limited to friendly competition on school-based leaderboards.</p>
                </div>
                <div>
                  <p className="font-medium">What if my child gets hurt while running?</p>
                  <p>Parents assume responsibility for physical activities. The app includes safety guidelines, age-appropriate limits, and warning signs to prevent overexertion.</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Billing & Subscription</h3>
              <div className="space-y-4 text-gray-700">
                <div>
                  <p className="font-medium">How much does KickStart Run cost?</p>
                  <p>$9.99/month after a 30-day free trial. This includes all features: GPS tracking, challenges, leaderboards, AI coaching, and safety monitoring.</p>
                </div>
                <div>
                  <p className="font-medium">Can I cancel my subscription?</p>
                  <p>Yes, you can cancel anytime through your account settings or by contacting support. You'll retain access until the end of your billing period.</p>
                </div>
                <div>
                  <p className="font-medium">Is there a family discount?</p>
                  <p>Contact contact@kickstartrun.com for family and team pricing options if you have multiple children who want to use the app.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Shield className="w-6 h-6 text-green-600 mr-2" />
                <CardTitle>Safety Resources</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Learn about our comprehensive youth safety practices</p>
              <Link href="/safety">
                <Button variant="outline" className="w-full">
                  View Safety Guidelines
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Users className="w-6 h-6 text-blue-600 mr-2" />
                <CardTitle>Parent Community</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Connect with other parents and share experiences</p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.open('https://community.kickstartrun.com/parents', '_blank')}
              >
                Join Parent Forum
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Support */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-12">
          <div className="flex items-center mb-4">
            <Shield className="w-6 h-6 text-red-600 mr-2" />
            <h3 className="text-xl font-semibold text-red-800">Emergency Support</h3>
          </div>
          <p className="text-red-700 mb-4">
            If your child is experiencing a medical emergency during or after using our app, 
            please contact emergency services immediately (911 in US, 999 in UK, 112 in EU).
          </p>
          <p className="text-red-700">
            For urgent safety concerns related to the app, email <strong>contact@kickstartrun.com</strong> 
for immediate assistance.
          </p>
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