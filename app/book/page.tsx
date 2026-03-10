'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, CreditCard, Lock, ChevronRight, ArrowLeft, Clock, Car, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

// ── Mock lot data (mirrors browse page) ──────────────────────────────────────
const MOCK_LOTS: Record<string, { name: string; address: string; city: string; hourly_rate: number; daily_rate: number; parking_type: string }> = {
  '1': { name: 'CityCenter Parking Hub',    address: '12 Downtown Ave',      city: 'Mumbai',    hourly_rate: 40,  daily_rate: 300, parking_type: 'garage'  },
  '2': { name: 'Westside Mall Parking',     address: '88 Mall Road',         city: 'Mumbai',    hourly_rate: 25,  daily_rate: 180, parking_type: 'surface' },
  '3': { name: 'Techpark Smart Lot',        address: '1 Techpark Blvd',      city: 'Pune',      hourly_rate: 35,  daily_rate: 250, parking_type: 'garage'  },
  '4': { name: 'Airport Express Parking',   address: 'Terminal 2, Airport Rd',city: 'Delhi',    hourly_rate: 60,  daily_rate: 450, parking_type: 'garage'  },
  '5': { name: 'Green Cycle & Bike Stand',  address: '5 Garden Lane',        city: 'Bangalore', hourly_rate: 10,  daily_rate: 60,  parking_type: 'surface' },
  '6': { name: 'Harbor View Valet',         address: '2 Sea Link Rd',        city: 'Mumbai',    hourly_rate: 80,  daily_rate: 600, parking_type: 'valet'   },
}

const VEHICLE_MULT: Record<string, number> = {
  all: 1, car: 1, motorcycle: 0.6, bicycle: 0.25, truck: 1.5, ev: 1.1,
}
const VEHICLE_LABELS: Record<string, string> = {
  all: '🅿️ Any', car: '🚗 Car', motorcycle: '🏍️ Motorcycle',
  bicycle: '🚲 Bicycle', truck: '🚚 Truck / SUV', ev: '⚡ Electric Vehicle',
}

function formatCard(v: string) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}
function formatExpiry(v: string) {
  return v.replace(/\D/g, '').slice(0, 4).replace(/^(\d{2})(\d)/, '$1/$2')
}

