// app/faq/page.tsx
'use client'

import { useState } from 'react'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'
import PageHeader from '../components/PageHeader'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
  category: string
}

const faqData: FAQItem[] = [
  {
    category: 'General',
    question: 'What is SEMMA-AI?',
    answer: 'SEMMA-AI is an AI-powered agricultural platform designed to revolutionize farming in Ghana and beyond. We provide smart insights, digital marketplace access, and community features to help farmers grow smarter and harvest bigger.'
  },
  {
    category: 'General',
    question: 'How does SEMMA-AI help farmers?',
    answer: 'We provide AI-driven crop recommendations, weather forecasting, pest and disease management, market price insights, and connect farmers with buyers and suppliers through our digital marketplace.'
  },
  {
    category: 'Features',
    question: 'What AI features does SEMMA-AI offer?',
    answer: 'Our AI capabilities include crop health analysis through image recognition, predictive weather patterns, optimal planting recommendations, pest identification, yield forecasting, and personalized farming advice based on local conditions.'
  },
  {
    category: 'Features',
    question: 'Can I access market prices through SEMMA-AI?',
    answer: 'Yes! Our platform provides real-time market prices for various crops, connects you with verified buyers, and offers market trend analysis to help you make informed selling decisions.'
  },
  {
    category: 'Technical',
    question: 'Do I need internet to use SEMMA-AI?',
    answer: 'While many features require internet connectivity, we&apos;re developing offline capabilities for essential functions. You can access basic recommendations and previously downloaded content without internet.'
  },
  {
    category: 'Technical',
    question: 'Is SEMMA-AI available on mobile phones?',
    answer: 'Yes, SEMMA-AI is designed to be mobile-first and works on smartphones, tablets, and computers. We&apos;re also developing dedicated mobile apps for Android and iOS.'
  },
  {
    category: 'Pricing',
    question: 'How much does SEMMA-AI cost?',
    answer: 'We offer multiple pricing tiers including a free basic plan for small-scale farmers, and affordable premium plans with advanced features. Our goal is to make agricultural technology accessible to all farmers.'
  },
  {
    category: 'Pricing',
    question: 'Is there a free trial available?',
    answer: 'Absolutely! We offer a free trial of our premium features so you can experience the full power of SEMMA-AI before making a commitment.'
  },
  {
    category: 'Support',
    question: 'What kind of support do you provide?',
    answer: 'We provide comprehensive support including online documentation, video tutorials, live chat support, phone support in local languages, and on-ground agricultural experts in select regions.'
  },
  {
    category: 'Support',
    question: 'Do you provide training for farmers?',
    answer: 'Yes, we offer training programs both online and in-person to help farmers make the most of our platform. We also work with agricultural extension services and cooperatives.'
  }
]

const categories = ['All', 'General', 'Features', 'Technical', 'Pricing', 'Support']

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [openItems, setOpenItems] = useState<number[]>([])

  const filteredFAQs = activeCategory === 'All' 
    ? faqData 
    : faqData.filter(item => item.category === activeCategory)

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      <PageHeader 
        title="Frequently Asked Questions"
        subtitle="Find answers to common questions about SEMMA-AI"
      />
      
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-12 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2 rounded-full transition-colors ${
                activeCategory === category
                  ? 'bg-lime-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.map((item, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button
                onClick={() => toggleItem(index)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div>
                  <span className="inline-block px-3 py-1 bg-lime-100 text-lime-700 text-sm rounded-full mb-2">
                    {item.category}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.question}
                  </h3>
                </div>
                {openItems.includes(index) ? (
                  <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                )}
              </button>
              
              {openItems.includes(index) && (
                <div className="px-6 pb-6">
                  <p className="text-gray-600 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-br from-lime-50 to-yellow-50 rounded-2xl p-8 mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Still have questions?
          </h2>
          <p className="text-gray-600 mb-6">
            Our team is here to help! Get in touch with us for personalized assistance.
          </p>
          <div className="space-x-4">
            <a
              href="/contact"
              className="inline-block bg-lime-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-lime-700 transition-colors"
            >
              Contact Us
            </a>
            <a
              href="/support"
              className="inline-block border-2 border-lime-600 text-lime-600 px-6 py-3 rounded-lg font-semibold hover:bg-lime-50 transition-colors"
            >
              Get Support
            </a>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}