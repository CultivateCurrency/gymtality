export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        <div>
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
          <p className="text-zinc-400 mt-2">Last updated: March 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-orange-500">
            1. Information We Collect
          </h2>
          <p className="text-zinc-300 leading-relaxed">
            We collect information you provide directly to us when you create an
            account, fill out your fitness profile, make purchases, or contact
            support. This includes your name, email address, profile photo, date
            of birth, fitness goals, and payment information.
          </p>
          <p className="text-zinc-300 leading-relaxed">
            We also automatically collect certain information when you use our
            platform, including your IP address, browser type, device
            information, pages visited, and interactions with content.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-orange-500">
            2. How We Use Your Information
          </h2>
          <ul className="list-disc list-inside text-zinc-300 space-y-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Personalize your workout recommendations and content</li>
            <li>Process transactions and send related notifications</li>
            <li>Send you technical notices, updates, and support messages</li>
            <li>
              Communicate with you about products, services, and events offered
              by Forge Fitness
            </li>
            <li>Monitor and analyze usage trends to improve user experience</li>
            <li>Detect, investigate, and prevent fraudulent or unauthorized activity</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-orange-500">
            3. Cookies & Tracking
          </h2>
          <p className="text-zinc-300 leading-relaxed">
            We use cookies and similar tracking technologies to collect and track
            information about your activity on our platform. Cookies help us
            remember your preferences, maintain your session, and understand how
            you interact with our services.
          </p>
          <p className="text-zinc-300 leading-relaxed">
            You can control cookie settings through your browser. Disabling
            cookies may limit your ability to use certain features of the
            platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-orange-500">
            4. Third-Party Services
          </h2>
          <p className="text-zinc-300 leading-relaxed">
            We may share your information with third-party service providers who
            perform services on our behalf, including:
          </p>
          <ul className="list-disc list-inside text-zinc-300 space-y-2">
            <li>
              <strong>Stripe</strong> — for payment processing and subscription
              management
            </li>
            <li>
              <strong>Amazon Web Services</strong> — for cloud hosting, email
              delivery (SES), file storage (S3), and live streaming (IVS)
            </li>
            <li>
              <strong>QuickBlox</strong> — for in-app messaging, audio, and
              video calls
            </li>
            <li>
              <strong>Apple Health / Google Fit</strong> — for syncing wearable
              fitness data (only with your explicit consent)
            </li>
          </ul>
          <p className="text-zinc-300 leading-relaxed">
            These providers are contractually obligated to protect your data and
            only use it as directed by us.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-orange-500">
            5. Data Security
          </h2>
          <p className="text-zinc-300 leading-relaxed">
            We take reasonable measures to protect your personal information
            from unauthorized access, alteration, disclosure, or destruction.
            This includes encryption of sensitive data, secure server
            infrastructure, and regular security audits.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-orange-500">
            6. Your Rights
          </h2>
          <p className="text-zinc-300 leading-relaxed">
            You have the right to access, update, or delete your personal
            information at any time through your account settings. You may also
            request a copy of all data we hold about you or ask us to restrict
            processing of your data.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-orange-500">
            7. Children&apos;s Privacy
          </h2>
          <p className="text-zinc-300 leading-relaxed">
            Our platform is not intended for children under the age of 13. We do
            not knowingly collect personal information from children under 13.
            If we become aware that we have collected such information, we will
            take steps to delete it.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-orange-500">
            8. Changes to This Policy
          </h2>
          <p className="text-zinc-300 leading-relaxed">
            We may update this privacy policy from time to time. We will notify
            you of any changes by posting the new policy on this page and
            updating the &ldquo;Last updated&rdquo; date.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-orange-500">
            9. Contact Us
          </h2>
          <p className="text-zinc-300 leading-relaxed">
            If you have any questions about this Privacy Policy, please contact
            us at:
          </p>
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300">
            <p>Email: privacy@forgefitness.com</p>
            <p>Phone: 1-800-FORGE-FIT</p>
          </div>
        </section>
      </div>
    </div>
  );
}