// ── Inner component (needs Suspense for useSearchParams) ─────────────────────
function BookPageInner() {
  const router = useRouter()
  const params = useSearchParams()
  const lotId      = params.get('lot')    ?? '1'
  const slotId     = params.get('slot')   ?? 'A1'
  const slotNum    = slotId.split('-').pop() ?? slotId
  const vehicleType = params.get('vehicle') ?? 'car'

  const lot  = MOCK_LOTS[lotId] ?? MOCK_LOTS['1']
  const mult = VEHICLE_MULT[vehicleType] ?? 1
  const hourlyRate = lot.hourly_rate * mult

  // Form state
  const [hours,     setHours]     = useState(2)
  const [plate,     setPlate]     = useState('')
  const [cardNum,   setCardNum]   = useState('')
  const [expiry,    setExpiry]    = useState('')
  const [cvv,       setCvv]       = useState('')
  const [name,      setName]      = useState('')
  const [payMethod, setPayMethod] = useState<'card' | 'upi' | 'wallet'>('card')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  const subtotal = hourlyRate * hours
  const tax      = subtotal * 0.18
  const total    = subtotal + tax

  const validate = () => {
    if (!plate.trim()) return 'Please enter your vehicle plate number.'
    if (payMethod === 'card') {
      if (cardNum.replace(/\s/g, '').length < 16) return 'Please enter a valid 16-digit card number.'
      if (expiry.length < 5)                       return 'Please enter a valid expiry date.'
      if (cvv.length < 3)                          return 'Please enter a valid CVV.'
      if (!name.trim())                            return 'Please enter the cardholder name.'
    }
    return ''
  }

  const handlePay = async () => {
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    setLoading(true)
    // Simulate payment delay
    await new Promise(r => setTimeout(r, 2200))
    // Generate booking ID and redirect to receipt
    const bookingId = `PS${Date.now().toString(36).toUpperCase().slice(-8)}`
    const now = new Date()
    const start = now.toISOString()
    const end   = new Date(now.getTime() + hours * 3600_000).toISOString()
    const qs = new URLSearchParams({
      bookingId, lotId, slot: slotNum, vehicle: vehicleType,
      hours: String(hours), total: total.toFixed(2),
      plate, start, end, lotName: lot.name,
      address: lot.address, city: lot.city,
    })
    router.push(`/booking-confirmed?${qs.toString()}`)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-background to-primary/5">
      {/* Header */}
      <div className="border-b border-border bg-card/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center gap-3">
          <Link href="/browse" className="flex items-center gap-1.5 text-primary hover:text-primary/80 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Browse
          </Link>
          <div className="flex-1 text-center">
            <p className="text-sm font-semibold text-foreground">Confirm & Pay</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="w-3.5 h-3.5 text-green-500" />
            <span className="hidden sm:inline">Secure</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-5 gap-6">

          {/* ── Left: Payment form ─────────────────────────────── */}
          <div className="lg:col-span-3 space-y-5">

            {/* Booking summary */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-5 py-4 border-b border-border">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Booking Summary</p>
                <h2 className="font-bold text-lg text-foreground">{lot.name}</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{lot.address}, {lot.city}</p>
              </div>
              <div className="px-5 py-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">Space</p>
                  <p className="font-bold text-foreground text-lg">{slotNum}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">Vehicle</p>
                  <p className="font-bold text-foreground text-sm">{VEHICLE_LABELS[vehicleType]}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">Rate</p>
                  <p className="font-bold text-primary text-lg">₹{hourlyRate.toFixed(0)}/hr</p>
                </div>
              </div>
            </Card>

            {/* Duration picker */}
            <Card className="px-5 py-4">
              <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-primary" />Parking Duration</p>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 6, 8, 12, 24].map(h => (
                  <button key={h} onClick={() => setHours(h)}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${hours === h ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'border-border hover:bg-muted'}`}>
                    {h}h
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Parking from <strong>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong> to <strong>{new Date(Date.now() + hours * 3_600_000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
              </p>
            </Card>

            {/* Vehicle plate */}
            <Card className="px-5 py-4">
              <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><Car className="w-4 h-4 text-primary" />Vehicle Details</p>
              <Input
                placeholder="e.g. MH 12 AB 3456"
                value={plate}
                onChange={e => setPlate(e.target.value.toUpperCase())}
                maxLength={12}
                className="font-mono tracking-widest"
              />
            </Card>

            {/* Payment method */}
            <Card className="px-5 py-4">
              <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary" />Payment Method</p>
              <div className="flex gap-2 mb-4">
                {(['card', 'upi', 'wallet'] as const).map(m => (
                  <button key={m} onClick={() => setPayMethod(m)}
                    className={`flex-1 py-2 rounded-lg border text-xs font-semibold uppercase transition-all ${payMethod === m ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}>
                    {m === 'card' ? '💳 Card' : m === 'upi' ? '📱 UPI' : '👛 Wallet'}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {payMethod === 'card' && (
                  <motion.div key="card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                    <Input placeholder="Cardholder Name" value={name} onChange={e => setName(e.target.value)} />
                    <Input
                      placeholder="1234 5678 9012 3456"
                      value={cardNum}
                      onChange={e => setCardNum(formatCard(e.target.value))}
                      className="font-mono tracking-wider"
                      maxLength={19}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="MM/YY" value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} maxLength={5} />
                      <Input placeholder="CVV" value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} maxLength={4} type="password" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 mt-1">
                      <Lock className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      This is a mock payment. No real charges will be made.
                    </div>
                  </motion.div>
                )}
                {payMethod === 'upi' && (
                  <motion.div key="upi" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                    <Input placeholder="Enter UPI ID (e.g. name@upi)" />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                      <Lock className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      Mock UPI — no real transaction will occur.
                    </div>
                  </motion.div>
                )}
                {payMethod === 'wallet' && (
                  <motion.div key="wallet" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
                    {['Paytm', 'PhonePe', 'Google Pay', 'Amazon Pay'].map(w => (
                      <button key={w} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:bg-muted transition-colors text-sm font-medium">
                        <span className="text-xl">{w === 'Paytm' ? '💙' : w === 'PhonePe' ? '💜' : w === 'Google Pay' ? '🎨' : '🟠'}</span>
                        {w}
                        <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
                      </button>
                    ))}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                      <Lock className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      Mock wallet — no real transaction.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  ⚠️ {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Right: Order summary ──────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="sticky top-20 space-y-4">
              <Card className="overflow-hidden">
                <div className="px-5 py-4 border-b border-border bg-muted/30">
                  <p className="text-sm font-bold text-foreground">Order Summary</p>
                </div>
                <div className="px-5 py-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Space {slotNum} × {hours}h</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GST (18%)</span>
                    <span className="font-medium">₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span className="text-primary">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checklist */}
                <div className="px-5 pb-4 space-y-1.5">
                  {['Instant confirmation', 'Free cancellation within 15 min', 'Digital receipt via this page'].map(item => (
                    <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>

                {/* Pay button */}
                <div className="px-5 pb-5">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="w-full gap-2 font-bold text-base py-6 relative overflow-hidden" onClick={handlePay} disabled={loading}>
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          Processing payment…
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Pay ₹{total.toFixed(2)}
                        </span>
                      )}
                    </Button>
                  </motion.div>
                  <p className="text-[10px] text-muted-foreground text-center mt-2 flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3" /> 256-bit SSL encrypted · Demo only
                  </p>
                </div>
              </Card>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading…</p></div>}>
      <BookPageInner />
    </Suspense>
  )
}
