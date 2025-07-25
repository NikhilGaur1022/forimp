import { Shield, Lock, Eye, UserCheck, Globe, Mail } from 'lucide-react';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-dental-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how DentalReach collects, uses, and protects your personal information.
          </p>
          <p className="text-sm text-neutral-500 mt-4">
            Last updated: July 21, 2025
          </p>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="p-8 space-y-8">
              
              {/* Introduction */}
              <section>
                <div className="flex items-center mb-4">
                  <Globe className="h-6 w-6 text-dental-600 mr-3" />
                  <h2 className="text-2xl font-semibold text-neutral-900">Introduction</h2>
                </div>
                <p className="text-neutral-700 leading-relaxed">
                  DentalReach ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform, including our website and mobile applications (collectively, the "Service").
                </p>
              </section>

              {/* Information We Collect */}
              <section>
                <div className="flex items-center mb-4">
                  <Eye className="h-6 w-6 text-dental-600 mr-3" />
                  <h2 className="text-2xl font-semibold text-neutral-900">Information We Collect</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">Personal Information</h3>
                    <ul className="text-neutral-700 space-y-1 ml-4">
                      <li>• Name, email address, and profile information</li>
                      <li>• Professional credentials and verification documents</li>
                      <li>• Contact information and professional affiliations</li>
                      <li>• Profile photos and biographical information</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">Content Information</h3>
                    <ul className="text-neutral-700 space-y-1 ml-4">
                      <li>• Articles, posts, and comments you publish</li>
                      <li>• Forum discussions and replies</li>
                      <li>• Job postings and applications</li>
                      <li>• Event registrations and participation data</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">Usage Information</h3>
                    <ul className="text-neutral-700 space-y-1 ml-4">
                      <li>• How you interact with our platform</li>
                      <li>• Pages visited, time spent, and click patterns</li>
                      <li>• Device information, IP address, and browser type</li>
                      <li>• Location data (if you enable location services)</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* How We Use Your Information */}
              <section>
                <div className="flex items-center mb-4">
                  <UserCheck className="h-6 w-6 text-dental-600 mr-3" />
                  <h2 className="text-2xl font-semibold text-neutral-900">How We Use Your Information</h2>
                </div>
                
                <ul className="text-neutral-700 space-y-2">
                  <li>• <strong>Platform Operation:</strong> To provide, maintain, and improve our services</li>
                  <li>• <strong>Account Management:</strong> To create and manage your account, verify credentials</li>
                  <li>• <strong>Communication:</strong> To send notifications, updates, and respond to inquiries</li>
                  <li>• <strong>Content Distribution:</strong> To display your published content to other users</li>
                  <li>• <strong>Professional Networking:</strong> To connect you with other dental professionals</li>
                  <li>• <strong>Job Matching:</strong> To match job seekers with relevant opportunities</li>
                  <li>• <strong>Analytics:</strong> To understand usage patterns and improve user experience</li>
                  <li>• <strong>Safety:</strong> To detect fraud, abuse, and ensure platform security</li>
                </ul>
              </section>

              {/* Information Sharing */}
              <section>
                <div className="flex items-center mb-4">
                  <Lock className="h-6 w-6 text-dental-600 mr-3" />
                  <h2 className="text-2xl font-semibold text-neutral-900">Information Sharing and Disclosure</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">Public Information</h3>
                    <p className="text-neutral-700">
                      Your profile information, published articles, forum posts, and other content you choose to make public will be visible to other users of the platform.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">We Do Not Sell Your Data</h3>
                    <p className="text-neutral-700">
                      We do not sell, trade, or rent your personal information to third parties for commercial purposes.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">Limited Sharing</h3>
                    <p className="text-neutral-700 mb-2">We may share your information only in these circumstances:</p>
                    <ul className="text-neutral-700 space-y-1 ml-4">
                      <li>• With your explicit consent</li>
                      <li>• To comply with legal obligations or court orders</li>
                      <li>• To protect the rights, property, or safety of DentalReach or our users</li>
                      <li>• With service providers who assist in platform operations (under strict confidentiality agreements)</li>
                      <li>• In connection with a business transfer or acquisition</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Data Security */}
              <section>
                <div className="flex items-center mb-4">
                  <Shield className="h-6 w-6 text-dental-600 mr-3" />
                  <h2 className="text-2xl font-semibold text-neutral-900">Data Security</h2>
                </div>
                
                <p className="text-neutral-700 mb-4">
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
                </p>
                
                <ul className="text-neutral-700 space-y-1 ml-4">
                  <li>• Encryption of data in transit and at rest</li>
                  <li>• Regular security assessments and updates</li>
                  <li>• Access controls and authentication requirements</li>
                  <li>• Secure hosting infrastructure</li>
                  <li>• Regular backups and disaster recovery procedures</li>
                </ul>
              </section>

              {/* Your Rights */}
              <section>
                <div className="flex items-center mb-4">
                  <UserCheck className="h-6 w-6 text-dental-600 mr-3" />
                  <h2 className="text-2xl font-semibold text-neutral-900">Your Rights and Choices</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">Account Management</h3>
                    <ul className="text-neutral-700 space-y-1 ml-4">
                      <li>• Update your profile and account information at any time</li>
                      <li>• Control your privacy settings and content visibility</li>
                      <li>• Delete your content or deactivate your account</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">Data Rights (GDPR/CCPA)</h3>
                    <ul className="text-neutral-700 space-y-1 ml-4">
                      <li>• Request access to your personal data</li>
                      <li>• Request correction of inaccurate information</li>
                      <li>• Request deletion of your personal data</li>
                      <li>• Request data portability</li>
                      <li>• Object to certain processing activities</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">Communication Preferences</h3>
                    <ul className="text-neutral-700 space-y-1 ml-4">
                      <li>• Manage email notification settings</li>
                      <li>• Opt out of marketing communications</li>
                      <li>• Control push notifications</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Cookies and Tracking */}
              <section>
                <div className="flex items-center mb-4">
                  <Eye className="h-6 w-6 text-dental-600 mr-3" />
                  <h2 className="text-2xl font-semibold text-neutral-900">Cookies and Tracking Technologies</h2>
                </div>
                
                <p className="text-neutral-700 mb-4">
                  We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. You can control cookie preferences through your browser settings.
                </p>
                
                <div className="space-y-2">
                  <p className="text-neutral-700"><strong>Essential Cookies:</strong> Required for platform functionality</p>
                  <p className="text-neutral-700"><strong>Analytics Cookies:</strong> Help us understand how you use our platform</p>
                  <p className="text-neutral-700"><strong>Preference Cookies:</strong> Remember your settings and preferences</p>
                </div>
              </section>

              {/* Data Retention */}
              <section>
                <div className="flex items-center mb-4">
                  <Lock className="h-6 w-6 text-dental-600 mr-3" />
                  <h2 className="text-2xl font-semibold text-neutral-900">Data Retention</h2>
                </div>
                
                <p className="text-neutral-700">
                  We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. When you delete your account, we will delete or anonymize your personal information, though some information may be retained for legal or operational purposes.
                </p>
              </section>

              {/* International Transfers */}
              <section>
                <div className="flex items-center mb-4">
                  <Globe className="h-6 w-6 text-dental-600 mr-3" />
                  <h2 className="text-2xl font-semibold text-neutral-900">International Data Transfers</h2>
                </div>
                
                <p className="text-neutral-700">
                  Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy and applicable data protection laws.
                </p>
              </section>

              {/* Children's Privacy */}
              <section>
                <div className="flex items-center mb-4">
                  <UserCheck className="h-6 w-6 text-dental-600 mr-3" />
                  <h2 className="text-2xl font-semibold text-neutral-900">Children's Privacy</h2>
                </div>
                
                <p className="text-neutral-700">
                  Our service is intended for professional use by dental professionals and is not directed at children under 18. We do not knowingly collect personal information from children under 18. If we become aware that we have collected such information, we will take steps to delete it promptly.
                </p>
              </section>

              {/* Changes to Privacy Policy */}
              <section>
                <div className="flex items-center mb-4">
                  <Shield className="h-6 w-6 text-dental-600 mr-3" />
                  <h2 className="text-2xl font-semibold text-neutral-900">Changes to This Privacy Policy</h2>
                </div>
                
                <p className="text-neutral-700">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
                </p>
              </section>

              {/* Contact Information */}
              <section className="bg-dental-50 -m-8 mt-8 p-8 rounded-b-xl">
                <div className="flex items-center mb-4">
                  <Mail className="h-6 w-6 text-dental-600 mr-3" />
                  <h2 className="text-2xl font-semibold text-neutral-900">Contact Us</h2>
                </div>
                
                <p className="text-neutral-700 mb-4">
                  If you have any questions about this Privacy Policy or our privacy practices, please contact us:
                </p>
                
                <div className="space-y-2 text-neutral-700">
                  <p><strong>Email:</strong> privacy@dentalreach.com</p>
                  <p><strong>Address:</strong> DentalReach Privacy Team</p>
                  <p className="ml-16">123 Healthcare Drive</p>
                  <p className="ml-16">Medical District, MD 12345</p>
                  <p className="ml-16">United States</p>
                </div>
                
                <div className="mt-6 p-4 bg-white rounded-lg border border-dental-200">
                  <p className="text-sm text-neutral-600">
                    <strong>Response Time:</strong> We typically respond to privacy-related inquiries within 5-7 business days. For urgent matters, please indicate "URGENT" in your subject line.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
