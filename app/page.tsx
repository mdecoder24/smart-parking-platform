import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MapPin, DollarSign, Clock, Shield } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-foreground">ParkSmart</span>
          </div>
          <div className="flex gap-4">
            <Link href="/browse">
              <Button variant="outline">Browse Parking</Button>
            </Link>
            <Link href="/admin/login">
              <Button>Admin</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-balance text-foreground">
            Find Parking
            <span className="block text-primary">Your Way</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Real-time parking availability, dynamic pricing, and hassle-free reservations. Find your perfect spot in seconds.
          </p>
          <div className="flex gap-4 justify-center pt-6">
            <Link href="/browse">
              <Button size="lg" className="text-base">
                Start Searching
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="text-base">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-background rounded-2xl">
        <h2 className="text-3xl font-bold text-center text-foreground mb-12">Why Choose ParkSmart?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <Card key={i} className="p-6 border border-border hover:border-primary transition-colors">
                <Icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold text-lg text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Statistics Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {[
            { number: '500+', label: 'Parking Lots' },
            { number: '50K+', label: 'Available Spaces' },
            { number: '100K+', label: 'Happy Users' },
          ].map((stat, i) => (
            <div key={i}>
              <p className="text-4xl font-bold text-primary">{stat.number}</p>
              <p className="text-muted-foreground mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="p-12 bg-primary text-primary-foreground border-0">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold">Ready to Park Smart?</h2>
            <p className="text-lg opacity-90">
              Get started today and never waste time searching for parking again.
            </p>
            <Link href="/browse">
              <Button size="lg" variant="secondary" className="text-base">
                Browse Available Lots
              </Button>
            </Link>
          </div>
        </Card>
      </section>

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
