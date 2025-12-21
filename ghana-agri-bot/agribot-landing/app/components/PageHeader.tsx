// app/components/PageHeader.tsx
'use client'

import { motion } from 'framer-motion'

interface PageHeaderProps {
  title: string
  subtitle: string
  backgroundImage?: string
}

export default function PageHeader({ title, subtitle, backgroundImage }: PageHeaderProps) {
  return (
    <section 
      className="relative py-24 mt-16 bg-cover bg-center"
      style={backgroundImage ? {
        backgroundImage: `url(${backgroundImage})`
      } : {
        background: 'linear-gradient(to bottom right, rgb(247 254 231), rgb(254 252 232))'
      }}
    >
      {backgroundImage && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40"></div>
      )}
      <div className="relative max-w-4xl mx-auto px-6 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${backgroundImage ? 'text-white' : 'gradient-text'}`}>
            {title}
          </h1>
          <p className={`text-xl md:text-2xl max-w-3xl mx-auto ${backgroundImage ? 'text-gray-100' : 'text-gray-600'}`}>
            {subtitle}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
