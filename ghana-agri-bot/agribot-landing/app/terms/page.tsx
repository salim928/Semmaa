// app/terms/page.tsx
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import PageHeader from '../components/PageHeader'

export const metadata = {
  title: 'Terms of Service - SEMMA-AI',
  description: 'Terms and conditions for using SEMMA-AI agricultural platform.',
}

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      <PageHeader 
        title="Terms of Service"
        subtitle="Terms and conditions for using our platform"
      />
      
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceptance of Terms</h2>
            <p className="text-gray-600">
              By accessing and using SEMMA-AI services, you accept and agree to be bound by 
              the terms and provision of this agreement. If you do not agree to abide by 
              the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Use License</h2>
            <div className="prose text-gray-600 space-y-4">
              <p>
                Permission is granted to temporarily use SEMMA-AI services for personal, 
                non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
              </p>
              <p>Under this license you may not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on our platform</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Description</h2>
            <p className="text-gray-600">
              SEMMA-AI provides AI-powered agricultural insights, marketplace services, 
              and community features for farmers in Ghana and beyond. Our services include 
              but are not limited to crop recommendations, weather forecasting, pest management, 
              and agricultural marketplace access.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">User Responsibilities</h2>
            <div className="prose text-gray-600 space-y-4">
              <p>As a user of SEMMA-AI, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate and truthful information</li>
                <li>Use the service in compliance with all applicable laws</li>
                <li>Not interfere with or disrupt the service</li>
                <li>Not use the service for any unlawful purpose</li>
                <li>Respect the intellectual property rights of others</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Disclaimer</h2>
            <p className="text-gray-600">
              The materials on SEMMA-AI&apos;s website are provided on an &apos;as is&apos; basis. 
              SEMMA-AI makes no warranties, expressed or implied, and hereby disclaims 
              and negates all other warranties including without limitation, implied warranties 
              or conditions of merchantability, fitness for a particular purpose, 
              or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitations</h2>
            <p className="text-gray-600">
              In no event shall SEMMA-AI or its suppliers be liable for any damages 
              (including, without limitation, damages for loss of data or profit, 
              or due to business interruption) arising out of the use or inability 
              to use the materials on SEMMA-AI&apos;s website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Revisions and Errata</h2>
            <p className="text-gray-600">
              The materials appearing on SEMMA-AI&apos;s website could include technical, 
              typographical, or photographic errors. SEMMA-AI does not warrant that 
              any of the materials on its website are accurate, complete, or current.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <p className="text-gray-600">
              If you have any questions about these Terms of Service, please contact us at:
              <br />
              Email: legal@semma-ai.com
              <br />
              Address: Accra, Ghana
            </p>
          </section>

          <section>
            <p className="text-sm text-gray-500">
              These Terms of Service were last updated on October 23, 2025.
            </p>
          </section>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}