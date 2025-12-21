// app/components/Stats.tsx
'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const stats = [
  { label: "Active Farmers", value: 5000, suffix: "+" },
  { label: "Communities", value: 10, suffix: "+" },
  { label: "Successful Transactions", value: 500, suffix: "+" },
  { label: "Regions Covered", value: 10, suffix: "/10" },
]

function AnimatedNumber({ value, suffix }: { value: number, suffix: string }) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev < value) {
          return Math.min(prev + Math.ceil(value / 100), value)
        }
        return value
      })
    }, 30)
    
    return () => clearInterval(timer)
  }, [value])
  
  return <span>{count.toLocaleString()}{suffix}</span>
}

export default function Stats() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1920&h=1080&fit=crop&q=80)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-lime-700/95 to-lime-600/95" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-block"
            >
              Trusted by
            </motion.span>{' '}
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
              className="inline-block text-yellow-300 glow-text"
            >
              Farmers
            </motion.span>{' '}
            <motion.span
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="inline-block"
            >
              Across Ghana
            </motion.span>
          </h2>
          <motion.p 
            className="text-xl text-primary-100 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            Join thousands of farmers who are already benefiting from our platform.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="text-center cursor-pointer"
            >
              <motion.div 
                className="text-4xl md:text-5xl font-bold text-white mb-2"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
              >
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              </motion.div>
              <motion.div 
                className="text-primary-100 text-lg"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + index * 0.15 }}
              >
                {stat.label}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}