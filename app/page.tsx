'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MapPin, Zap, Wallet, Shield, TrendingUp, Users, Clock, CheckCircle2, ArrowRight, Smartphone } from 'lucide-react'
import { motion } from 'framer-motion'
import { useMotionValueEvent, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { AnimatedCounter } from '@/components/animated-counter'
import { staggerContainer, staggerItem } from '@/lib/animations'

const containerVar = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVar = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
}

export default function Home() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])

  return (
    <main className="relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-primary via-background to-accent opacity-20" />
      
      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">ParkSmart</span>
          </motion.div>
          <div className="flex gap-3">
            <Link href="/browse">
              <Button variant="outline" className="border-white/30 hover:bg-white/10">
                Browse Parking
              </Button>
            </Link>
            <Link href="/admin/login">
              <Button className="bg-gradient-to-r from-primary to-accent hover:shadow-lg">
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center pt-20 relative overflow-hidden">
        <motion.div 
          style={{ y: backgroundY }}
          className="absolute inset-0 -z-10"
        >
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        </motion.div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <motion.div
            variants={containerVar}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            <motion.div variants={itemVar} className="inline-block">
              <div className="glass px-4 py-2 rounded-full text-sm font-semibold text-primary">
                ✨ The Future of Parking is Here
              </div>
            </motion.div>

            <motion.h1 
              variants={itemVar}
              className="text-6xl md:text-7xl font-bold tracking-tight"
            >
              <span className="bg-gradient-to-r from-primary via-foreground to-accent bg-clip-text text-transparent">
                Find Parking
              </span>
              <br />
              <span className="text-foreground">in Seconds</span>
            </motion.h1>

            <motion.p 
              variants={itemVar}
              className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Real-time availability, dynamic pricing, and hassle-free reservations. Say goodbye to parking stress forever.
            </motion.p>

            <motion.div 
              variants={itemVar}
              className="flex gap-4 justify-center pt-4"
            >
              <Link href="/browse">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-white shadow-xl hover:shadow-2xl text-base px-8">
                    Start Searching <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </motion.div>
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="outline" className="border-white/30 hover:bg-white/10 text-base px-8">
                  Watch Demo
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Hero Image Placeholder with animation */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative mt-12 rounded-2xl overflow-hidden"
          >
            <div className="glass-strong p-1 rounded-2xl">
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-12 aspect-video flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Smartphone className="w-16 h-16 text-primary mx-auto opacity-50" />
                  <p className="text-muted-foreground">Interactive Parking Map</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16 space-y-4"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Why <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">ParkSmart</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the smartest parking platform built for modern cities
            </p>
          </motion.div>

          <motion.grid 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVar}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            {[
              {
                icon: Zap,
                title: 'Real-Time Availability',
                description: 'See available spaces instantly updated across all parking lots',
                gradient: 'from-primary/20 to-primary/5'
              },
              {
                icon: TrendingUp,
                title: 'Smart Pricing',
                description: 'Dynamic rates based on demand, time, and location intelligence',
                gradient: 'from-accent/20 to-accent/5'
              },
              {
                icon: Wallet,
                title: 'Flexible Payment',
                description: 'Hourly, daily, or monthly passes with secure payment options',
                gradient: 'from-emerald-500/20 to-emerald-500/5'
              },
              {
                icon: MapPin,
                title: 'Smart Navigation',
                description: 'Turn-by-turn guidance to your reserved parking spot',
                gradient: 'from-blue-500/20 to-blue-500/5'
              },
              {
                icon: Shield,
                title: 'Secure & Safe',
                description: 'PCI-compliant payments and protected parking information',
                gradient: 'from-purple-500/20 to-purple-500/5'
              },
              {
                icon: Users,
                title: '24/7 Support',
                description: 'Dedicated support team ready to help anytime, anywhere',
                gradient: 'from-pink-500/20 to-pink-500/5'
              },
            ].map((feature, i) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={i}
                  variants={itemVar}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                >
                  <Card className={`glass-strong h-full p-8 border-white/20 hover:border-primary/50 transition-colors`}>
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6`}>
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </Card>
                </motion.div>
              )
            })}
          </motion.grid>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="glass-strong rounded-2xl p-12 border-white/20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { number: 500, suffix: '+', label: 'Parking Lots' },
                { number: 50000, suffix: '+', label: 'Available Spaces' },
                { number: 100000, suffix: '+', label: 'Happy Users' },
                { number: 99.9, suffix: '%', label: 'Uptime' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  className="text-center space-y-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    <AnimatedCounter end={stat.number} suffix={stat.suffix} />
                  </div>
                  <p className="text-muted-foreground text-sm md:text-base">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16 space-y-4"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Reserve your parking spot in just 4 simple steps
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-4 gap-6"
            variants={containerVar}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
          >
            {[
              { number: 1, title: 'Search', description: 'Find parking near your location' },
              { number: 2, title: 'Select', description: 'Choose your preferred spot' },
              { number: 3, title: 'Pay', description: 'Secure online payment' },
              { number: 4, title: 'Park', description: 'Get QR code and navigate' },
            ].map((step, i) => (
              <motion.div key={i} variants={itemVar} className="relative">
                <Card className="glass-strong h-full p-8 border-white/20 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto">
                    <span className="text-2xl font-bold text-white">{step.number}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </Card>
                {i < 3 && (
                  <motion.div 
                    className="hidden md:flex absolute -right-3 top-8 z-10"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                  >
                    <ArrowRight className="w-6 h-6 text-primary/50" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-strong border-white/20 rounded-3xl p-12 md:p-16 text-center space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Ready to Transform Your <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Parking Experience?</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied users who have discovered the smartest way to find and reserve parking.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Link href="/browse">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-white shadow-xl hover:shadow-2xl text-base px-8">
                    Get Started Free
                  </Button>
                </motion.div>
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="outline" className="border-white/30 hover:bg-white/10 text-base px-8">
                  Learn More
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/20 py-12 glass-strong">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="font-bold text-foreground">ParkSmart</span>
              </div>
              <p className="text-sm text-muted-foreground">The smartest parking platform for modern cities.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Security'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Contact'] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-semibold text-foreground mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/20 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 ParkSmart. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
