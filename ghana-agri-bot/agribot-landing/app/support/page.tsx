// app/support/page.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Navigation from '../components/Navigation'
import PageHeader from '../components/PageHeader'
import Footer from '../components/Footer'
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  ChevronDown,
  Send,
  HelpCircle,
  Book,
  Users,
  Zap
} from 'lucide-react'

const supportChannels = [
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Chat with our support team in real-time",
    availability: "Available 24/7",
    action: "Start Chat",
    color: "from-lime-500 to-green-600"
  },
  {
    icon: Phone,
    title: "Phone Support",
    description: "Speak directly with our experts",
    availability: "Mon-Fri: 8AM - 6PM",
    action: "Call Now: +233 30 123 4567",
    color: "from-yellow-500 to-orange-500"
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "Send us a detailed message",
    availability: "24-hour response time",
    action: "support@semma-ai.com",
    color: "from-blue-500 to-indigo-600"
  },
  {
    icon: Users,
    title: "Community Forum",
    description: "Connect with other farmers",
    availability: "Active community",
    action: "Visit Forum",
    color: "from-purple-500 to-pink-600"
  }
]

const faqs = [
  {
    category: "Getting Started",
    questions: [
      {
        question: "How do I create a SEMMA-AI account?",
        answer: "Download the SEMMA-AI app from Google Play Store or App Store, then tap 'Sign Up'. You can register using your phone number, email, or social media accounts. The process takes less than 2 minutes."
      },
      {
        question: "Is SEMMA-AI free to use?",
        answer: "Yes! We offer a free Basic plan that includes essential features like AI farming assistant (5 queries/day), weather forecasts, and marketplace access. Premium plans with additional features are available for ₵25/month and ₵100/month."
      },
      {
        question: "Do I need internet to use SEMMA-AI?",
        answer: "Many features work offline, including viewing saved content, accessing your planting calendar, and basic calculations. Internet connection is required for AI queries, weather updates, and marketplace features."
      }
    ]
  },
  {
    category: "Account & Billing",
    questions: [
      {
        question: "How do I upgrade my plan?",
        answer: "Go to Settings > Subscription in the app and select your desired plan. We offer a 14-day free trial for Professional and Enterprise plans. Payment can be made via mobile money, bank transfer, or card."
      },
      {
        question: "Can I cancel my subscription anytime?",
        answer: "Yes, you can cancel your subscription at any time from the app settings. Your account will remain active until the end of your billing period, and you'll automatically switch to the free Basic plan."
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept MTN Mobile Money, Vodafone Cash, AirtelTigo Money, bank transfers, and credit/debit cards (Visa, Mastercard)."
      }
    ]
  },
  {
    category: "Features & Functionality",
    questions: [
      {
        question: "How accurate is the AI crop disease detection?",
        answer: "Our AI has been trained on over 100,000 images of crop diseases and achieves 95% accuracy. However, we always recommend consulting with agricultural experts for serious issues."
      },
      {
        question: "Can I sell my produce through SEMMA-AI?",
        answer: "Yes! The Digital Marketplace allows you to list your produce, set prices, and connect directly with buyers. We handle secure payments and provide seller protection."
      },
      {
        question: "Does SEMMA-AI work for all types of crops?",
        answer: "SEMMA-AI supports major Ghanaian crops including maize, rice, cassava, yam, cocoa, vegetables, and fruits. We're continuously adding support for more crops."
      }
    ]
  },
  {
    category: "Technical Issues",
    questions: [
      {
        question: "The app isn't loading. What should I do?",
        answer: "First, check your internet connection. If that's fine, try closing and reopening the app. If the problem persists, clear the app cache (Settings > Apps > SEMMA-AI > Clear Cache) or reinstall the app."
      },
      {
        question: "I forgot my password. How do I reset it?",
        answer: "On the login screen, tap 'Forgot Password'. Enter your registered phone number or email, and we'll send you a reset link. Follow the instructions to create a new password."
      },
      {
        question: "Why can't I upload photos?",
        answer: "Make sure SEMMA-AI has camera and storage permissions enabled in your phone settings. Also check that you have enough storage space on your device."
      }
    ]
  }
]

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.message || 'Thank you for contacting us! We\'ll get back to you within 24 hours.')
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        })
      } else {
        alert(data.error || 'Failed to send message. Please try again.')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      alert('Failed to send message. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <PageHeader
        title="How Can We Help You?"
        subtitle="Get the support you need to make the most of SEMMA-AI"
        backgroundImage="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&auto=format&fit=crop&q=80"
      />

      {/* Support Channels */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1920&h=1080&fit=crop&q=80)',
            }}
          />
          <div className="absolute inset-0 bg-white/88" />
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {supportChannels.map((channel, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${channel.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <channel.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{channel.title}</h3>
                <p className="text-gray-600 mb-4">{channel.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Clock className="w-4 h-4" />
                  <span>{channel.availability}</span>
                </div>
                <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-lime-500 hover:text-white transition-colors">
                  {channel.action}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1492496913980-501348b61469?w=1920&h=1080&fit=crop&q=80)',
            }}
          />
          <div className="absolute inset-0 bg-gray-50/90" />
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-4 gradient-text">Send Us a Message</h2>
              <p className="text-gray-600 mb-8">
                Fill out the form below and our team will get back to you within 24 hours.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-lime-500 focus:ring-2 focus:ring-lime-200 outline-none transition-all"
                    placeholder="Enter your name"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-lime-500 focus:ring-2 focus:ring-lime-200 outline-none transition-all"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-lime-500 focus:ring-2 focus:ring-lime-200 outline-none transition-all"
                      placeholder="+233 XX XXX XXXX"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-lime-500 focus:ring-2 focus:ring-lime-200 outline-none transition-all"
                  >
                    <option value="">Select a subject</option>
                    <option value="technical">Technical Support</option>
                    <option value="billing">Billing Question</option>
                    <option value="feature">Feature Request</option>
                    <option value="partnership">Partnership Inquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-lime-500 focus:ring-2 focus:ring-lime-200 outline-none transition-all resize-none"
                    placeholder="Tell us how we can help..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-lime-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-lime-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-4 gradient-text">Contact Information</h2>
              <p className="text-gray-600 mb-8">
                Prefer to reach out directly? Here&apos;s how you can contact us.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-lime-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-lime-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Office Address</h3>
                    <p className="text-gray-600">
                      123 Liberation Road<br />
                      Accra, Ghana<br />
                      GA-123-4567
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-lime-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-lime-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Phone</h3>
                    <p className="text-gray-600">
                      Main: +233 20 887 8742<br />
                      WhatsApp: +233 20 821 6754
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-lime-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-lime-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-gray-600">
                      Support: support@semma-ai.com<br />
                      Sales: sales@semma-ai.com<br />
                      General: info@semma-ai.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-lime-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-lime-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Business Hours</h3>
                    <p className="text-gray-600">
                      Monday - Friday: 9:00 AM - 4:00 PM<br />
                      
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Resources */}
              <div className="mt-12 bg-gradient-to-r from-lime-500 to-yellow-500 rounded-2xl p-6 text-white">
                <h3 className="text-xl font-bold mb-4">Quick Resources</h3>
                <div className="space-y-3">
                  <a href="#" className="flex items-center gap-3 hover:gap-4 transition-all">
                    <Book className="w-5 h-5" />
                    <span>User Guide & Documentation</span>
                  </a>
                  <a href="#" className="flex items-center gap-3 hover:gap-4 transition-all">
                    <HelpCircle className="w-5 h-5" />
                    <span>Knowledge Base</span>
                  </a>
                  <a href="#" className="flex items-center gap-3 hover:gap-4 transition-all">
                    <Zap className="w-5 h-5" />
                    <span>Getting Started Guide</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1920&h=1080&fit=crop&q=80)',
            }}
          />
          <div className="absolute inset-0 bg-white/88" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Find quick answers to common questions</p>
          </motion.div>

          <div className="space-y-8">
            {faqs.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h3 className="text-2xl font-bold mb-4 text-lime-600">{category.category}</h3>
                <div className="space-y-4">
                  {category.questions.map((faq, faqIndex) => {
                    const faqId = `${categoryIndex}-${faqIndex}`
                    const isOpen = openFaq === faqId

                    return (
                      <motion.div
                        key={faqIndex}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: faqIndex * 0.1 }}
                        className="bg-white rounded-2xl shadow-lg overflow-hidden"
                      >
                        <button
                          onClick={() => setOpenFaq(isOpen ? null : faqId)}
                          className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-semibold text-gray-900">{faq.question}</span>
                          <ChevronDown
                            className={`w-5 h-5 text-lime-600 transition-transform ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-6 text-gray-600">
                            {faq.answer}
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
