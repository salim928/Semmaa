// app/privacy/page.tsx
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import PageHeader from '../components/PageHeader'

export const metadata = {
  title: 'Privacy Policy - SEMMA-AI',
  description: 'Learn how SEMMA-AI protects and handles your personal information and data.',
}

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      <PageHeader 
        title="Privacy Policy"
        subtitle="How we protect and handle your information"
      />
      
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
            <div className="prose text-gray-600 space-y-4">
              <p>
                At SEMMA-AI, we collect information to provide better services to our users. 
                This includes information you provide directly, such as when you create an account, 
                contact us, or subscribe to our newsletter.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Personal information (name, email address, phone number)</li>
                <li>Agricultural data and farm information</li>
                <li>Usage data and analytics</li>
                <li>Device and browser information</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
            <div className="prose text-gray-600 space-y-4">
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide and improve our AI-powered agricultural services</li>
                <li>Send you relevant agricultural insights and recommendations</li>
                <li>Communicate with you about our services</li>
                <li>Ensure the security and integrity of our platform</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-600">
              We implement appropriate technical and organizational measures to protect your 
              personal information against unauthorized access, alteration, disclosure, or destruction. 
              Your data is encrypted both in transit and at rest.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Sharing</h2>
            <p className="text-gray-600">
              We do not sell, trade, or otherwise transfer your personal information to third parties 
              without your consent, except as described in this policy or as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
            <div className="prose text-gray-600 space-y-4">
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Delete your personal information</li>
                <li>Object to processing of your information</li>
                <li>Data portability</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions about this Privacy Policy, please contact us at:
              <br />
              Email: privacy@semma-ai.com
              <br />
              Address: Accra, Ghana
            </p>
          </section>

          <section>
            <p className="text-sm text-gray-500">
              This Privacy Policy was last updated on October 23, 2025.
            </p>
          </section>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}