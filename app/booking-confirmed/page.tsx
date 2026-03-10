'use client'

import { Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, Clock, Car, CheckCircle2, Download, Home, Printer, QrCode, CalendarDays, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'

const VEHICLE_LABELS: Record<string, string> = {
  all: 'Any Vehicle', car: 'Car', motorcycle: 'Motorcycle',
  bicycle: 'Bicycle', truck: 'Truck / SUV', ev: 'Electric Vehicle',
}
const VEHICLE_EMOJI: Record<string, string> = {
  all: '🅿️', car: '🚗', motorcycle: '🏍️', bicycle: '🚲', truck: '🚚', ev: '⚡',
}

function fmt(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { dateStyle: 'long' })
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { timeStyle: 'short' })
}

function ConfirmedInner() {
  const params     = useSearchParams()
  const receiptRef = useRef<HTMLDivElement>(null)

  const bookingId  = params.get('bookingId') ?? 'PS000000'
  const lotName    = params.get('lotName')   ?? 'Parking Lot'
  const address    = params.get('address')   ?? ''
  const city       = params.get('city')      ?? ''
  const slot       = params.get('slot')      ?? 'A1'
  const vehicle    = params.get('vehicle')   ?? 'car'
  const hours      = params.get('hours')     ?? '2'
  const total      = params.get('total')     ?? '0.00'
  const plate      = params.get('plate')     ?? '—'
  const start      = params.get('start')     ?? new Date().toISOString()
  const end        = params.get('end')       ?? new Date().toISOString()

  const subtotal   = (parseFloat(total) / 1.18).toFixed(2)
  const tax        = (parseFloat(total) - parseFloat(subtotal)).toFixed(2)

  const handlePrint = () => window.print()

  const handleDownload = () => {
    // Build a styled HTML receipt and trigger download via blob
    const receiptHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>ParkSmart Receipt – ${bookingId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f9fafb; color: #111; padding: 40px; }
    .wrapper { max-width: 520px; margin: auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 40px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 32px 32px 24px; }
    .logo { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 4px; }
    .receipt-label { font-size: 12px; opacity: 0.75; text-transform: uppercase; letter-spacing: 1px; }
    .booking-id { font-size: 28px; font-weight: 900; margin-top: 12px; letter-spacing: 2px; }
    .success-banner { background: #dcfce7; border-bottom: 1px solid #bbf7d0; padding: 12px 32px; display: flex; align-items: center; gap: 8px; color: #166534; font-weight: 600; font-size: 14px; }
    .body { padding: 28px 32px; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 12px; margin-top: 20px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 20px; }
    .info-item label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #9ca3af; display: block; margin-bottom: 2px; }
    .info-item span { font-size: 14px; font-weight: 600; color: #111; }
    .divider { border: none; border-top: 1px dashed #e5e7eb; margin: 20px 0; }
    .price-row { display: flex; justify-content: space-between; font-size: 14px; color: #374151; padding: 4px 0; }
    .price-row.total { font-size: 18px; font-weight: 800; color: #1e40af; border-top: 2px solid #1e40af; margin-top: 8px; padding-top: 12px; }
    .qr-placeholder { width: 80px; height: 80px; background: #f3f4f6; border: 2px dashed #d1d5db; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #9ca3af; text-align: center; margin: 0 auto 16px; }
    .footer { background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 18px 32px; text-align: center; font-size: 11px; color: #9ca3af; }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div class="logo">📍 ParkSmart</div>
    <div class="receipt-label">Booking Receipt</div>
    <div class="booking-id">#${bookingId}</div>
  </div>
  <div class="success-banner">✅ Booking Confirmed</div>
  <div class="body">
    <div class="qr-placeholder">QR<br/>CODE</div>
    <div class="section-title">Parking Details</div>
    <div class="info-grid">
      <div class="info-item"><label>Location</label><span>${lotName}</span></div>
      <div class="info-item"><label>Space</label><span>${slot}</span></div>
      <div class="info-item"><label>Address</label><span>${address}, ${city}</span></div>
      <div class="info-item"><label>Vehicle</label><span>${VEHICLE_EMOJI[vehicle]} ${VEHICLE_LABELS[vehicle]}</span></div>
      <div class="info-item"><label>Plate Number</label><span>${plate}</span></div>
      <div class="info-item"><label>Duration</label><span>${hours} hour${parseInt(hours) > 1 ? 's' : ''}</span></div>
    </div>
    <hr class="divider"/>
    <div class="section-title">Schedule</div>
    <div class="info-grid">
      <div class="info-item"><label>Check-in</label><span>${fmt(start)}</span></div>
      <div class="info-item"><label>Check-out</label><span>${fmt(end)}</span></div>
    </div>
    <hr class="divider"/>
    <div class="section-title">Payment</div>
    <div class="price-row"><span>Subtotal</span><span>₹${subtotal}</span></div>
    <div class="price-row"><span>GST (18%)</span><span>₹${tax}</span></div>
    <div class="price-row total"><span>Total Paid</span><span>₹${total}</span></div>
  </div>
  <div class="footer">Thank you for choosing ParkSmart · support@parksmart.in · This is a demo receipt</div>
</div>
</body>
</html>`
    const blob = new Blob([receiptHtml], { type: 'text/html' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `ParkSmart-Receipt-${bookingId}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-background to-primary/5 print:bg-white">
      {/* Print-only header */}
      <div className="hidden print:block text-center py-8 border-b">
        <h1 className="text-2xl font-bold">📍 ParkSmart — Booking Receipt</h1>
      </div>

      {/* Success banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-600 text-white text-center py-3 text-sm font-semibold print:hidden"
      >
        🎉 Booking Confirmed! Your space is reserved.
      </motion.div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Confetti / success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
          className="flex flex-col items-center gap-2 py-4 print:hidden"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Booking Successful!</h1>
          <p className="text-muted-foreground text-sm text-center">Your parking space has been reserved. Show the QR code at entry.</p>
        </motion.div>

        {/* ── Receipt card ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          ref={receiptRef}
        >
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm print:shadow-none print:border-none">

            {/* Receipt header */}
            <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground px-6 py-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold opacity-75 uppercase tracking-widest mb-1">Booking Receipt</p>
                  <p className="font-black text-2xl tracking-widest">#{bookingId}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-75">ParkSmart</p>
                  <p className="text-xs opacity-75">{fmtDate(start)}</p>
                </div>
              </div>
            </div>

            {/* QR placeholder + body */}
            <div className="px-6 py-6 space-y-5">

              {/* Simulated QR */}
              <div className="flex justify-center">
                <div className="relative w-28 h-28 bg-muted border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-1 text-muted-foreground">
                  <QrCode className="w-10 h-10" />
                  <p className="text-[9px] font-bold uppercase tracking-widest">Scan at entry</p>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Divider with booking id */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground font-mono">#{bookingId}</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: MapPin,       label: 'Location',   value: lotName },
                  { icon: Hash,        label: 'Space No.',   value: slot },
                  { icon: MapPin,       label: 'Address',    value: `${address}, ${city}` },
                  { icon: Car,          label: 'Vehicle',    value: `${VEHICLE_EMOJI[vehicle]} ${VEHICLE_LABELS[vehicle]}` },
                  { icon: Car,          label: 'Plate',      value: plate },
                  { icon: Clock,        label: 'Duration',   value: `${hours} hour${parseInt(hours) > 1 ? 's' : ''}` },
                  { icon: CalendarDays, label: 'Check-in',  value: fmtTime(start) },
                  { icon: CalendarDays, label: 'Check-out', value: fmtTime(end) },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="space-y-0.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Icon className="w-3 h-3" />{label}
                    </p>
                    <p className="text-sm font-semibold text-foreground">{value}</p>
                  </div>
                ))}
              </div>

              {/* Price breakdown */}
              <div className="border-t border-dashed border-border pt-4 space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Payment Summary</p>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Parking ({hours}h)</span>
                  <span className="font-medium text-foreground">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>GST (18%)</span>
                  <span className="font-medium text-foreground">₹{tax}</span>
                </div>
                <div className="flex justify-between font-black text-lg border-t border-border pt-3 mt-2">
                  <span>Total Paid</span>
                  <span className="text-primary">₹{total}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Payment Successful · Mock Transaction
                </div>
              </div>
            </div>

            {/* Receipt footer */}
            <div className="bg-muted/40 border-t border-border px-6 py-4 text-center">
              <p className="text-[11px] text-muted-foreground">Thank you for choosing ParkSmart · Booking ID: #{bookingId}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">For support: support@parksmart.in · This is a demo receipt.</p>
            </div>
          </div>
        </motion.div>

        {/* ── Action buttons ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex flex-col sm:flex-row gap-3 print:hidden"
        >
          <Button variant="outline" className="flex-1 gap-2" onClick={handlePrint}>
            <Printer className="w-4 h-4" /> Print Receipt
          </Button>
          <Button variant="outline" className="flex-1 gap-2" onClick={handleDownload}>
            <Download className="w-4 h-4" /> Download Receipt
          </Button>
          <Link href="/browse" className="flex-1">
            <Button className="w-full gap-2">
              <Home className="w-4 h-4" /> Book Another
            </Button>
          </Link>
        </motion.div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 text-sm text-blue-800 space-y-1.5 print:hidden"
        >
          <p className="font-semibold">📋 What to do next:</p>
          <ul className="space-y-1 text-xs list-disc list-inside text-blue-700">
            <li>Save or print this receipt to show at the parking gate</li>
            <li>Arrive at least 5 minutes before your booking time</li>
            <li>Cancellation is free within the first 15 minutes of booking</li>
            <li>Extensions can be made from the parking lot kiosk</li>
          </ul>
        </motion.div>
      </div>
    </main>
  )
}

export default function BookingConfirmedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading receipt…</p>
      </div>
    }>
      <ConfirmedInner />
    </Suspense>
  )
}
