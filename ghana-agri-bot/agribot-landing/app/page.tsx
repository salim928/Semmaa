// app/page.tsx
'use client'

import Navigation from './components/Navigation'
import Hero from './components/Hero'
import Features from './components/Features'
import Stats from './components/Stats'
import Testimonials from './components/Testimonials'
import Newsletter from './components/Newsletter'
import CTA from './components/CTA'
import Footer from './components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <Features />
      <Stats />
      <Testimonials />
      <Newsletter />
      <CTA />
      <Footer />
    </main>
  )
}