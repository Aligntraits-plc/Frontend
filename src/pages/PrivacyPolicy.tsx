import Header from "../components/Header";

export default function PrivacyPolicy() {
  return (
    <div className="relative min-h-screen w-full bg-[#CCE0F5]">
      <Header />
      
      {/* Spacer */}
      <div className="h-[60px] w-[40px]"></div>
      
      {/* Privacy Policy Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12 border border-white/20">
          
          {/* Header Section */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <div className="space-y-2 text-sm sm:text-base text-gray-600">
              <p><span className="font-semibold">Effective Date:</span> 17/09/2025</p>
              <p><span className="font-semibold">Last Updated:</span> 17/09/2025</p>
            </div>
          </div>

          {/* Introduction Section */}
          <div className="mb-8 p-4 sm:p-6 bg-blue-50/50 rounded-lg border border-blue-200/30">
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
              AlignTraits ("we," "our," "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, share, and protect your personal data when you access our website, mobile app, and related services (collectively, the "Services").
            </p>
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base mt-3 font-semibold">
              By using AlignTraits, you consent to the practices described in this Privacy Policy.
            </p>
          </div>

          {/* Privacy Policy Content */}
          <div className="space-y-8 text-gray-800">
            
            {/* 1. Information We Collect */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="mb-4 text-sm sm:text-base leading-relaxed">We collect the following categories of information:</p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">a Information You Provide Directly</h3>
                  <ul className="space-y-1 text-sm sm:text-base leading-relaxed list-disc pl-6">
                    <li><strong>Account Information:</strong> Name, email, password, phone number.</li>
                    <li><strong>Profile Data:</strong> Date of birth, education background, career interests, skills.</li>
                    <li><strong>Payment Details:</strong> Billing address, payment method (processed by third-party providers).</li>
                    <li><strong>Communications:</strong> Messages sent to customer support, surveys, or feedback forms.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">b) Information Collected Automatically</h3>
                  <ul className="space-y-1 text-sm sm:text-base leading-relaxed list-disc pl-6">
                    <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers.</li>
                    <li><strong>Usage Data:</strong> Pages visited, features used, time spent on the platform, clickstream data.</li>
                    <li><strong>Cookies & Tracking:</strong> We use cookies and similar technologies to enhance user experience and analyze performance.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">c) Assessment & Career Data</h3>
                  <ul className="space-y-1 text-sm sm:text-base leading-relaxed list-disc pl-6">
                    <li>Responses to psychometric tests, eligibility assessments, and career questionnaires.</li>
                    <li>Learning history and recommended courses.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 2. How We Use Your Information */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="mb-3 text-sm sm:text-base leading-relaxed">We process your personal data for:</p>
              <ul className="space-y-2 text-sm sm:text-base leading-relaxed list-disc pl-6">
                <li><strong>Service Delivery</strong> – providing career recommendations, eligibility assessments, and access to courses.</li>
                <li><strong>Account Management</strong> – creating, maintaining, and securing your account.</li>
                <li><strong>Payments</strong> – processing subscriptions and transactions securely.</li>
                <li><strong>Personalization</strong> – tailoring recommendations and learning pathways.</li>
                <li><strong>Analytics</strong> – improving platform performance and user experience.</li>
                <li><strong>Communication</strong> – sending service updates, marketing (with consent), and support messages.</li>
                <li><strong>Legal & Compliance</strong> – meeting legal obligations and preventing fraud.</li>
              </ul>
            </section>

            {/* 3. Legal Basis for Processing */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">3. Legal Basis for Processing</h2>
              <p className="mb-3 text-sm sm:text-base leading-relaxed">We rely on the following legal grounds (where applicable):</p>
              <ul className="space-y-1 text-sm sm:text-base leading-relaxed list-disc pl-6">
                <li><strong>Consent</strong> (e.g., marketing communications).</li>
                <li><strong>Contractual necessity</strong> (e.g., delivering Services you subscribe to).</li>
                <li><strong>Legitimate interests</strong> (e.g., improving services, fraud prevention).</li>
                <li><strong>Legal obligations</strong> (e.g., tax, regulatory requirements).</li>
              </ul>
            </section>

            {/* 4. Sharing of Information */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">4. Sharing of Information</h2>
              <p className="mb-3 text-sm sm:text-base leading-relaxed">We may share your information with:</p>
              <ul className="space-y-2 text-sm sm:text-base leading-relaxed list-disc pl-6 mb-4">
                <li><strong>Service Providers:</strong> Payment processors, cloud hosting, analytics, customer support tools.</li>
                <li><strong>Educational/Training Partners:</strong> To recommend or enroll you in third-party courses (only with your consent).</li>
                <li><strong>Legal Authorities:</strong> When required to comply with law or enforce our Terms.</li>
                <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets.</li>
              </ul>
              <div className="p-3 bg-green-50/50 rounded-lg border border-green-200/30">
                <p className="text-sm sm:text-base leading-relaxed font-semibold text-green-800">
                  We do not sell your personal information to third parties.
                </p>
              </div>
            </section>

            {/* 5. Data Retention */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">5. Data Retention</h2>
              <ul className="space-y-2 text-sm sm:text-base leading-relaxed list-disc pl-6">
                <li>We retain your personal data only as long as necessary for the purposes outlined in this Privacy Policy.</li>
                <li>Assessment and career data may be retained for research, analytics, and service improvement, but can be anonymized upon request.</li>
                <li>You may request deletion of your account and associated data at any time.</li>
              </ul>
            </section>

            {/* 6. Your Rights */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">6. Your Rights</h2>
              <p className="mb-3 text-sm sm:text-base leading-relaxed">Depending on your jurisdiction, you may have the right to:</p>
              <ul className="space-y-1 text-sm sm:text-base leading-relaxed list-disc pl-6 mb-4">
                <li>Access your personal data.</li>
                <li>Request correction or deletion.</li>
                <li>Restrict or object to processing.</li>
                <li>Withdraw consent (where processing is based on consent).</li>
                <li>Port your data to another service.</li>
                <li>File a complaint with your local data protection authority.</li>
              </ul>
              <p className="text-sm sm:text-base leading-relaxed">
                Requests can be made by contacting us at <a href="mailto:privacy@aligntraits.com" className="text-blue-600 hover:text-blue-800 underline">privacy@aligntraits.com</a>.
              </p>
            </section>

            {/* 7. Cookies & Tracking */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">7. Cookies & Tracking</h2>
              <ul className="space-y-2 text-sm sm:text-base leading-relaxed list-disc pl-6">
                <li>We use cookies, pixels, and analytics tools to personalize content and measure platform performance.</li>
                <li>You can manage cookie preferences in your browser settings.</li>
                <li>Some features may not work properly if you disable cookies.</li>
              </ul>
            </section>

            {/* 8. Data Security */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">8. Data Security</h2>
              <ul className="space-y-2 text-sm sm:text-base leading-relaxed list-disc pl-6">
                <li>We implement administrative, technical, and organizational safeguards to protect your information.</li>
                <li>However, no system is 100% secure. We cannot guarantee absolute security.</li>
              </ul>
            </section>

            {/* 9. International Data Transfers */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">9. International Data Transfers</h2>
              <ul className="space-y-2 text-sm sm:text-base leading-relaxed list-disc pl-6">
                <li>Your data may be processed in jurisdictions outside your country of residence.</li>
                <li>Where applicable, we use safeguards such as Standard Contractual Clauses (SCCs) to protect international data transfers.</li>
              </ul>
            </section>

            {/* 10. Children's Privacy */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">10. Children's Privacy</h2>
              <ul className="space-y-2 text-sm sm:text-base leading-relaxed list-disc pl-6">
                <li>AlignTraits is not directed at children under 16 years of age.</li>
                <li>We do not knowingly collect personal data from minors without parental consent.</li>
                <li>If you believe we have collected such data, please contact us for deletion.</li>
              </ul>
            </section>

            {/* 11. Changes to This Privacy Policy */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
              <ul className="space-y-2 text-sm sm:text-base leading-relaxed list-disc pl-6">
                <li>We may update this Privacy Policy from time to time.</li>
                <li>Any changes will be posted on our platform with a new "Last Updated" date.</li>
                <li>Continued use of the Services after updates constitutes acceptance.</li>
              </ul>
            </section>

            {/* 12. Contact Us */}
            <section className="bg-gray-50/50 p-4 sm:p-6 rounded-lg border border-gray-200/30">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
              <p className="text-sm sm:text-base leading-relaxed mb-2">
                For questions or concerns regarding privacy:
              </p>
              <div className="space-y-1 text-sm sm:text-base">
                <p><strong>AlignTraits Privacy Team</strong></p>
                <p><strong>Email:</strong> <a href="mailto:aligntraits@gmail.com" className="text-blue-600 hover:text-blue-800 underline">aligntraits@gmail.com</a></p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}