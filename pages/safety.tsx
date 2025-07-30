import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield, Heart, Users, AlertTriangle, Mail } from "lucide-react";

export default function SafetyPage() {
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

      {/* Safety Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Youth Safety First</h1>
            <p className="text-gray-600">Our comprehensive approach to keeping young athletes safe</p>
          </div>

          <div className="space-y-8">
            {/* Physical Safety */}
            <div className="bg-green-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Heart className="w-6 h-6 text-green-600 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900">Physical Safety</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="font-semibold mb-2">Age-Appropriate Activity Limits</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Ages 6-8:</strong> Maximum 1.5km runs with frequent breaks</li>
                    <li><strong>Ages 9-12:</strong> Maximum 4.5km with proper warm-up/cool-down</li>
                    <li><strong>Ages 13-18:</strong> Progressive training up to 12km with coaching guidance</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Adaptive Difficulty System</h3>
                  <p>AI-powered coaching automatically adjusts challenge difficulty based on individual performance, preventing overexertion and promoting safe progression.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Emergency Protocols</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>GPS tracking allows location sharing with parents during activities</li>
                    <li>Immediate activity termination if performance indicates distress</li>
                    <li>Built-in rest day recommendations to prevent overtraining</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Digital Safety */}
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Shield className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900">Digital Safety & Privacy</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="font-semibold mb-2">COPPA Compliance</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Parental consent required for all users under 13</li>
                    <li>Parents control all data collection and sharing settings</li>
                    <li>No advertising or third-party tracking for children</li>
                    <li>Secure data encryption and storage practices</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Safe Social Features</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>School-based leaderboards only (no global stranger interaction)</li>
                    <li>No direct messaging or communication features</li>
                    <li>Achievement sharing limited to approved social platforms</li>
                    <li>All user-generated content pre-moderated</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Supervision Guidelines */}
            <div className="bg-orange-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Users className="w-6 h-6 text-orange-600 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900">Adult Supervision Guidelines</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="font-semibold mb-2">Parental Oversight</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Parents receive weekly progress reports via email</li>
                    <li>Real-time activity notifications for all running sessions</li>
                    <li>Full access to child's performance data and safety metrics</li>
                    <li>Ability to set custom activity limits and restrictions</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">School/Coach Integration</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>School administrators can monitor all student activities</li>
                    <li>Coach dashboard for team safety oversight</li>
                    <li>Injury reporting and tracking system</li>
                    <li>Integration with school medical protocols</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Warning Signs */}
            <div className="bg-red-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900">Warning Signs & When to Stop</h2>
              </div>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="font-semibold mb-2">Immediate Activity Cessation</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Chest pain, difficulty breathing, or dizziness</li>
                    <li>Severe fatigue or inability to maintain conversation</li>
                    <li>Joint pain or unusual muscle soreness</li>
                    <li>Signs of heat exhaustion (excessive sweating, nausea, headache)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Overtraining Prevention</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>App automatically enforces rest days between intense sessions</li>
                    <li>Performance decline triggers automatic difficulty reduction</li>
                    <li>Sleep and recovery tracking recommendations</li>
                    <li>Mandatory breaks after achieving personal bests</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-gray-600 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900">Emergency Resources</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6 text-gray-700">
                <div>
                  <h3 className="font-semibold mb-2">Medical Emergency</h3>
                  <p className="text-sm mb-2">For immediate medical attention:</p>
                  <p className="font-mono text-lg text-red-600">911 (US)</p>
                  <p className="font-mono text-lg text-red-600">999 (UK)</p>
                  <p className="font-mono text-lg text-red-600">112 (EU)</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">App Safety Support</h3>
                  <p className="text-sm mb-2">Report safety concerns or issues:</p>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      <span className="font-mono">contact@kickstartrun.com</span>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* Safety Commitment */}
            <div className="text-center bg-green-600 text-white rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Our Safety Commitment</h2>
              <p className="text-lg mb-4">
                Every feature in KickStart Run is designed with youth safety as the primary consideration. 
                We believe that building healthy, confident young athletes requires both physical and digital safety.
              </p>
              <p className="text-sm opacity-90">
                Questions about our safety practices? Contact our dedicated safety team at contact@kickstartrun.com
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