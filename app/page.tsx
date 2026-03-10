'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MapPin, DollarSign, Clock, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import { fadeInUp, fadeInDown, slideInUp, containerVariants, itemVariants, staggerContainer, staggerItem } from '@/lib/animations'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Navigation */}
      <motion.nav 
        className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <MapPin className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-foreground">ParkSmart</span>
          </motion.div>
          <div className="flex gap-4">
            <Link href="/browse">
              <Button variant="outline">Browse Parking</Button>
            </Link>
            <Link href="/admin/login">
              <Button>Admin</Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center space-y-6">
          <motion.h1 
            className="text-5xl md:text-6xl font-bold text-balance text-foreground"
            variants={itemVariants}
          >
            Find Parking
            <motion.span 
              className="block text-primary"
              variants={itemVariants}
            >
              Your Way
            </motion.span>
          </motion.h1>
          <motion.p 
            className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance"
            variants={itemVariants}
          >
            Real-time parking availability, dynamic pricing, and hassle-free reservations. Find your perfect spot in seconds.
          </motion.p>
          <motion.div 
            className="flex gap-4 justify-center pt-6"
            variants={itemVariants}
          >
            <Link href="/browse">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="text-base">
                  Start Searching
                </Button>
              </motion.div>
            </Link>
            <Link href="#features">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="outline" className="text-base">
                  Learn More
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        id="features" 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-background rounded-2xl"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2 
          className="text-3xl font-bold text-center text-foreground mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Why Choose ParkSmart?
        </motion.h2>
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {[
            {
              icon: MapPin,
              title: 'Real-Time Availability',
              description: 'See available spaces instantly and reserve within seconds',
            },
            {
              icon: DollarSign,
              title: 'Dynamic Pricing',
              description: 'Fair prices that adjust based on demand and time of day',
            },
            {
              icon: Clock,
              title: 'Flexible Booking',
              description: 'Hourly, daily, or monthly passes - choose what works for you',
            },
            {
              icon: Shield,
              title: 'Secure Payment',
              description: 'PCI-compliant secure payments with multiple options',
            },
          ].map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={i}
                variants={staggerItem}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="p-6 border border-border hover:border-primary transition-colors h-full">
                  <Icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-semibold text-lg text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </motion.section>

      {/* Statistics Section */}
      <motion.section 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {[
            { number: '500+', label: 'Parking Lots' },
            { number: '50K+', label: 'Available Spaces' },
            { number: '100K+', label: 'Happy Users' },
          ].map((stat, i) => (
            <motion.div key={i} variants={staggerItem}>
              <motion.p 
                className="text-4xl font-bold text-primary"
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                {stat.number}
              </motion.p>
              <p className="text-muted-foreground mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-12 bg-primary text-primary-foreground border-0">
            <div className="text-center space-y-6">
              <motion.h2 
                className="text-3xl font-bold"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                Ready to Park Smart?
              </motion.h2>
              <motion.p 
                className="text-lg opacity-90"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Get started today and never waste time searching for parking again.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Link href="/browse">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" variant="secondary" className="text-base">
                      Browse Available Lots
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-foreground mb-4">ParkSmart</h3>
              <p className="text-sm text-muted-foreground">
                Making parking simple, affordable, and stress-free.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/browse" className="hover:text-foreground">Browse Parking</Link></li>
                <li><Link href="#" className="hover:text-foreground">Pricing</Link></li>
                <li><Link href="#" className="hover:text-foreground">Features</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">About</Link></li>
                <li><Link href="#" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Privacy</Link></li>
                <li><Link href="#" className="hover:text-foreground">Terms</Link></li>
                <li><Link href="#" className="hover:text-foreground">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8">
            <p className="text-sm text-muted-foreground text-center">
              © 2024 ParkSmart. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
