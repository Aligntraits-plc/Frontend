import Header from "../components/Header";

export default function RefundPolicy() {
  return (
    <div className="relative min-h-screen w-full bg-[#CCE0F5]">
      <Header />
      
      {/* Spacer */}
      <div className="h-[60px] w-[40px]"></div>
      
      {/* Refund Policy Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12 border border-white/20">
          
          {/* Header Section */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Refund Policy
            </h1>
            <div className="space-y-2 text-sm sm:text-base text-gray-600">
              <p><span className="font-semibold">Effective Date:</span> 17/09/2025</p>
              <p><span className="font-semibold">Last Updated:</span> 17/09/2025</p>
            </div>
          </div>

          {/* Introduction Section */}
          <div className="mb-8 p-4 sm:p-6 bg-blue-50/50 rounded-lg border border-blue-200/30">
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
              At AlignTraits, we are committed to providing valuable career assessments, recommendations, and training resources. This Refund Policy outlines when you may be eligible for a refund on payments made for our Services.
            </p>
          </div>

          {/* Refund Policy Content */}
          <div className="space-y-8 text-gray-800">
            
            {/* 1. General Policy */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">1. General Policy</h2>
              <ul className="space-y-2 text-sm sm:text-base leading-relaxed list-disc pl-6">
                <li>
                  All subscription and one-time payments made through AlignTraits are{" "}
                  <span className="font-bold text-red-700">final and non-refundable</span>, except as provided in this Policy.
                </li>
                <li>By purchasing a subscription or service, you acknowledge and agree to this Refund Policy.</li>
              </ul>
            </section>

            {/* 2. Eligible Refunds */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">2. Eligible Refunds</h2>
              <p className="mb-4 text-sm sm:text-base leading-relaxed">
                You may be eligible for a refund under the following circumstances:
              </p>
              <div className="bg-green-50/50 p-4 sm:p-6 rounded-lg border border-green-200/30">
                <ol className="space-y-3 text-sm sm:text-base leading-relaxed list-decimal pl-6">
                  <li>
                    <strong>Duplicate Payment</strong> – If you were accidentally charged twice for the same service.
                  </li>
                  <li>
                    <strong>Technical Issues</strong> – If you were unable to access the purchased service due to a verified technical error on our platform.
                  </li>
                  <li>
                    <strong>Service Unavailability</strong> – If AlignTraits permanently discontinues a paid service before the end of your subscription period.
                  </li>
                </ol>
              </div>
            </section>

            {/* 3. Non-Refundable Cases */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">3. Non-Refundable Cases</h2>
              <div className="bg-red-50/50 p-4 sm:p-6 rounded-lg border border-red-200/30">
                <p className="mb-3 text-sm sm:text-base leading-relaxed font-semibold text-red-800">
                  Refunds will <strong>not</strong> be issued for:
                </p>
                <ul className="space-y-2 text-sm sm:text-base leading-relaxed list-disc pl-6">
                  <li>Change of mind after purchase.</li>
                  <li>Dissatisfaction with AI-generated recommendations or assessment results (as outcomes are based on data provided and algorithms).</li>
                  <li>Partial use of subscription (e.g., canceling mid-cycle).</li>
                  <li>Issues caused by third-party services, internet connectivity, or device limitations.</li>
                </ul>
              </div>
            </section>

            {/* 4. Subscription Cancellations */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">4. Subscription Cancellations</h2>
              <ul className="space-y-2 text-sm sm:text-base leading-relaxed list-disc pl-6">
                <li>Subscriptions may be <strong>canceled at any time</strong> via your account settings.</li>
                <li>Cancellation will stop the next billing cycle but does not grant a refund for the current cycle.</li>
                <li>You will continue to have access until the end of the paid period.</li>
              </ul>
            </section>

            {/* 5. Refund Request Process */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">5. Refund Request Process</h2>
              <p className="mb-4 text-sm sm:text-base leading-relaxed">To request a refund:</p>
              <div className="bg-amber-50/50 p-4 sm:p-6 rounded-lg border border-amber-200/30">
                <ol className="space-y-3 text-sm sm:text-base leading-relaxed list-decimal pl-6">
                  <li>
                    Contact our Support Team at{" "}
                    <a href="mailto:support@aligntraits.com" className="text-blue-600 hover:text-blue-800 underline">
                      support@aligntraits.com
                    </a>{" "}
                    within <strong>7 days</strong> of the transaction.
                  </li>
                  <li>Provide your order ID, payment receipt, and a brief explanation of the issue.</li>
                  <li>
                    Refunds (if approved) will be processed to the original payment method within{" "}
                    <strong>5–10 business days</strong>.
                  </li>
                </ol>
              </div>
            </section>

            {/* 6. Third-Party Purchases */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">6. Third-Party Purchases</h2>
              <div className="bg-purple-50/50 p-4 sm:p-6 rounded-lg border border-purple-200/30">
                <p className="text-sm sm:text-base leading-relaxed">
                  If you purchased AlignTraits services through a third-party platform (e.g., App Store, Google Play, or a partner service), their refund policies apply. Please contact the respective provider directly.
                </p>
              </div>
            </section>

            {/* 7. Policy Updates */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">7. Policy Updates</h2>
              <p className="text-sm sm:text-base leading-relaxed">
                We may update this Refund Policy from time to time. Any changes will be effective when posted on our platform.
              </p>
            </section>

            {/* 8. Contact Us */}
            <section className="bg-gray-50/50 p-4 sm:p-6 rounded-lg border border-gray-200/30">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">8. Contact Us</h2>
              <p className="text-sm sm:text-base leading-relaxed mb-2">
                For questions about refunds, please contact:
              </p>
              <div className="space-y-1 text-sm sm:text-base">
                <p><strong>AlignTraits Support</strong></p>
                <p><strong>Email:</strong> <a href="mailto:aligntraits@gmail.com" className="text-blue-600 hover:text-blue-800 underline">aligntraits@gmail.com</a></p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}