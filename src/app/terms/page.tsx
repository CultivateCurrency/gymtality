export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        <div>
          <h1 className="text-4xl font-bold">Terms & Conditions</h1>
          <p className="text-zinc-400 mt-2">Last updated: March 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-orange-500">
            1. Acceptance of Terms
          </h2>
          <p className="text-zinc-300 leading-relaxed">
            By accessing or using the Forge Fitness platform, including our
            website, mobile applications, and all related services, you agree to
            be bound by these Terms and Conditions. If you do not agree to these
            terms, you may not use our services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-orange-500">
            2. User Accounts
          </h2>
          <p className="text-zinc-300 leading-relaxed">
            To use certain features of the platform, you must create an account.
            You are responsible for maintaining the confidentiality of your
            account credentials and for all activities that occur under your
            account.
          </p>
          <ul className="list-disc list-inside text-zinc-300 space-y-2">
            <li>You must provide accurate and complete information during registration</li>
            <li>You must be at least 13 years old to create an account</li>
            <li>You are responsible for keeping your password secure</li>
            <li>You must notify us immediately of any unauthorized use of your account</li>
            <li>
              We reserve the right to suspend or terminate accounts that violate
              these terms
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-orange-500">
            3. User Content
          </h2>
          <p className="text-zinc-300 leading-relaxed">
            You retain ownership of any content you submit, post, or display on
            the platform. By posting content, you grant Forge Fitness a
            non-exclusive, worldwide, royalty-free license to use, display,
            reproduce, and distribute your content in connection with operating
            the platform.
          </p>
          <p className="text-zinc-300 leading-relaxed">
            You agree not to post content that is illegal, harmful, threatening,
            abusive, harassing, defamatory, vulgar, obscene, or otherwise
            objectionable. We reserve the right to remove any content that
            violates these guidelines.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-orange-500">
            4. Coach & Professional Terms
          </h2>
          <p className="text-zinc-300 leading-relaxed">
            Coaches and fitness professionals using the platform agree to
            additional terms:
          </p>
          <ul className="list-disc list-inside text-zinc-300 space-y-2">
            <li>You must hold valid certifications for the services you offer</li>
            <li>
              All content you upload must be original or properly licensed
            </li>
            <li>
              Earnings are subject to the commission rate agreed upon during
              onboarding
            </li>
            <li>
              Payouts are processed monthly through Stripe, subject to their
              processing terms
            </li>
            <li>
              You are responsible for the accuracy and safety of your workout
              plans and advice
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-orange-500">
            5. Subscriptions & Payments
          </h2>
          <p className="text-zinc-300 leading-relaxed">
            Certain features require a paid subscription. By subscribing, you
            agree to pay the applicable fees for the plan you select.
            Subscriptions automatically renew unless cancelled before the
            renewal date.
          </p>
          <ul className="list-disc list-inside text-zinc-300 space-y-2">
            <li>Subscription fees are billed in advance on a monthly or annual basis</li>
            <li>Refunds are handled on a case-by-case basis</li>
            <li>
              We reserve the right to change subscription pricing with 30 days
              notice
            </li>
            <li>
              All payments are processed securely through Stripe
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-orange-500">
            6. Prohibited Activities
          </h2>
          <ul className="list-disc list-inside text-zinc-300 space-y-2">
            <li>Using the platform for any unlawful purpose</li>
            <li>Impersonating another person or entity</li>
            <li>Interfering with or disrupting the platform or servers</li>
            <li>Scraping, data mining, or harvesting user information</li>
            <li>Uploading viruses or malicious code</li>
            <li>Attempting to gain unauthorized access to other accounts</li>
            <li>Using the platform to send unsolicited communications</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-orange-500">
            7. Limitation of Liability
          </h2>
          <p className="text-zinc-300 leading-relaxed">
            Forge Fitness provides the platform on an &ldquo;as is&rdquo; and
            &ldquo;as available&rdquo; basis. We make no warranties, express or
            implied, regarding the reliability, accuracy, or availability of the
            platform.
          </p>
          <p className="text-zinc-300 leading-relaxed">
            To the maximum extent permitted by law, Forge Fitness shall not be
            liable for any indirect, incidental, special, consequential, or
            punitive damages, including but not limited to loss of profits, data,
            or other intangible losses.
          </p>
          <p className="text-zinc-300 leading-relaxed">
            Forge Fitness is not responsible for any injuries sustained while
            performing workouts or exercises found on the platform. Users should
            consult with a healthcare professional before beginning any new
            fitness program.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-orange-500">
            8. Intellectual Property
          </h2>
          <p className="text-zinc-300 leading-relaxed">
            The Forge Fitness name, logo, and all related branding are the
            property of Forge Fitness. The platform, including its design,
            features, and functionality, is protected by copyright, trademark,
            and other intellectual property laws.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-orange-500">
            9. Termination
          </h2>
          <p className="text-zinc-300 leading-relaxed">
            We may terminate or suspend your account at any time, with or
            without cause, with or without notice. Upon termination, your right
            to use the platform will immediately cease.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-orange-500">
            10. Changes to Terms
          </h2>
          <p className="text-zinc-300 leading-relaxed">
            We reserve the right to modify these terms at any time. Continued
            use of the platform after changes constitutes acceptance of the
            updated terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-orange-500">
            11. Contact
          </h2>
          <p className="text-zinc-300 leading-relaxed">
            If you have any questions about these Terms and Conditions, please
            contact us at:
          </p>
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300">
            <p>Email: legal@forgefitness.com</p>
            <p>Phone: 1-800-FORGE-FIT</p>
          </div>
        </section>
      </div>
    </div>
  );
}
