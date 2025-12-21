// app/components/Testimonials.tsx
'use client'

import { motion } from 'framer-motion'
import { Quote, Star } from 'lucide-react'
import Image from 'next/image'

const testimonials = [
  {
    name: "Kwame Asante",
    role: "Rice Farmer, Ashanti Region",
    content: "Semma has revolutionized how I manage my farm. The AI advisory feature helped me increase my yield by 40% this season.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1531384370597-8590413be50a?w=400&h=400&fit=crop"
  },
  {
    name: "Ama Osei",
    role: "Vegetable Farmer, Greater Accra",
    content: "The marketplace feature connected me directly with buyers in Accra. I no longer worry about finding customers for my produce.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=400&h=400&fit=crop"
  },
  {
    name: "Abdul Rahman",
    role: "Cattle Farmer, Northern Region",
    content: "The community features allowed me to learn from experienced farmers. The weather alerts have saved my crops multiple times.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1504593811423-6dd665756598?w=400&h=400&fit=crop"
  }
]

export default function Testimonials() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1492496913980-501348b61469?w=1920&h=1080&fit=crop&q=80)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/88 via-lime-50/88 to-white/88" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="inline-block"
            >
              What
            </motion.span>{' '}
            <motion.span
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
              className="gradient-text-animated inline-block"
            >
              Farmers
            </motion.span>{' '}
            <motion.span
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="inline-block shimmer-text"
            >
              Say
            </motion.span>
          </h2>
          <motion.p 
            className="text-xl text-grey-900 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            Real stories from farmers who are transforming their agricultural practices with Semma-AI.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
              >
                <Quote className="w-8 h-8 text-lime-500 mb-4" />
              </motion.div>
              
              <p className="text-gray-700 mb-6 leading-relaxed">&ldquo;{testimonial.content}&rdquo;</p>
              
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1 + i * 0.1 }}
                  >
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  </motion.div>
                ))}
              </div>
              
              <div className="flex items-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    unoptimized
                    className="w-12 h-12 rounded-full mr-4"
                  />
                </motion.div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-600 text-sm">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}