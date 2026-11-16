import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

export default function TermsAndCondtion() {
  const navigate = useNavigate()
  return (
    <div className="relative min-h-screen w-full bg-[#CCE0F5]">
      <Header />
      
      {/* Spacer */}
      <div className="h-[60px] w-[40px]"></div>
      
      {/* Terms & Conditions Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12 border border-white/20">
          
          {/* Header Section */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Terms & Conditions
            </h1>
            <div className="space-y-2 text-sm sm:text-base text-gray-600">
              <p><span className="font-semibold">Effective Date:</span> 17/09/2025</p>
              <p><span className="font-semibold">Last Updated:</span> 17/09/2025</p>
            </div>
          </div>

          {/* Welcome Section */}
          <div className="mb-8 p-4 sm:p-6 bg-blue-50/50 rounded-lg border border-blue-200/30">
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
              Welcome to AlignTraits. These Terms & Conditions ("Terms") govern your use of the AlignTraits platform, website, mobile application, and services (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these Terms. If you do not agree, please discontinue use.
            </p>
          </div>

          {/* Terms Content */}
          <div className="space-y-8 text-gray-800">
            
            {/* 1. Definitions */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">1. Definitions</h2>
              <div className="space-y-2 text-sm sm:text-base leading-relaxed">
                <p><strong>"AlignTraits," "we," "our," or "us"</strong> refers to AlignTraits and its affiliates.</p>
                <p><strong>"User," "you," or "your"</strong> refers to the individual or entity accessing or using the Services.</p>
                <p><strong>"Platform"</strong> means the AlignTraits website, mobile application, and associated services.</p>
                <p><strong>"Content"</strong> means all text, graphics, data, recommendations, assessments, courses, and materials available through the Services.</p>
              </div>
            </section>

            {/* 2. Eligibility */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">2. Eligibility</h2>
              <ul className="space-y-2 text-sm sm:text-base leading-relaxed list-disc pl-6">
                <li>You must be at least 16 years old or the age of majority in your jurisdiction to use AlignTraits.</li>
                <li>If you are under 18, you may only use the Services under the supervision of a parent/guardian.</li>
                <li>By using AlignTraits, you confirm that you have the legal capacity to enter into these Terms.</li>
              </ul>
            </section>

            {/* 3. Services Overview */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">3. Services Overview</h2>
              <p className="mb-3 text-sm sm:text-base leading-relaxed">AlignTraits provides:</p>
              <ul className="space-y-2 text-sm sm:text-base leading-relaxed list-disc pl-6 mb-4">
                <li>AI-powered career pathway recommendations.</li>
                <li>Eligibility assessments and psychometric evaluations.</li>
                <li>Access to curated courses, training, and learning resources.</li>
                <li>Career development insights and tools.</li>
              </ul>
              <p className="text-sm sm:text-base leading-relaxed font-semibold text-amber-700">
                Note: AlignTraits does not guarantee admission into educational institutions, employment opportunities, or certification acceptance by third parties.
              </p>
            </section>

            {/* 4. User Accounts */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">4. User Accounts</h2>
              <ul className="space-y-2 text-sm sm:text-base leading-relaxed list-disc pl-6">
                <li>To use certain features, you must register an account.</li>
                <li>You agree to provide accurate, complete, and updated information.</li>
                <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
                <li>You must promptly notify us of any unauthorized use of your account.</li>
                <li>AlignTraits is not liable for any loss or damage resulting from unauthorized access.</li>
              </ul>
            </section>

            {/* 5. Acceptable Use */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">5. Acceptable Use</h2>
              <p className="mb-3 text-sm sm:text-base leading-relaxed">You agree not to:</p>
              <ul className="space-y-2 text-sm sm:text-base leading-relaxed list-disc pl-6">
                <li>Misuse the Services for fraudulent, illegal, or unauthorized purposes.</li>
                <li>Copy, modify, distribute, or reverse-engineer the platform.</li>
                <li>Submit false or misleading information.</li>
                <li>Interfere with or disrupt the security and functionality of the Services.</li>
                <li>Use automated systems (bots, scrapers, crawlers) without prior consent.</li>
              </ul>
            </section>

            {/* 6. Intellectual Property */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property</h2>
              <ul className="space-y-2 text-sm sm:text-base leading-relaxed list-disc pl-6">
                <li>All content on AlignTraits, including but not limited to design, logos, trademarks, algorithms, assessments, and materials, is the property of AlignTraits or its licensors.</li>
                <li>You are granted a limited, non-exclusive, non-transferable license to use the Services for personal, non-commercial purposes.</li>
                <li>Unauthorized reproduction or distribution of Content may result in legal action.</li>
              </ul>
            </section>

            {/* 7. Payments & Subscriptions */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">7. Payments & Subscriptions</h2>
              <ul className="space-y-2 text-sm sm:text-base leading-relaxed list-disc pl-6">
                <li>Certain features are available only through paid subscriptions or one-time fees.</li>
                <li>Prices, billing cycles, and payment methods are disclosed at the point of purchase.</li>
                <li>By subscribing, you authorize AlignTraits (or its payment processor) to charge your payment method.</li>
                <li>Subscriptions may automatically renew unless canceled before the renewal date.</li>
                <li>Refunds are handled in accordance with our <span onClick={() => navigate("/refund-policy")} className="text-blue-600 hover:text-blue-800 underline cursor-pointer">Refund Policy</span></li>
              </ul>
            </section>

            {/* 8. Third-Party Services */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">8. Third-Party Services</h2>
              <ul className="space-y-2 text-sm sm:text-base leading-relaxed list-disc pl-6">
                <li>AlignTraits may integrate with or recommend third-party services (e.g., training platforms, payment providers).</li>
                <li>AlignTraits is not responsible for the content, policies, or practices of third parties.</li>
                <li>Your use of third-party services is at your own risk and subject to their terms.</li>
              </ul>
            </section>

            {/* 9. Disclaimer of Warranties */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">9. Disclaimer of Warranties</h2>
              <p className="mb-3 text-sm sm:text-base leading-relaxed">The Services are provided on an "as is" and "as available" basis.</p>
              <p className="mb-3 text-sm sm:text-base leading-relaxed">We do not warrant that:</p>
              <ul className="space-y-2 text-sm sm:text-base leading-relaxed list-disc pl-6 mb-4">
                <li>The Services will be uninterrupted, secure, or error-free.</li>
                <li>The recommendations will guarantee career success, employment, or admissions.</li>
              </ul>
              <p className="text-sm sm:text-base leading-relaxed">
                AlignTraits disclaims all warranties, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.
              </p>
            </section>

            {/* 10. Limitation of Liability */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">10. Limitation of Liability</h2>
              <p className="mb-3 text-sm sm:text-base leading-relaxed">To the maximum extent permitted by law:</p>
              <ul className="space-y-2 text-sm sm:text-base leading-relaxed list-disc pl-6">
                <li>AlignTraits is not liable for any indirect, incidental, special, or consequential damages.</li>
                <li>Our total liability for any claim shall not exceed the amount you paid (if any) in the 6 months preceding the claim.</li>
                <li>You acknowledge that reliance on AI-generated recommendations carries inherent risks and that you remain solely responsible for career and educational decisions.</li>
              </ul>
            </section>

            {/* 11. Indemnification */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">11. Indemnification</h2>
              <p className="text-sm sm:text-base leading-relaxed">
                You agree to indemnify, defend, and hold harmless AlignTraits and its affiliates from any claims, damages, liabilities, and expenses arising from your use of the Services, violation of these Terms, or infringement of third-party rights.
              </p>
            </section>

            {/* 12. Termination */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">12. Termination</h2>
              <ul className="space-y-2 text-sm sm:text-base leading-relaxed list-disc pl-6">
                <li>We may suspend or terminate your account if you violate these Terms or misuse the Services.</li>
                <li>You may stop using AlignTraits at any time by deactivating your account.</li>
                <li>Upon termination, your license to use the Services ends immediately.</li>
              </ul>
            </section>

            {/* 13. Privacy & Data Protection */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">13. Privacy & Data Protection</h2>
              <ul className="space-y-2 text-sm sm:text-base leading-relaxed list-disc pl-6">
                <li>Your use of the Services is also governed by our <span onClick={() => navigate("/privacy-policy")} className="text-blue-600 hover:text-blue-800 underline cursor-pointer">Privacy Policy</span>.</li>
                <li>We are committed to protecting your personal data and complying with applicable data protection laws.</li>
                <li>You consent to the processing of your data in accordance with our Privacy Policy.</li>
              </ul>
            </section>

            {/* 14. Governing Law & Dispute Resolution */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">14. Governing Law & Dispute Resolution</h2>
              <ul className="space-y-2 text-sm sm:text-base leading-relaxed list-disc pl-6">
                <li>These Terms are governed by the laws of [Insert Jurisdiction].</li>
                <li>Any disputes will be resolved through binding arbitration or the courts of [Insert Jurisdiction], unless prohibited by local law.</li>
                <li>You agree to first attempt to resolve disputes informally by contacting us.</li>
              </ul>
            </section>

            {/* 15. Changes to Terms */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">15. Changes to Terms</h2>
              <ul className="space-y-2 text-sm sm:text-base leading-relaxed list-disc pl-6">
                <li>We reserve the right to update or modify these Terms at any time.</li>
                <li>Changes will be effective upon posting on the Platform.</li>
                <li>Your continued use of the Services after changes indicates acceptance.</li>
              </ul>
            </section>

            {/* 16. Contact Information */}
            <section className="bg-gray-50/50 p-4 sm:p-6 rounded-lg border border-gray-200/30">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">16. Contact Information</h2>
              <p className="text-sm sm:text-base leading-relaxed mb-2">
                For questions or concerns, please contact us at:
              </p>
              <p className="text-sm sm:text-base">
                <strong>Email:</strong> <a href="mailto:aligntraits@gmail.com" className="text-blue-600 hover:text-blue-800 underline">aligntraits@gmail.com</a>
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}