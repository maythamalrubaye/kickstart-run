import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Database, Eye, Users, Lock, AlertTriangle, Mail } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground">
            KickStart Run - Youth Athletic Performance Platform
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Last Updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-6">
          
          {/* Executive Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">
                KickStart Run is committed to protecting the privacy and safety of youth athletes (ages 6-18). 
                This policy outlines our comprehensive data protection measures, legal compliance standards, 
                and parental oversight rights. We operate under strict COPPA, GDPR, and youth privacy 
                protection guidelines to ensure the safest possible experience for young athletes.
              </p>
            </CardContent>
          </Card>

          {/* Data Collection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                Data Collection & Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Information We Collect:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                  <li>• <strong>Account Information:</strong> Athlete name, age, date of birth, email address, school/club affiliation</li>
                  <li>• <strong>GPS Location Data:</strong> Real-time location tracking during running activities for distance verification</li>
                  <li>• <strong>Performance Metrics:</strong> Running distance, pace, duration, calories burned, and improvement analytics</li>
                  <li>• <strong>Activity History:</strong> Challenge completions, achievements earned, ranking positions</li>
                  <li>• <strong>Parental Information:</strong> Parent/guardian email for consent verification (users under 13)</li>
                  <li>• <strong>Payment Information:</strong> Stripe-processed subscription data (no card details stored)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">How We Use This Data:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                  <li>• Provide GPS-verified activity tracking and performance analysis</li>
                  <li>• Generate personalized coaching suggestions and improvement recommendations</li>
                  <li>• Create age-appropriate school/club leaderboards and rankings</li>
                  <li>• Process subscription payments and manage account access</li>
                  <li>• Ensure platform safety through age verification and parental oversight</li>
                  <li>• Comply with legal requirements for youth data protection</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* COPPA Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                COPPA Compliance (Under 13)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                  Special Protections for Children
                </h3>
                <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                  For athletes under 13, we implement enhanced privacy protections under the Children's Online Privacy Protection Act (COPPA):
                </p>
                <ul className="text-sm space-y-1 text-red-700 dark:text-red-300">
                  <li>• <strong>Verifiable Parental Consent:</strong> Required before any data collection begins</li>
                  <li>• <strong>Limited Data Collection:</strong> Only collect information necessary for service provision</li>
                  <li>• <strong>No Third-Party Sharing:</strong> Child data is never shared with external parties</li>
                  <li>• <strong>Parental Access Rights:</strong> Parents can review, modify, or delete child's data anytime</li>
                  <li>• <strong>Enhanced Security:</strong> Additional encryption and access controls for minor accounts</li>
                  <li>• <strong>Safe Communication:</strong> No direct messaging or contact features for children</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Parental Rights & Controls:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                  <li>• Request account deletion and complete data removal</li>
                  <li>• Review all collected information about your child</li>
                  <li>• Modify privacy settings and public visibility controls</li>
                  <li>• Revoke consent and discontinue data collection</li>
                  <li>• Receive notifications about policy changes affecting children</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Public Visibility & Leaderboards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-green-600" />
                Public Visibility & Leaderboards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Leaderboard Information Displayed:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                  <li>• Athlete name and school/club affiliation</li>
                  <li>• Age group category (Elementary 6-8, Middle 9-12, High School 13-18)</li>
                  <li>• Achievement points and ranking position</li>
                  <li>• Challenge completion status and earned badges</li>
                  <li>• Performance metrics (distance, pace improvements)</li>
                </ul>
              </div>
              
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  Your Privacy Controls
                </h3>
                <ul className="text-sm space-y-1 text-green-700 dark:text-green-300">
                  <li>• <strong>Opt-Out Option:</strong> Remove yourself from public leaderboards anytime</li>
                  <li>• <strong>Selective Sharing:</strong> Choose which achievements are publicly visible</li>
                  <li>• <strong>Anonymous Mode:</strong> Participate in rankings without displaying personal information</li>
                  <li>• <strong>School-Only Visibility:</strong> Limit visibility to your school/club only</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-600" />
                Data Security & Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Security Measures:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                  <li>• <strong>Encryption:</strong> All data encrypted in transit and at rest using AES-256</li>
                  <li>• <strong>Secure Infrastructure:</strong> Hosted on SOC 2 compliant cloud infrastructure</li>
                  <li>• <strong>Access Controls:</strong> Role-based access with multi-factor authentication</li>
                  <li>• <strong>Regular Audits:</strong> Quarterly security assessments and penetration testing</li>
                  <li>• <strong>Data Minimization:</strong> We only collect data necessary for service provision</li>
                  <li>• <strong>Automated Backups:</strong> Secure, encrypted backups with geographic redundancy</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Data Retention:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                  <li>• Active account data retained while subscription is active</li>
                  <li>• Account deletion results in complete data removal within 30 days</li>
                  <li>• GPS location data automatically purged after 12 months</li>
                  <li>• Payment information processed by Stripe (not stored by us)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Third-Party Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-600" />
                Third-Party Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Services We Use:</h3>
                <ul className="text-sm space-y-2 text-muted-foreground ml-4">
                  <li>• <strong>Stripe:</strong> Payment processing (PCI DSS compliant, no card data stored by us)</li>
                  <li>• <strong>Neon Database:</strong> Secure PostgreSQL hosting with encryption</li>
                  <li>• <strong>Replit:</strong> Application hosting and development platform</li>
                </ul>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                  Data Sharing Policy
                </h3>
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  We never sell, rent, or share personal information with third parties for marketing purposes. 
                  Data is only shared with essential service providers under strict data processing agreements 
                  that ensure the same level of protection as our own systems.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Legal Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Legal Compliance & Liability Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Regulatory Compliance:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                  <li>• <strong>COPPA:</strong> Children's Online Privacy Protection Act compliance</li>
                  <li>• <strong>GDPR:</strong> General Data Protection Regulation for EU residents</li>
                  <li>• <strong>CCPA:</strong> California Consumer Privacy Act compliance</li>
                  <li>• <strong>FERPA:</strong> Family Educational Rights and Privacy Act considerations</li>
                  <li>• <strong>State Laws:</strong> Compliance with applicable state youth privacy laws</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Your Rights:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                  <li>• <strong>Access:</strong> Request copies of all data we have about you</li>
                  <li>• <strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li>• <strong>Deletion:</strong> Request complete account and data removal</li>
                  <li>• <strong>Portability:</strong> Export your data in a machine-readable format</li>
                  <li>• <strong>Objection:</strong> Object to certain data processing activities</li>
                  <li>• <strong>Complaint:</strong> File complaints with relevant privacy authorities</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Contact & Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Privacy Questions:</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>contact@kickstartrun.com</span>
                    </div>

                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Data Protection Officer:</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>contact@kickstartrun.com</span>
                    </div>
                    <p className="text-muted-foreground">
                      For GDPR requests and data protection inquiries
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Response Times:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• General inquiries: 24-48 hours</li>
                  <li>• Privacy concerns: Within 24 hours</li>
                  <li>• Data deletion requests: Completed within 30 days</li>
                  <li>• Emergency safety issues: Immediate response</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Policy Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Policy Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We may update this privacy policy periodically to reflect changes in our practices 
                or applicable laws. Material changes will be communicated to users via email and 
                prominent notice on our platform. For users under 13, parental consent will be 
                re-obtained if policy changes affect children's data collection or usage.
              </p>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}