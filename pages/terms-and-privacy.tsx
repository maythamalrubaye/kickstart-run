import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Scale, AlertTriangle, Users, Mail, FileText, Clock } from "lucide-react";
import { Navigation } from "@/components/navigation";

export default function TermsAndPrivacy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl pb-20">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Terms of Service & Privacy Policy</h1>
          <p className="text-muted-foreground">
            KickStart Run - Youth Athletic Performance Platform
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Last Updated: {new Date().toLocaleDateString()} | Effective Date: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-6">
          
          {/* COPPA/FERPA Compliance Banner */}
          <Card className="border-2 border-green-200 bg-green-50 dark:bg-green-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <Shield className="w-6 h-6" />
                Legal Compliance & Youth Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="text-green-700 dark:text-green-300">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">✅ COPPA Compliant</h3>
                  <p className="text-sm">Full compliance with Children's Online Privacy Protection Act</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">✅ FERPA Compliant</h3>
                  <p className="text-sm">Educational records protection as per Family Educational Rights</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Liability Waiver & Assumption of Risk */}
          <Card className="border-2 border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
                <AlertTriangle className="w-6 h-6" />
                ASSUMPTION OF RISK & LIABILITY WAIVER
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border-l-4 border-red-500">
                <h3 className="font-bold text-red-900 dark:text-red-200 mb-2">
                  ⚠️ IMPORTANT: PLEASE READ CAREFULLY
                </h3>
                <p className="text-sm text-red-800 dark:text-red-300 font-medium">
                  By using KickStart Run, you acknowledge that physical activity involves inherent risks. 
                  Parents/guardians assume full responsibility for their child's participation and any resulting injuries.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Assumption of Risk:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                  <li>• Running and physical activity carry inherent risks of injury or death</li>
                  <li>• Weather conditions, terrain, and equipment may present additional hazards</li>
                  <li>• Participants may experience fatigue, dehydration, or medical emergencies</li>
                  <li>• GPS tracking requires outdoor activity with potential environmental risks</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Release of Liability:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                  <li>• KickStart Run and its affiliates are NOT LIABLE for any injuries, accidents, or medical emergencies</li>
                  <li>• Parents/guardians waive all claims against KickStart Run for any harm resulting from app use</li>
                  <li>• Medical supervision and emergency preparedness are the sole responsibility of parents/guardians</li>
                  <li>• Users participate at their own risk and must obtain medical clearance before beginning any exercise program</li>
                </ul>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                  <strong>Parental Responsibility:</strong> Parents and guardians are solely responsible for supervising 
                  their child's use of this app, ensuring proper safety equipment, medical clearance, and emergency 
                  preparedness during all physical activities.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* COPPA-Specific Provisions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Children's Privacy Protection (COPPA)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Children Under 13:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                  <li>• Parental consent is required for all data collection and account creation</li>
                  <li>• Parents may review, modify, or delete their child's personal information at any time</li>
                  <li>• We collect only information necessary to provide our athletic tracking services</li>
                  <li>• Personal information is never shared with third parties for marketing purposes</li>
                  <li>• Parents have the right to refuse further collection or use of their child's information</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Data We Collect from Children:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                  <li>• Name and age for account creation</li>
                  <li>• School/club affiliation for leaderboard participation</li>
                  <li>• GPS location data during running activities only</li>
                  <li>• Athletic performance data and achievements</li>
                  <li>• Parent/guardian email for communication and consent verification</li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Parental Rights:</h4>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Parents may contact us at any time to: review their child's information, request 
                  corrections or deletions, refuse further collection, or terminate their child's 
                  account. Email: <strong>contact@kickstartrun.com</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* FERPA Educational Records */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Educational Records Protection (FERPA)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">School Partnership Data:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                  <li>• Athletic performance data linked to educational institutions is protected under FERPA</li>
                  <li>• Schools maintain control over educational record components</li>
                  <li>• Directory information (name, school) may be shared for legitimate educational purposes</li>
                  <li>• Parents have rights to access and amend educational records</li>
                  <li>• Written consent required for non-directory information disclosure</li>
                </ul>
              </div>

              <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                <p className="text-sm text-purple-800 dark:text-purple-300">
                  <strong>School Officials:</strong> Authorized school personnel may access student 
                  athletic data for legitimate educational interests, including physical education 
                  assessment and athletic program management.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Collection & Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Data Collection & Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Information We Collect:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                  <li>• <strong>Account Information:</strong> Name, age, email, school/club affiliation</li>
                  <li>• <strong>GPS Data:</strong> Location coordinates during active running sessions only</li>
                  <li>• <strong>Performance Data:</strong> Distance, time, pace, and athletic achievements</li>
                  <li>• <strong>Device Information:</strong> Operating system, app version for technical support</li>
                  <li>• <strong>Payment Information:</strong> Processed securely through Stripe (not stored by us)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">How We Use Your Information:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                  <li>• Provide GPS tracking and performance analytics</li>
                  <li>• Create age-appropriate leaderboards and challenges</li>
                  <li>• Facilitate school/club team participation</li>
                  <li>• Send important service updates and safety notifications</li>
                  <li>• Improve app functionality and user experience</li>
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2">Data Protection:</h4>
                <p className="text-sm text-green-800 dark:text-green-300">
                  All data is encrypted in transit and at rest. We never sell personal information 
                  and only share data as outlined in this policy or as required by law.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Agreement Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                Terms of Service Agreement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Service Agreement:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                  <li>• Monthly subscription required after 30-day free trial</li>
                  <li>• Service availability subject to technical maintenance and updates</li>
                  <li>• Users must provide accurate information and maintain account security</li>
                  <li>• Prohibited uses include cheating, harassment, or violating others' privacy</li>
                  <li>• We reserve the right to suspend accounts for policy violations</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Intellectual Property:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                  <li>• KickStart Run owns all app content, features, and functionality</li>
                  <li>• Users retain ownership of their personal data and athletic information</li>
                  <li>• Limited license granted for personal, non-commercial use of the app</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Contact & Legal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Privacy Questions:</h3>
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>contact@kickstartrun.com</span>
                    </div>

                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Legal Support:</h3>
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>contact@kickstartrun.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Response within 48 hours</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Legal Notice:</strong> These terms constitute a binding legal agreement. 
                  If you disagree with any provision, you must discontinue use of KickStart Run 
                  immediately. Continued use indicates acceptance of all terms and conditions.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Third-Party Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                Third-Party Services & Integrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Payment Processing:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                  <li>• <strong>Stripe:</strong> Secure payment processing for subscriptions</li>
                  <li>• Payment information is processed directly by Stripe and not stored by KickStart Run</li>
                  <li>• Stripe's privacy policy and terms apply to payment transactions</li>
                  <li>• We receive only transaction confirmations and subscription status updates</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Location Services:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                  <li>• Device GPS services for activity tracking during runs</li>
                  <li>• Location data is processed locally on your device during active sessions</li>
                  <li>• Only distance and route summary data is stored, not precise GPS coordinates</li>
                  <li>• GPS tracking can be disabled but will limit app functionality</li>
                </ul>
              </div>

              <div className="bg-indigo-50 dark:bg-indigo-950 p-4 rounded-lg">
                <h4 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-2">Third-Party Data Sharing:</h4>
                <p className="text-sm text-indigo-800 dark:text-indigo-300">
                  We do not share personal data with third parties except as required for core 
                  app functionality (payments, technical infrastructure) or as required by law.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Age Verification & Account Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-600" />
                Age Verification & Account Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Age Verification Process:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                  <li>• Users self-report their age during account creation</li>
                  <li>• Accounts for users under 13 require verified parental consent via email</li>
                  <li>• Parents must create accounts on behalf of children under 13</li>
                  <li>• Age verification helps ensure appropriate challenge difficulty and safety measures</li>
                  <li>• False age reporting may result in account suspension</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Account Termination & Data Deletion:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                  <li>• Users or parents may request account termination at any time</li>
                  <li>• Data deletion requests are processed within 30 days</li>
                  <li>• Some data may be retained for legal compliance or safety purposes</li>
                  <li>• Subscription cancellation is separate from account deletion</li>
                  <li>• Contact <strong>contact@kickstartrun.com</strong> for account deletion requests</li>
                </ul>
              </div>

              <div className="bg-cyan-50 dark:bg-cyan-950 p-4 rounded-lg">
                <h4 className="font-semibold text-cyan-900 dark:text-cyan-200 mb-2">Right to Data Portability:</h4>
                <p className="text-sm text-cyan-800 dark:text-cyan-300">
                  Users may request a copy of their personal data in a portable format. 
                  Athletic performance data can be exported for use with other fitness platforms.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* International Users & GDPR */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-600" />
                International Users & GDPR Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">European Union Users (GDPR):</h3>
                <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                  <li>• Legal basis for processing: Consent and legitimate interest for service provision</li>
                  <li>• Right to access, rectify, erase, or restrict processing of personal data</li>
                  <li>• Right to data portability and to object to processing</li>
                  <li>• Data Protection Officer available for GDPR-related inquiries</li>
                  <li>• Right to lodge complaints with supervisory authorities</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Data Transfers & Storage:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                  <li>• Data is stored on secure servers with appropriate safeguards</li>
                  <li>• International data transfers comply with applicable privacy frameworks</li>
                  <li>• EU user data is processed in accordance with GDPR requirements</li>
                  <li>• Cross-border transfers use appropriate legal mechanisms</li>
                </ul>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950 p-4 rounded-lg">
                <h4 className="font-semibold text-emerald-900 dark:text-emerald-200 mb-2">Global Privacy Standards:</h4>
                <p className="text-sm text-emerald-800 dark:text-emerald-300">
                  We apply the highest privacy standards globally, ensuring consistent protection 
                  regardless of user location while complying with local privacy laws.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Procedures & Safety */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Emergency Procedures & Safety Protocols
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Medical Emergency Protocol:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                  <li>• KickStart Run is NOT a medical monitoring service</li>
                  <li>• Users must immediately contact emergency services (911) for medical emergencies</li>
                  <li>• Parents/guardians are responsible for medical supervision during activities</li>
                  <li>• App does not provide medical advice or emergency response services</li>
                  <li>• Users should inform coaches, parents, or guardians of their location when running</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Safety Incident Reporting:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                  <li>• Report safety concerns immediately to <strong>contact@kickstartrun.com</strong></li>
                  <li>• Include date, time, location, and nature of incident</li>
                  <li>• We may suspend accounts pending investigation of safety violations</li>
                  <li>• Cooperation with law enforcement when required</li>
                  <li>• Safety incident data may be retained for legal and safety purposes</li>
                </ul>
              </div>

              <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border-l-4 border-red-500">
                <h4 className="font-semibold text-red-900 dark:text-red-200 mb-2">⚠️ Critical Safety Notice:</h4>
                <p className="text-sm text-red-800 dark:text-red-300">
                  <strong>DO NOT RELY ON THIS APP FOR EMERGENCY SITUATIONS.</strong> Always carry 
                  a phone, inform others of your location, run in safe areas, and contact emergency 
                  services directly for any medical or safety emergencies.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Dispute Resolution & Legal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-violet-600" />
                Dispute Resolution & Legal Procedures
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Dispute Resolution Process:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                  <li>• Contact <strong>contact@kickstartrun.com</strong> to resolve disputes informally</li>
                  <li>• 30-day good faith negotiation period for dispute resolution</li>
                  <li>• Binding arbitration for unresolved disputes (excluding small claims court)</li>
                  <li>• Class action lawsuits are waived in favor of individual arbitration</li>
                  <li>• Governing law: [Your jurisdiction] for legal proceedings</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Limitation of Liability:</h3>
                <ul className="text-sm space-y-1 text-muted-foreground ml-4">
                  <li>• Service provided "as is" without warranties of any kind</li>
                  <li>• No liability for indirect, incidental, or consequential damages</li>
                  <li>• Maximum liability limited to subscription fees paid in the past 12 months</li>
                  <li>• No liability for third-party actions or force majeure events</li>
                  <li>• Some jurisdictions may not allow liability limitations</li>
                </ul>
              </div>

              <div className="bg-violet-50 dark:bg-violet-950 p-4 rounded-lg">
                <h4 className="font-semibold text-violet-900 dark:text-violet-200 mb-2">Legal Severability:</h4>
                <p className="text-sm text-violet-800 dark:text-violet-300">
                  If any provision of these terms is found invalid, the remaining provisions 
                  remain in full force and effect. Invalid provisions will be modified to 
                  achieve the intended legal and commercial purpose.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Policy Updates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                Policy Updates & Changes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                We may update these terms and privacy policies to reflect changes in our practices 
                or applicable laws. Material changes will be communicated via email and prominent 
                app notifications at least 30 days before taking effect. For users under 13, 
                renewed parental consent will be obtained for any policy changes affecting children's 
                data collection or usage. Continued use after policy updates indicates acceptance 
                of the revised terms.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Navigation />
    </div>
  );
}