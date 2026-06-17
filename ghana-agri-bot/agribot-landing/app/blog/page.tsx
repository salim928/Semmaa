// app/blog/page.tsx
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Navigation from '../components/Navigation'
import PageHeader from '../components/PageHeader'
import Footer from '../components/Footer'
import Link from 'next/link'
import { Calendar, User, ArrowRight } from 'lucide-react'
import Image from 'next/image'

const categories = ["All", "Technology", "Farming Tips", "Success Stories", "Market Insights", "Sustainability"]

const blogPosts = [
  {
    slug: "ai-transforming-agriculture-ghana",
    title: "How AI is Transforming Agriculture in Ghana",
    excerpt: "Discover how artificial intelligence is revolutionizing farming practices and helping Ghanaian farmers increase productivity and profits.",
    category: "Technology",
    author: "Emmanuel Mensah",
    date: "March 15, 2024",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    featured: true
  },
  {
    slug: "seasonal-planting-guide-ghana",
    title: "Seasonal Planting Guide for Ghana",
    excerpt: "Learn the best times to plant various crops in Ghana's different climate zones to maximize your harvest.",
    category: "Farming Tips",
    author: "Akosua Boateng",
    date: "March 12, 2024",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    slug: "farmer-success-story-kumasi",
    title: "From 2 Acres to 20: A Farmer's Success Story",
    excerpt: "Meet Kwame, who used SEMMA-AI to scale his farm from 2 acres to 20 acres in just 3 years.",
    category: "Success Stories",
    author: "Nana Yaw",
    date: "March 10, 2024",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    slug: "cocoa-market-trends-2024",
    title: "Cocoa Market Trends: What to Expect in 2024",
    excerpt: "Analysis of global cocoa prices and what they mean for Ghanaian cocoa farmers this year.",
    category: "Market Insights",
    author: "Dr. Ama Serwaa",
    date: "March 8, 2024",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    slug: "sustainable-farming-practices",
    title: "10 Sustainable Farming Practices Every Farmer Should Know",
    excerpt: "Protect your land for future generations while increasing productivity with these sustainable farming techniques.",
    category: "Sustainability",
    author: "Kofi Annan Jr.",
    date: "March 5, 2024",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  },
  {
    slug: "mobile-app-features-tour",
    title: "SEMMA-AI Mobile App: Complete Feature Tour",
    excerpt: "Explore all the powerful features available in the SEMMA-AI mobile app to transform your farming experience.",
    category: "Technology",
    author: "Emmanuel Mensah",
    date: "March 1, 2024",
    readTime: "10 min read",
    image: "https://images.unsplash.com/photo-1556155092-490a1ba16284?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  }
]

export default function BlogPage() {
  const [email, setEmail] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  
  const featuredPost = blogPosts.find(post => post.featured)
  const regularPosts = blogPosts.filter(post => !post.featured)

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.message || 'Successfully subscribed!')
        setEmail('')
      } else {
        alert(data.error || 'Failed to subscribe. Please try again.')
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      alert('Failed to subscribe. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <PageHeader
        title="Latest from SEMMA-AI"
        subtitle="Insights, tips, and stories from the world of smart farming in Ghana"
        backgroundImage="https://images.unsplash.com/photo-1542435503-956c469947f6?w=1920&auto=format&fit=crop&q=80"
      />

      {/* Categories */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`px-6 py-2 rounded-full transition-all ${
                  index === 0
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-gradient-to-r from-emerald-500 to-amber-500 text-white rounded-3xl overflow-hidden shadow-2xl">
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="p-12 flex flex-col justify-center">
                    <span className="inline-block bg-white/20 backdrop-blur-sm text-white px-4 py-1 rounded-full text-sm font-semibold mb-4 w-fit">
                      Featured
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">{featuredPost.title}</h2>
                    <p className="text-white/90 text-lg mb-6">{featuredPost.excerpt}</p>
                    
                    <div className="flex items-center gap-6 mb-8 text-white/90">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="text-sm">{featuredPost.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{featuredPost.date}</span>
                      </div>
                      <span className="text-sm">{featuredPost.readTime}</span>
                    </div>

                    <Link 
                      href={`/blog/${featuredPost.slug}`}
                      className="inline-flex items-center gap-2 bg-white text-emerald-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors w-fit"
                    >
                      Read Article
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                  
                  <div className="h-full min-h-[400px] lg:min-h-0 relative">
                    <Image
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Blog Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post, index) => (
              <motion.article
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {post.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 group-hover:text-emerald-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{post.date}</span>
                    </div>
                    <span>{post.readTime}</span>
                  </div>

                  <Link 
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 text-emerald-600 font-semibold hover:gap-3 transition-all"
                  >
                    Read More
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-emerald-500 to-amber-500 rounded-3xl p-12 text-center text-white"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-white/90 text-lg mb-8">
              Get the latest farming tips, market insights, and SEMMA-AI updates delivered to your inbox weekly.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-white text-emerald-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
