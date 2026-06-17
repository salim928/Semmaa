// app/features/page.tsx
'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Navigation from '../components/Navigation'
import PageHeader from '../components/PageHeader'
import Footer from '../components/Footer'
import { 
  Bot, ShoppingCart, Users, BarChart3, Smartphone, Shield,
  Camera, MapPin, Cloud, Bell, MessageCircle, Zap,
  TrendingUp, Calendar, BookOpen, CreditCard
} from 'lucide-react'

const features = [
  {
    category: "AI & Advisory",
    items: [
      {
        icon: Bot,
        title: "AI Agricultural Assistant",
        description: "Get instant, personalized farming advice from our AI chatbot trained on local agricultural practices.",
        benefits: ["24/7 availability", "Local crop expertise", "Weather-based recommendations"]
      },
      {
        icon: Camera,
        title: "Crop Disease Detection",
        description: "Take photos of your crops to identify diseases and get treatment recommendations instantly.",
        benefits: ["Quick diagnosis", "Treatment plans", "Prevention tips"]
      },
      {
        icon: Cloud,
        title: "Weather Integration",
        description: "Receive accurate weather forecasts and farming alerts tailored to your location.",
        benefits: ["7-day forecasts", "Rainfall predictions", "Planting alerts"]
      }
    ]
  },
  {
    category: "Marketplace",
    items: [
      {
        icon: ShoppingCart,
        title: "Digital Marketplace",
        description: "Buy and sell agricultural products directly with verified farmers and buyers.",
        benefits: ["Direct transactions", "Fair pricing", "Quality assurance"]
      },
      {
        icon: CreditCard,
        title: "Secure Payments",
        description: "Multiple payment options including mobile money, bank transfers, and cash on delivery.",
        benefits: ["Mobile money support", "Secure transactions", "Payment protection"]
      },
      {
        icon: TrendingUp,
        title: "Price Analytics",
        description: "Access real-time market prices and historical trends for better selling decisions.",
        benefits: ["Live market prices", "Price trends", "Profit calculations"]
      }
    ]
  },
  {
    category: "Community",
    items: [
      {
        icon: Users,
        title: "Farmer Communities",
        description: "Connect with fellow farmers, share experiences, and learn from agricultural experts.",
        benefits: ["Expert knowledge sharing", "Peer support", "Regional groups"]
      },
      {
        icon: MessageCircle,
        title: "Direct Messaging",
        description: "Chat directly with buyers, sellers, and other farmers for seamless communication.",
        benefits: ["Real-time chat", "Image sharing", "Voice messages"]
      },
      {
        icon: BookOpen,
        title: "Learning Resources",
        description: "Access training materials, best practices, and agricultural guides.",
        benefits: ["Video tutorials", "Best practices", "Certification courses"]
      }
    ]
  },
  {
    category: "Tools & Analytics",
    items: [
      {
        icon: Calendar,
        title: "Planting Calendar",
        description: "Get personalized planting schedules based on your location and selected crops.",
        benefits: ["Optimal planting times", "Seasonal guidance", "Harvest predictions"]
      },
      {
        icon: BarChart3,
        title: "Farm Analytics",
        description: "Track your farm's performance with detailed analytics and reporting tools.",
        benefits: ["Yield tracking", "Cost analysis", "Profit reports"]
      },
      {
        icon: MapPin,
        title: "Field Mapping",
        description: "Map your fields and track crop rotation for better land management.",
        benefits: ["GPS field mapping", "Crop rotation tracking", "Land optimization"]
      }
    ]
  }
]

const integrations = [
  {
    name: "Ghana Meteorological Agency",
    description: "Real-time weather data and forecasts",
    logo: "🌤️"
  },
  {
    name: "Mobile Money Providers",
    description: "MTN, Vodafone, AirtelTigo payment integration",
    logo: "💳"
  },
  {
    name: "Agricultural Research Centers",
    description: "Latest farming techniques and crop varieties",
    logo: "🔬"
  },
  {
    name: "Financial Institutions",
    description: "Banking and microfinance partnerships",
    logo: "🏦"
  }
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <PageHeader
        title="Powerful Features"
        subtitle="Everything you need to modernize your agricultural operations and connect with the farming community"
        backgroundImage="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1920&auto=format&fit=crop&q=80"
      />

      {/* Feature Categories */}
      {features.map((category, categoryIndex) => (
        <section key={categoryIndex} className={`py-20 ${categoryIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">{category.category}</h2>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {category.items.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-amber-500 rounded-2xl flex items-center justify-center mb-6">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-gray-600 mb-6">{feature.description}</p>
                  
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Mobile App Features */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1920&h=1080&fit=crop&q=80)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-700/95 to-emerald-600/95" />
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-white"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Designed for Mobile-First Experience
              </h2>
              <p className="text-xl text-emerald-100 mb-8">
                Our app is specifically designed for farmers who rely on mobile devices, 
                with offline capabilities and low-bandwidth optimization.
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: Smartphone, text: "Works on any Android device" },
                  { icon: Zap, text: "Optimized for slow internet connections" },
                  { icon: Shield, text: "Secure data encryption" },
                  { icon: Bell, text: "Smart notifications and alerts" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <item.icon className="w-6 h-6 text-yellow-300" />
                    <span className="text-emerald-100">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-[600px]"
            >
              <Image
                src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&h=600&fit=crop"
                alt="Mobile App"
                fill
                className="rounded-2xl shadow-2xl object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1920&h=1080&fit=crop&q=80)',
            }}
          />
          <div className="absolute inset-0 bg-gray-50/90" />
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">Trusted Integrations</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We partner with leading organizations to provide you with the most accurate and reliable data
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {integrations.map((integration, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-lg text-center hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-4xl mb-4">{integration.logo}</div>
                <h3 className="text-lg font-bold mb-2">{integration.name}</h3>
                <p className="text-gray-600 text-sm">{integration.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
