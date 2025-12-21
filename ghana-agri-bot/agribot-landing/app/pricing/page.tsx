// app/pricing/page.tsx
'use client'

import { motion } from 'framer-motion'
import Navigation from '../components/Navigation'
import PageHeader from '../components/PageHeader'
import Footer from '../components/Footer'
import { Check, Star, Zap, Crown } from 'lucide-react'

const plans = [
  {
    name: "Basic",
    price: "Free",
    period: "Forever",
    description: "Perfect for small-scale farmers getting started",
    icon: Star,
    color: "from-gray-500 to-gray-600",
    features: [
      "AI farming assistant (5 queries/day)",
      "Basic weather forecasts",
      "Community access",
      "Basic marketplace listing",
      "Mobile app access",
      "SMS notifications"
    ],
    limitations: [
      "Limited AI queries",
      "Basic analytics only",
      "Standard support"
    ]
  },
  {
    name: "Professional",
    price: "₵25",
    period: "per month",
    description: "Ideal for growing farms and commercial farmers",
    icon: Zap,
    color: "from-lime-500 to-lime-600",
    popular: true,
    features: [
      "Unlimited AI farming assistant",
      "Advanced weather alerts",
      "Premium marketplace features",
      "Crop disease detection",
      "Farm analytics dashboard",
      "Priority customer support",
      "Price trend analysis",
      "Planting calendar",
      "Field mapping tools",
      "Bulk order management"
    ],
    limitations: []
  },
  {
    name: "Enterprise",
    price: "₵100",
    period: "per month",
    description: "For large farms and agricultural cooperatives",
    icon: Crown,
    color: "from-yellow-500 to-orange-600",
    features: [
      "Everything in Professional",
      "Multi-user accounts",
      "Custom AI training",
      "Advanced analytics & reporting",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
      "Bulk SMS campaigns",
      "Training workshops",
      "Priority feature requests"
    ],
    limitations: []
  }
]

const faqs = [
  {
    question: "Is there a free trial for paid plans?",
    answer: "Yes! We offer a 14-day free trial for both Professional and Enterprise plans. No credit card required."
  },
  {
    question: "Can I change my plan anytime?",
    answer: "Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept mobile money (MTN, Vodafone, AirtelTigo), bank transfers, and credit/debit cards."
  },
  {
    question: "Do you offer discounts for cooperatives?",
    answer: "Yes! We offer special pricing for agricultural cooperatives and farmer groups. Contact us for details."
  },
  {
    question: "Is my data secure?",
    answer: "Your data is encrypted and stored securely. We comply with international data protection standards."
  },
  {
    question: "Can I use the app offline?",
    answer: "Many features work offline, including viewing saved content and basic calculations. Internet is needed for AI queries and marketplace features."
  }
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <PageHeader
        title="Simple, Transparent Pricing"
        subtitle="Choose the plan that's right for your farming operation. Start free, upgrade when you need more."
        backgroundImage="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1920&auto=format&fit=crop&q=80"
      />

      {/* Pricing Plans */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&h=1080&fit=crop&q=80)',
            }}
          />
          <div className="absolute inset-0 bg-white/88" />
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 ${
                  plan.popular ? 'ring-2 ring-lime-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-lime-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  <div className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-2xl flex items-center justify-center mb-6`}>
                    <plan.icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.price !== "Free" && (
                      <span className="text-gray-600 ml-2">/{plan.period}</span>
                    )}
                  </div>

                  <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-lime-500 text-white hover:bg-lime-600'
                      : 'border-2 border-gray-300 text-gray-700 hover:border-lime-500 hover:text-lime-500'
                  }`}>
                    {plan.price === "Free" ? "Get Started" : "Start Free Trial"}
                  </button>

                  <ul className="mt-8 space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-lime-50 via-white to-yellow-50"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-lime-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-200/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-4">
              <span className="bg-lime-100 text-lime-700 px-4 py-2 rounded-full text-sm font-semibold">
                Detailed Breakdown
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              Feature Comparison
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what&apos;s included in each plan and choose the perfect fit for your farming needs
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="overflow-x-auto"
          >
            <table className="w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-lime-100">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <th className="text-left p-6 font-bold text-gray-900 text-lg">Features</th>
                  <th className="text-center p-6 font-bold text-gray-900 text-lg">
                    <div className="flex flex-col items-center">
                      <Star className="w-6 h-6 text-gray-600 mb-2" />
                      <span>Basic</span>
                    </div>
                  </th>
                  <th className="text-center p-6 font-bold text-lime-700 text-lg bg-lime-50/50">
                    <div className="flex flex-col items-center">
                      <Zap className="w-6 h-6 text-lime-600 mb-2" />
                      <span>Professional</span>
                      <span className="text-xs font-normal text-lime-600 mt-1">Most Popular</span>
                    </div>
                  </th>
                  <th className="text-center p-6 font-bold text-gray-900 text-lg">
                    <div className="flex flex-col items-center">
                      <Crown className="w-6 h-6 text-yellow-600 mb-2" />
                      <span>Enterprise</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "AI Farming Assistant", basic: "5 queries/day", pro: "Unlimited", enterprise: "Unlimited + Custom Training", icon: "🤖" },
                  { feature: "Weather Forecasts", basic: "Basic", pro: "Advanced + Alerts", enterprise: "Premium + Custom Areas", icon: "⛅" },
                  { feature: "Marketplace Access", basic: "Basic Listing", pro: "Premium Features", enterprise: "Advanced + API", icon: "🛒" },
                  { feature: "Community Features", basic: "✓", pro: "✓", enterprise: "✓ + Private Groups", icon: "👥" },
                  { feature: "Farm Analytics", basic: "Basic", pro: "Advanced", enterprise: "Custom Dashboards", icon: "📊" },
                  { feature: "Support", basic: "Standard", pro: "Priority", enterprise: "Dedicated Manager", icon: "💬" },
                ].map((row, index) => (
                  <tr 
                    key={index} 
                    className={`border-t border-gray-100 hover:bg-lime-50/30 transition-colors ${
                      index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/30'
                    }`}
                  >
                    <td className="p-6 font-semibold text-gray-900">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{row.icon}</span>
                        <span>{row.feature}</span>
                      </div>
                    </td>
                    <td className="text-center p-6 text-gray-700">
                      <span className="inline-block px-3 py-1 bg-gray-100 rounded-lg">
                        {row.basic}
                      </span>
                    </td>
                    <td className="text-center p-6 bg-lime-50/50 text-lime-900 font-medium">
                      <span className="inline-block px-3 py-1 bg-lime-100 rounded-lg">
                        {row.pro}
                      </span>
                    </td>
                    <td className="text-center p-6 text-gray-700">
                      <span className="inline-block px-3 py-1 bg-yellow-50 rounded-lg">
                        {row.enterprise}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* CTA Below Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12"
          >
            <p className="text-gray-600 mb-6">Still not sure which plan is right for you?</p>
            <button className="bg-lime-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-lime-600 transition-colors shadow-lg hover:shadow-xl">
              Talk to Our Team
            </button>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1920&h=1080&fit=crop&q=80)',
            }}
          />
          <div className="absolute inset-0 bg-white/90" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">Frequently Asked Questions</h2>
          </motion.div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-lg"
              >
                <h3 className="text-lg font-semibold mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
