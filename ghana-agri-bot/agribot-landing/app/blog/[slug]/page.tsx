// app/blog/[slug]/page.tsx
'use client'

import { motion } from 'framer-motion'
import Navigation from '../../components/Navigation'
import Footer from '../../components/Footer'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User, Clock, ArrowLeft, Share2, Facebook, Twitter, Linkedin, Tag } from 'lucide-react'

// This would typically come from a database or CMS
const sampleArticle = {
  title: "How AI is Transforming Agriculture in Ghana",
  slug: "ai-transforming-agriculture-ghana",
  excerpt: "Discover how artificial intelligence is revolutionizing farming practices and helping Ghanaian farmers increase productivity and profits.",
  category: "Technology",
  author: "Emmanuel Mensah",
  date: "March 15, 2024",
  readTime: "5 min read",
  image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
  tags: ["AI", "Technology", "Innovation", "Ghana"],
  content: `
    <p>Artificial Intelligence is no longer a futuristic concept—it's here, and it's transforming how Ghanaian farmers approach agriculture. From crop disease detection to weather prediction, AI-powered tools are helping farmers make smarter decisions and increase their yields significantly.</p>

    <h2>The Rise of Smart Farming</h2>
    <p>In the heart of Ghana's agricultural regions, a quiet revolution is taking place. Farmers are increasingly turning to AI-powered platforms like SEMMA-AI to solve age-old challenges that have plagued agriculture for generations.</p>

    <p>Traditional farming methods, while valuable, often rely on guesswork and experience. AI changes this by providing data-driven insights that help farmers:</p>
    <ul>
      <li>Predict optimal planting times based on weather patterns</li>
      <li>Detect crop diseases early before they spread</li>
      <li>Optimize fertilizer usage to reduce costs</li>
      <li>Access real-time market prices to maximize profits</li>
      <li>Connect with buyers directly through digital marketplaces</li>
    </ul>

    <h2>Real Impact on Ghanaian Farms</h2>
    <p>The numbers speak for themselves. Farmers using AI-powered farming assistants have reported:</p>
    <ul>
      <li><strong>30% increase in crop yields</strong> through optimized planting schedules and disease management</li>
      <li><strong>25% reduction in input costs</strong> by using precise fertilizer recommendations</li>
      <li><strong>40% time savings</strong> in accessing market information and connecting with buyers</li>
    </ul>

    <h2>Success Story: Kwame's Journey</h2>
    <p>Take Kwame Osei, a cocoa farmer from Kumasi. Before using SEMMA-AI, he struggled with unpredictable yields and limited market access. "I would sometimes lose entire sections of my farm to diseases I couldn't identify quickly enough," he recalls.</p>

    <p>After adopting the AI farming assistant, Kwame's experience transformed completely. "Now, I just take a photo of any plant that looks sick, and within minutes, the AI tells me what's wrong and how to treat it. My yields have increased by 35%, and I'm connecting directly with buyers through the marketplace."</p>

    <h2>The Technology Behind the Magic</h2>
    <p>SEMMA-AI's platform combines several cutting-edge technologies:</p>
    <ul>
      <li><strong>Computer Vision:</strong> Analyzes images of crops to detect diseases and pest damage</li>
      <li><strong>Machine Learning:</strong> Learns from thousands of farming scenarios to provide personalized advice</li>
      <li><strong>Natural Language Processing:</strong> Understands farmers' questions in local languages</li>
      <li><strong>Weather APIs:</strong> Integrates real-time weather data for accurate forecasting</li>
      <li><strong>Market Analytics:</strong> Tracks price trends to help farmers sell at the best times</li>
    </ul>

    <h2>Accessibility for All Farmers</h2>
    <p>One of the most important aspects of this AI revolution is accessibility. SEMMA-AI works on basic smartphones and even via SMS, ensuring that farmers in rural areas with limited internet access can still benefit from these powerful tools.</p>

    <p>The platform also supports multiple Ghanaian languages, breaking down the language barrier that often prevents farmers from accessing technology-based solutions.</p>

    <h2>Looking to the Future</h2>
    <p>As AI technology continues to evolve, the possibilities for agriculture are endless. We're already working on features like:</p>
    <ul>
      <li>Drone integration for automated field monitoring</li>
      <li>Soil quality analysis using satellite imagery</li>
      <li>Predictive analytics for long-term farm planning</li>
      <li>Climate change adaptation strategies</li>
    </ul>

    <h2>Getting Started</h2>
    <p>The future of farming is here, and it's more accessible than ever. Whether you're managing a small family farm or a large commercial operation, AI-powered tools can help you work smarter, not harder.</p>

    <p>SEMMA-AI offers a free tier that gives you access to essential features, with premium plans available for those who want to unlock the full potential of smart farming.</p>

    <p><strong>Ready to transform your farming practice?</strong> Download the SEMMA-AI app today and join over 15,000 Ghanaian farmers who are already experiencing the benefits of AI-powered agriculture.</p>
  `
}

export default function BlogPost() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Image */}
      <div className="relative h-[400px] md:h-[500px] bg-gray-900">
        <Image
          src={sampleArticle.image}
          alt={sampleArticle.title}
          fill
          className="object-cover opacity-70"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-6 -mt-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl p-8 md:p-12"
        >
          {/* Back Link */}
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-lime-600 font-semibold hover:gap-3 transition-all mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Blog
          </Link>

          {/* Category */}
          <div className="mb-6">
            <span className="bg-lime-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
              {sampleArticle.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            {sampleArticle.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 pb-8 mb-8 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-lime-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                {sampleArticle.author.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-900 font-semibold">
                  <User className="w-4 h-4" />
                  <span>{sampleArticle.author}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{sampleArticle.date}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{sampleArticle.readTime}</span>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="flex items-center gap-4 mb-8">
            <span className="text-gray-600 font-semibold">Share:</span>
            <button className="p-2 rounded-full bg-gray-100 hover:bg-lime-500 hover:text-white transition-colors">
              <Facebook className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full bg-gray-100 hover:bg-lime-500 hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full bg-gray-100 hover:bg-lime-500 hover:text-white transition-colors">
              <Linkedin className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full bg-gray-100 hover:bg-lime-500 hover:text-white transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Article Content */}
          <div 
            className="prose prose-lg max-w-none
              prose-headings:font-bold prose-headings:text-gray-900
              prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6
              prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
              prose-ul:my-6 prose-li:text-gray-700
              prose-strong:text-gray-900 prose-strong:font-semibold
              prose-a:text-lime-600 prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: sampleArticle.content }}
          />

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center gap-4 flex-wrap">
              <Tag className="w-5 h-5 text-gray-600" />
              {sampleArticle.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm hover:bg-lime-500 hover:text-white transition-colors cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Author Bio */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gray-50 rounded-3xl p-8 mt-12"
        >
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-gradient-to-r from-lime-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              {sampleArticle.author.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">About {sampleArticle.author}</h3>
              <p className="text-gray-600">
                {sampleArticle.author} is an agricultural technology specialist at SEMMA-AI, 
                passionate about empowering farmers through innovative solutions. With over 
                8 years of experience in the field, he works closely with farming communities 
                across Ghana to understand their challenges and develop practical AI-powered solutions.
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-lime-500 to-yellow-500 rounded-3xl p-12 text-center text-white mt-12 mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Farm?</h2>
          <p className="text-white/90 text-lg mb-8">
            Join over 15,000 farmers already using SEMMA-AI to increase yields and profits.
          </p>
          <button className="bg-white text-lime-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg">
            Get Started Free
          </button>
        </motion.div>
      </article>

      <Footer />
    </div>
  )
}
