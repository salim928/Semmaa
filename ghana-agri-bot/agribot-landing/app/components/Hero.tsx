// app/components/Hero.tsx
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Play, Smartphone, Users, TrendingUp, MessageCircle } from 'lucide-react'

// Decorative 3D background: heavy (three.js). Load it lazily and client-only
// so it never blocks first paint or server rendering.
const ThreeScene = dynamic(() => import('./ThreeScene'), { ssr: false })

// Animated word component
const AnimatedWord = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.span
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="inline-block"
  >
    {children}
  </motion.span>
)

// Letter by letter animation
const AnimatedLetters = ({ text, className = '', delay = 0 }: { text: string; className?: string; delay?: number }) => (
  <span className={className}>
    {text.split('').map((char, index) => (
      <motion.span
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: delay + index * 0.03 }}
        className="inline-block"
        style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
      >
        {char}
      </motion.span>
    ))}
  </span>
)

// Typewriter effect component
const TypewriterText = ({ words, className = '' }: { words: string[]; className?: string }) => (
  <motion.span className={className}>
    {words.map((word, i) => (
      <motion.span
        key={i}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: i * 0.15 }}
        className="inline-block mr-2"
      >
        {word}
      </motion.span>
    ))}
  </motion.span>
)

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-14">
      {/* Background with Gradient */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 via-white to-amber-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/50 via-transparent to-transparent" />
      </div>

      {/* Three.js Background (decorative, lazy-loaded client-side) */}
      <div className="absolute inset-0 z-0 opacity-20" aria-hidden="true">
        <ThreeScene />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 text-center lg:text-left"
          >
            {/* Logo Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-md mb-6 pulse-glow"
            >
              <div className="w-6 h-6 rounded-lg overflow-hidden">
                <Image src="/logo.jpg" alt="" width={24} height={24} className="w-full h-full object-cover" />
              </div>
              <motion.span 
                className="text-sm font-medium text-gray-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                AI-Powered Agriculture
              </motion.span>
            </motion.div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {/* Animated SemmaAI with flowing gradient */}
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="gradient-text-animated inline-block"
              >
                SemmaAI
              </motion.span>
              <br />
              {/* Word by word animation */}
              <span className="text-gray-800">
                <AnimatedWord delay={0.5}>Smarter</AnimatedWord>{' '}
                <motion.span
                  initial={{ opacity: 0, scale: 1.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7, type: 'spring' }}
                  className="shimmer-text inline-block"
                >
                  Advice.
                </motion.span>
              </span>
              <br />
              {/* Bigger Harvests with glow effect */}
              <span className="text-gray-800">
                <AnimatedWord delay={0.9}>Bigger</AnimatedWord>{' '}
                <motion.span
                  initial={{ opacity: 0, rotateX: -90 }}
                  animate={{ opacity: 1, rotateX: 0 }}
                  transition={{ delay: 1.1, duration: 0.6 }}
                  className="inline-block glow-text text-emerald-600"
                >
                  Harvests.
                </motion.span>
              </span>
            </h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="text-lg text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0"
            >
              <TypewriterText 
                words={['AI-powered', 'advisory', 'for', 'African', 'farmers.']}
              />
              <br />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8 }}
              >
                Get personalized crop recommendations, market insights, and connect with a thriving farming community.
              </motion.span>
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8"
            >
              <Link href="/auth/signup" className="btn-primary group inline-flex items-center justify-center">
                <motion.span
                  initial={{ x: 0 }}
                  whileHover={{ x: -5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  Get Started Free
                </motion.span>
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/demo" className="btn-secondary group inline-flex items-center justify-center">
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Link>
            </motion.div>
            
            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              {[
                { icon: MessageCircle, text: "AI Chat" },
                { icon: Smartphone, text: "Mobile App" },
                { icon: Users, text: "Community" },
                { icon: TrendingUp, text: "Market Prices" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 1.7 + index * 0.1, type: 'spring', stiffness: 200 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                  >
                    <item.icon className="w-4 h-4 text-emerald-600" />
                  </motion.div>
                  <span className="text-sm text-gray-700">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Right: App Preview / Logo */}
          <motion.div
            initial={{ opacity: 0, x: 30, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex-1 flex justify-center"
          >
            <div className="relative float">
              {/* Glow Effect */}
              <motion.div 
                className="absolute -inset-4 bg-gradient-to-r from-emerald-400 to-green-400 rounded-[3rem] blur-2xl opacity-30"
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              
              {/* Main Logo/Splash Card */}
              <motion.div 
                className="relative bg-white/90 backdrop-blur-lg rounded-[2.5rem] p-8 shadow-2xl border border-white/50"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {/* Logo */}
                <motion.div
                  initial={{ scale: 0.8, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                  whileHover={{ rotate: 5 }}
                  className="w-40 h-40 mx-auto rounded-3xl overflow-hidden shadow-xl mb-6"
                >
                  <Image
                    src="/logo.jpg"
                    alt="SemmaAI"
                    width={160}
                    height={160}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                
                {/* App Name */}
                <motion.h2 
                  className="text-2xl font-bold text-center gradient-text-animated mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  SemmaAI
                </motion.h2>
                <motion.p 
                  className="text-center text-gray-500 text-sm mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <AnimatedLetters text="Smarter Advice. Bigger Harvests." delay={0.9} />
                </motion.p>
                
                {/* Quick Features */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: '🌾', label: 'Crop Advisory' },
                    { icon: '📊', label: 'Market Prices' },
                    { icon: '☁️', label: 'Weather' },
                    { icon: '🤝', label: 'Community' },
                  ].map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0 + i * 0.1 }}
                      whileHover={{ scale: 1.05, backgroundColor: '#ecfccb' }}
                      className="flex items-center space-x-2 bg-emerald-50 rounded-xl px-3 py-2 cursor-pointer transition-colors"
                    >
                      <motion.span 
                        className="text-lg"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                      >
                        {feature.icon}
                      </motion.span>
                      <span className="text-xs font-medium text-gray-700">{feature.label}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              
              {/* Floating Elements */}
              <motion.div 
                className="absolute -top-6 -right-6 w-16 h-16 bg-yellow-200 rounded-full opacity-60"
                animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div 
                className="absolute -bottom-4 -left-4 w-12 h-12 bg-emerald-300 rounded-full opacity-60"
                animate={{ y: [0, 10, 0], x: [0, 5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
