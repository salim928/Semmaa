// app/demo/page.tsx
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import PageHeader from '../components/PageHeader'
import DemoRequest from '../components/DemoRequest'

export const metadata = {
  title: 'Request Demo - SEMMA-AI',
  description: 'Schedule a personalized demo of SEMMA-AI and see how our AI-powered platform can transform your farming.',
}

export default function DemoPage() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&h=1080&fit=crop&q=80)',
          }}
        />
        <div className="absolute inset-0 bg-gray-50/92" />
      </div>
      
      <div className="relative z-10">
        <Navigation />
        <PageHeader 
          title="Experience SEMMA-AI"
          subtitle="Schedule a personalized demo and see the future of farming"
        />
        
        <div className="max-w-4xl mx-auto px-6 py-16">
        <DemoRequest />
        
        {/* What to Expect */}
        <div className="mt-16 bg-gradient-to-br from-lime-50 to-yellow-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            What to Expect in Your Demo
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Live AI Demonstrations</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-lime-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Crop health analysis using your photos</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-lime-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Personalized planting recommendations</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-lime-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Weather-based farming insights</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-lime-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Pest identification and treatment</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Features</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-lime-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Digital marketplace integration</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-lime-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Community features and networking</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-lime-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Real-time market prices</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-lime-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Custom farming dashboard</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ for Demo */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Demo FAQ</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">How long is the demo?</h3>
              <p className="text-gray-600">
                Our demos typically last 30-45 minutes, giving you enough time to explore all features and ask questions.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Is the demo free?</h3>
              <p className="text-gray-600">
                Absolutely! Our demos are completely free with no obligations. We want you to see the value firsthand.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Can I bring my team?</h3>
              <p className="text-gray-600">
                Yes! We encourage you to invite relevant team members. Group demos help everyone understand the benefits.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">What do I need to prepare?</h3>
              <p className="text-gray-600">
                Just bring your questions! If you have photos of your crops or specific challenges, we&apos;d love to address them.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
      </div>
    </main>
  )
}