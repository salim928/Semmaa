// app/components/Footer.tsx
'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative bg-gray-900 text-white overflow-hidden">
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1920&h=1080&fit=crop&q=80)',
          }}
        />
        <div className="absolute inset-0 bg-gray-900/95" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center space-x-2 mb-4">
              <Image
                src="/semma-logo.svg"
                alt="SEMMA-AI Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-2xl font-bold">SEMMA-AI</span>
            </div>
            <p className="text-gray-400 mb-4">
              Smarter advice. Bigger harvests. Empowering Ghana&apos;s farmers with AI-driven agricultural solutions.
            </p>
            <div className="flex space-x-4">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, index) => (
                <Icon key={index} className="w-5 h-5 text-gray-400 hover:text-lime-500 cursor-pointer transition-colors" />
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/features" className="text-gray-400 hover:text-white transition-colors">Features</Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link>
              </li>
              <li>
                <Link href="/demo" className="text-gray-400 hover:text-white transition-colors">Demo</Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link>
              </li>
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              {['AI Advisory', 'Marketplace', 'Community', 'Analytics', 'Training'].map((service) => (
                <li key={service}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">{service}</a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-lime-500" />
                <span className="text-gray-400">info@semma-ai.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-lime-500" />
                <span className="text-gray-400">+233 557 553 975</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-lime-500" />
                <span className="text-gray-400">Accra, Ghana</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-center md:text-left">
              &copy; 2024 SEMMA-AI. All rights reserved. 
              Built for Africa &amp; Ghana&apos;s farmers.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}