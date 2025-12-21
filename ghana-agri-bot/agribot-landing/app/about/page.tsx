// app/about/page.tsx
'use client'

import { motion } from 'framer-motion'
import Navigation from '../components/Navigation'
import PageHeader from '../components/PageHeader'
import Footer from '../components/Footer'
import { Users, Target, Globe, Award, Heart, Lightbulb } from 'lucide-react'
import Image from 'next/image'

const values = [
  {
    icon: Heart,
    title: "Farmer-Centric",
    description: "Every decision we make is focused on empowering farmers and improving their livelihoods."
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We leverage cutting-edge AI and technology to solve age-old agricultural challenges."
  },
  {
    icon: Users,
    title: "Community",
    description: "Building strong connections between farmers, buyers, and agricultural experts."
  },
  {
    icon: Globe,
    title: "Sustainability",
    description: "Promoting sustainable farming practices for a better future."
  }
]

const team = [
  {
    name: "Salim Adams",
    role: "Founder & CTO",
    bio: "AI researcher specializing in machine learning applications, LLM'S and agentic AI in agritech development across West Africa.",
    image: "/team/Salim.jpg" // Put your image in public/team/kwame.jpg
  },
  {
    name: "Dennis",
    role: "CEO & Managing Partner",
    bio: "AI researcher specializing in machine learning applications for agriculture.",
    image: "/team/dennis.jpg" // Put your image in public/team/dennis.jpg
  },
  {
    name: "Sulf Adams",
    role: "CFO & Head of Product",
    bio: "Former farmer turned product manager, bridging the gap between technology and farming.",
    image: "/team/sulf.jpg" // Put your image in public/team/sulf.jpg
  },
]

const stats = [
  { number: "2019", label: "Founded" },
  { number: "5K+", label: "Farmers Served" },
  { number: "50+", label: "Communities" },
  { number: "10", label: "Regions Covered" }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <PageHeader
        title="About SEMMA-AI"
        subtitle="Empowering Ghana's farmers through innovative technology and community-driven solutions"
        backgroundImage="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&auto=format&fit=crop&q=80"
      />

      {/* Our Story */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1920&h=1080&fit=crop&q=80)',
            }}
          />
          <div className="absolute inset-0 bg-white/90" />
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">Our Story</h2>
              <p className="text-lg text-gray-600 mb-6">
                SEMMA-AI was born from a simple observation: Ghana&apos;s farmers, who feed our nation, 
                often lack access to the digital tools and market opportunities that could transform their lives.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Founded in 2019 by a team of agricultural engineers, AI researchers, and former farmers, 
                we set out to bridge this gap by creating a comprehensive platform that combines 
                artificial intelligence, digital marketplace, and community networking.
              </p>
              <p className="text-lg text-gray-600">
                Today, we&apos;re proud to serve over 15,000 farmers across all 10 regions of Ghana, 
                helping them increase yields, access markets, and build sustainable farming businesses. 
                Our motto: <strong>Smarter advice. Bigger harvests.</strong>
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-[400px]"
            >
              <Image
                src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&h=400&fit=crop"
                alt="Farmers in Ghana"
                fill
                className="rounded-2xl shadow-2xl object-cover"
              />
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-lime-500 rounded-full flex items-center justify-center z-10">
                <Award className="w-12 h-12 text-white" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&h=1080&fit=crop&q=80)',
            }}
          />
          <div className="absolute inset-0 bg-gray-50/92" />
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-lg"
            >
              <Target className="w-12 h-12 text-lime-500 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To empower Ghanaian farmers with AI-driven insights, digital marketplace access, 
                and community support, enabling them to increase productivity, profitability, 
                and sustainability in their agricultural practices.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-lg"
            >
              <Globe className="w-12 h-12 text-yellow-500 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To become the leading agricultural technology platform in West Africa, 
                transforming farming communities through innovation, connectivity, 
                and sustainable agricultural practices.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gradient-to-br from-lime-50 via-white to-yellow-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-lime-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1920&h=1080&fit=crop&q=80)',
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Passionate individuals dedicated to transforming agriculture in Ghana
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <Image
                  src={member.image}
                  alt={member.name}
                  width={300}
                  height={256}
                  unoptimized
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-lime-600 font-semibold mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20" style={{background: 'linear-gradient(to right, rgb(101 163 13), rgb(77 124 15))'}}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-lime-100 text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
