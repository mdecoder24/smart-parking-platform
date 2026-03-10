'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  MapPin, Zap, Accessibility, Clock, Shield,
  Car, Bike, Truck, ChevronRight, SlidersHorizontal,
  Search, X, CheckCircle2, Info, ArrowLeft
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type VehicleId = 'all' | 'car' | 'motorcycle' | 'bicycle' | 'truck' | 'ev'
type SlotStatus = 'available' | 'occupied' | 'reserved' | 'ev' | 'handicap' | 'bike' | 'truck'

interface ParkingSlot {
  id: string
  number: string
  status: SlotStatus
  type: VehicleId | 'handicap'
  floor: number
}

interface MockLot {
  id: string
  name: string
  address: string
  city: string
  state: string
  parking_type: 'surface' | 'garage' | 'valet'
  hourly_rate: number
  daily_rate: number
  total_spaces: number
  available_spaces: number
  has_ev_charging: boolean
  has_covered_spaces: boolean
  is_handicap_accessible: boolean
  is_open_24_7: boolean
  slots: ParkingSlot[]
}

// ─────────────────────────────────────────────
// Mock data generator
// ─────────────────────────────────────────────
function generateSlots(lotId: string, rows: number, cols: number): ParkingSlot[] {
  const statuses: SlotStatus[] = ['available', 'available', 'available', 'occupied', 'reserved', 'ev', 'handicap', 'bike', 'truck', 'available']
  const slots: ParkingSlot[] = []
  let n = 1
  for (let floor = 1; floor <= Math.ceil(rows / 5); floor++) {
    const rowsOnFloor = Math.min(5, rows - (floor - 1) * 5)
    for (let r = 0; r < rowsOnFloor; r++) {
      for (let c = 0; c < cols; c++) {
        const seed = (n * 7 + parseInt(lotId, 36)) % statuses.length
        const status = statuses[seed]
        let type: VehicleId | 'handicap' = 'car'
        if (status === 'ev') type = 'ev'
        else if (status === 'handicap') type = 'handicap'
        else if (status === 'bike') type = 'bicycle'
        else if (status === 'truck') type = 'truck'
        else if (n % 9 === 0) type = 'motorcycle'
        slots.push({ id: `${lotId}-S${n}`, number: `${String.fromCharCode(64 + floor)}${n}`, status, type, floor })
        n++
      }
    }
  }
  return slots
}

const MOCK_LOTS: MockLot[] = [
  {
    id: '1', name: 'CityCenter Parking Hub', address: '12 Downtown Ave', city: 'Mumbai', state: 'MH',
    parking_type: 'garage', hourly_rate: 40, daily_rate: 300, total_spaces: 80, available_spaces: 34,
    has_ev_charging: true, has_covered_spaces: true, is_handicap_accessible: true, is_open_24_7: true,
    slots: generateSlots('1', 10, 8),
  },
  {
    id: '2', name: 'Westside Mall Parking', address: '88 Mall Road', city: 'Mumbai', state: 'MH',
    parking_type: 'surface', hourly_rate: 25, daily_rate: 180, total_spaces: 60, available_spaces: 20,
    has_ev_charging: false, has_covered_spaces: false, is_handicap_accessible: true, is_open_24_7: false,
    slots: generateSlots('2', 8, 8),
  },
  {
    id: '3', name: 'Techpark Smart Lot', address: '1 Techpark Blvd', city: 'Pune', state: 'MH',
    parking_type: 'garage', hourly_rate: 35, daily_rate: 250, total_spaces: 100, available_spaces: 55,
    has_ev_charging: true, has_covered_spaces: true, is_handicap_accessible: true, is_open_24_7: true,
    slots: generateSlots('3', 12, 8),
  },
  {
    id: '4', name: 'Airport Express Parking', address: 'Terminal 2, Airport Rd', city: 'Delhi', state: 'DL',
    parking_type: 'garage', hourly_rate: 60, daily_rate: 450, total_spaces: 120, available_spaces: 70,
    has_ev_charging: true, has_covered_spaces: true, is_handicap_accessible: true, is_open_24_7: true,
    slots: generateSlots('4', 15, 8),
  },
  {
    id: '5', name: 'Green Cycle & Bike Stand', address: '5 Garden Lane', city: 'Bangalore', state: 'KA',
    parking_type: 'surface', hourly_rate: 10, daily_rate: 60, total_spaces: 40, available_spaces: 30,
    has_ev_charging: false, has_covered_spaces: false, is_handicap_accessible: false, is_open_24_7: false,
    slots: generateSlots('5', 5, 8),
  },
  {
    id: '6', name: 'Harbor View Valet', address: '2 Sea Link Rd', city: 'Mumbai', state: 'MH',
    parking_type: 'valet', hourly_rate: 80, daily_rate: 600, total_spaces: 50, available_spaces: 18,
    has_ev_charging: true, has_covered_spaces: true, is_handicap_accessible: true, is_open_24_7: false,
    slots: generateSlots('6', 6, 8),
  },
]

// ─────────────────────────────────────────────
// Vehicle type config
// ─────────────────────────────────────────────
const VEHICLE_TYPES = [
  { id: 'all' as VehicleId, label: 'All Types', emoji: '🅿️', desc: 'Any vehicle', activeColor: 'bg-slate-700 text-white border-slate-700', mult: 1 },
  { id: 'car' as VehicleId, label: 'Car', emoji: '🚗', desc: 'Standard & compact', activeColor: 'bg-blue-600 text-white border-blue-600', mult: 1 },
  { id: 'motorcycle' as VehicleId, label: 'Motorcycle', emoji: '🏍️', desc: 'Bikes & scooters', activeColor: 'bg-orange-500 text-white border-orange-500', mult: 0.6 },
  { id: 'bicycle' as VehicleId, label: 'Bicycle', emoji: '🚲', desc: 'Cycle parking', activeColor: 'bg-green-600 text-white border-green-600', mult: 0.25 },
  { id: 'truck' as VehicleId, label: 'Truck / SUV', emoji: '🚚', desc: 'Large vehicles', activeColor: 'bg-purple-600 text-white border-purple-600', mult: 1.5 },
  { id: 'ev' as VehicleId, label: 'Electric', emoji: '⚡', desc: 'EV charging', activeColor: 'bg-emerald-600 text-white border-emerald-600', mult: 1.1 },
]

// ─────────────────────────────────────────────
// Slot appearance helpers
// ─────────────────────────────────────────────
function slotMeta(slot: ParkingSlot, vehicleType: VehicleId, selected: boolean) {
  if (selected) return { bg: 'bg-indigo-600', border: 'border-indigo-700', text: 'text-white', label: slot.number, clickable: true }
  switch (slot.status) {
    case 'occupied':  return { bg: 'bg-red-400',    border: 'border-red-500',    text: 'text-white',         label: '✕',         clickable: false }
    case 'reserved':  return { bg: 'bg-amber-300',  border: 'border-amber-400',  text: 'text-amber-900',     label: '🔒',        clickable: false }
    case 'ev':        return { bg: 'bg-emerald-100',border: 'border-emerald-400',text: 'text-emerald-800',   label: '⚡',        clickable: vehicleType === 'ev' || vehicleType === 'all' || vehicleType === 'car' }
    case 'handicap':  return { bg: 'bg-blue-100',   border: 'border-blue-400',   text: 'text-blue-800',      label: '♿',        clickable: vehicleType === 'all' }
    case 'bike':      return { bg: 'bg-lime-100',   border: 'border-lime-400',   text: 'text-lime-800',      label: '🚲',        clickable: vehicleType === 'bicycle' || vehicleType === 'all' }
    case 'truck':     return { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-800',    label: '🚚',        clickable: vehicleType === 'truck' || vehicleType === 'all' }
    default:          return { bg: 'bg-green-100',  border: 'border-green-400',  text: 'text-green-800',     label: slot.number, clickable: vehicleType !== 'ev' }
  }
}

function getOccBar(lot: MockLot) {
  const pct = lot.total_spaces > 0 ? ((lot.total_spaces - lot.available_spaces) / lot.total_spaces) * 100 : 0
  if (pct >= 90) return { pct, barColor: 'bg-red-500',     badgeBg: 'bg-red-100 text-red-700',       label: 'Almost Full' }
  if (pct >= 65) return { pct, barColor: 'bg-amber-500',   badgeBg: 'bg-amber-100 text-amber-700',   label: 'Filling Up' }
  return           { pct, barColor: 'bg-emerald-500', badgeBg: 'bg-emerald-100 text-emerald-700', label: 'Available' }
}

// ─────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────
function Legend() {
  const items = [
    { color: 'bg-green-100 border-green-400',   label: 'Available' },
    { color: 'bg-red-400 border-red-500',        label: 'Occupied' },
    { color: 'bg-amber-300 border-amber-400',    label: 'Reserved' },
    { color: 'bg-emerald-100 border-emerald-400',label: 'EV Charging' },
    { color: 'bg-blue-100 border-blue-400',      label: 'Accessible' },
    { color: 'bg-lime-100 border-lime-400',      label: 'Bicycle' },
    { color: 'bg-purple-100 border-purple-400',  label: 'Truck/Large' },
    { color: 'bg-indigo-600 border-indigo-700',  label: 'Selected' },
  ]
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
      {items.map(({ color, label }) => (
        <span key={label} className="flex items-center gap-1.5">
          <span className={`w-3.5 h-3.5 rounded border ${color} inline-block`} />
          {label}
        </span>
      ))}
    </div>
  )
}

function SlotGrid({ lot, vehicleType, selectedSlot, onSelect }: {
  lot: MockLot
  vehicleType: VehicleId
  selectedSlot: ParkingSlot | null
  onSelect: (slot: ParkingSlot) => void
}) {
  const floors = Array.from(new Set(lot.slots.map(s => s.floor))).sort()

  return (
    <div className="space-y-6">
      {floors.map(floor => {
        const floorSlots = lot.slots.filter(s => s.floor === floor)
        return (
          <div key={floor}>
            {floors.length > 1 && (
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                Floor {floor} — Level {String.fromCharCode(64 + floor)}
              </p>
            )}
            {/* Driving lane visual */}
            <div className="relative">
              {/* Lane stripe */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-5 bg-zinc-100 border-y border-dashed border-zinc-300 pointer-events-none z-0 flex items-center justify-center">
                <span className="text-[9px] text-zinc-400 font-medium tracking-[0.3em] uppercase">Driving Lane</span>
              </div>
              {/* Top row (odd) */}
              <div className="flex gap-1.5 flex-wrap justify-start pb-6 relative z-10">
                {floorSlots.filter((_, i) => i % 2 === 0).map(slot => {
                  const meta = slotMeta(slot, vehicleType, selectedSlot?.id === slot.id)
                  return (
                    <motion.button
                      key={slot.id}
                      whileHover={meta.clickable ? { scale: 1.1, y: -2 } : {}}
                      whileTap={meta.clickable ? { scale: 0.95 } : {}}
                      onClick={() => meta.clickable && onSelect(slot)}
                      className={`relative w-12 h-14 rounded-t-lg border-2 flex flex-col items-center justify-center text-center transition-all duration-150 ${meta.bg} ${meta.border} ${meta.text} ${meta.clickable ? 'cursor-pointer hover:shadow-md' : 'cursor-not-allowed opacity-80'} text-[10px] font-semibold`}
                      title={meta.clickable ? `Select ${slot.number}` : `${slot.status}`}
                    >
                      <span className="leading-none">{meta.label}</span>
                      {selectedSlot?.id === slot.id && (
                        <CheckCircle2 className="absolute -top-2 -right-2 w-4 h-4 text-indigo-600 bg-white rounded-full" />
                      )}
                    </motion.button>
                  )
                })}
              </div>
              {/* Bottom row (even) */}
              <div className="flex gap-1.5 flex-wrap justify-start pt-6 relative z-10">
                {floorSlots.filter((_, i) => i % 2 === 1).map(slot => {
                  const meta = slotMeta(slot, vehicleType, selectedSlot?.id === slot.id)
                  return (
                    <motion.button
                      key={slot.id}
                      whileHover={meta.clickable ? { scale: 1.1, y: 2 } : {}}
                      whileTap={meta.clickable ? { scale: 0.95 } : {}}
                      onClick={() => meta.clickable && onSelect(slot)}
                      className={`relative w-12 h-14 rounded-b-lg border-2 flex flex-col items-center justify-center text-center transition-all duration-150 ${meta.bg} ${meta.border} ${meta.text} ${meta.clickable ? 'cursor-pointer hover:shadow-md' : 'cursor-not-allowed opacity-80'} text-[10px] font-semibold`}
                      title={meta.clickable ? `Select ${slot.number}` : `${slot.status}`}
                    >
                      <span className="leading-none">{meta.label}</span>
                      {selectedSlot?.id === slot.id && (
                        <CheckCircle2 className="absolute -top-2 -right-2 w-4 h-4 text-indigo-600 bg-white rounded-full" />
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────
export default function BrowsePage() {
  const [vehicleType, setVehicleType] = useState<VehicleId>('all')
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({ ev: false, accessible: false, covered: false, open24h: false })
  const [selectedLot, setSelectedLot] = useState<MockLot | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null)
  const slotGridRef = useRef<HTMLDivElement>(null)

  const vehicleConfig = VEHICLE_TYPES.find(v => v.id === vehicleType)!
  const activeFilterCount = Object.values(filters).filter(Boolean).length

  const filteredLots = MOCK_LOTS.filter(lot => {
    if (search && !lot.name.toLowerCase().includes(search.toLowerCase()) &&
        !lot.city.toLowerCase().includes(search.toLowerCase()) &&
        !lot.address.toLowerCase().includes(search.toLowerCase())) return false
    if (filters.ev && !lot.has_ev_charging) return false
    if (filters.accessible && !lot.is_handicap_accessible) return false
    if (filters.covered && !lot.has_covered_spaces) return false
    if (filters.open24h && !lot.is_open_24_7) return false
    if (vehicleType === 'ev' && !lot.has_ev_charging) return false
    return true
  })

  // Scroll to slot grid when a lot is selected
  useEffect(() => {
    if (selectedLot && slotGridRef.current) {
      setTimeout(() => slotGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    }
  }, [selectedLot])

  const handleSelectLot = (lot: MockLot) => {
    setSelectedLot(lot)
    setSelectedSlot(null)
  }

  const handleBack = () => {
    setSelectedLot(null)
    setSelectedSlot(null)
  }

  const availableCount = selectedLot
    ? selectedLot.slots.filter(s => {
        if (vehicleType === 'ev') return s.status === 'ev'
        if (vehicleType === 'bicycle') return s.status === 'bike' || s.status === 'available'
        if (vehicleType === 'truck') return s.status === 'truck' || s.status === 'available'
        if (vehicleType === 'motorcycle') return s.status === 'available'
        return s.status === 'available' || s.status === 'ev'
      }).length
    : 0

  return (
    <main className="min-h-screen bg-background">

      {/* ── Sticky Header ─────────────────────────────────────────── */}
      <motion.div
        className="border-b border-border bg-card/95 backdrop-blur sticky top-0 z-20 shadow-sm"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-3">
          {selectedLot ? (
            <button onClick={handleBack} className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors shrink-0 font-medium text-sm">
              <ArrowLeft className="w-4 h-4" /> Lots
            </button>
          ) : (
            <Link href="/" className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors shrink-0">
              <MapPin className="w-4 h-4" />
              <span className="font-semibold hidden sm:inline text-sm">ParkSmart</span>
            </Link>
          )}

          {!selectedLot && (
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by city, lot or address…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 pr-8 h-9" />
              {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>}
            </div>
          )}

          {selectedLot && (
            <div className="flex-1">
              <p className="font-semibold text-foreground text-sm">{selectedLot.name}</p>
              <p className="text-xs text-muted-foreground">{selectedLot.city}, {selectedLot.state}</p>
            </div>
          )}

          {!selectedLot && (
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${showFilters ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-destructive text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{activeFilterCount}</span>
              )}
            </button>
          )}
        </div>

        {/* Filter strip */}
        <AnimatePresence>
          {showFilters && !selectedLot && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden border-t border-border">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap gap-2">
                {[
                  { key: 'ev',         icon: Zap,           label: 'EV Charging' },
                  { key: 'accessible', icon: Accessibility,  label: 'Accessible' },
                  { key: 'covered',    icon: Shield,         label: 'Covered' },
                  { key: 'open24h',    icon: Clock,          label: 'Open 24/7' },
                ].map(({ key, icon: Icon, label }) => {
                  const active = filters[key as keyof typeof filters]
                  return (
                    <button key={key} onClick={() => setFilters(p => ({ ...p, [key]: !active }))}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${active ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}>
                      <Icon className="w-3.5 h-3.5" />{label}
                    </button>
                  )
                })}
                {activeFilterCount > 0 && (
                  <button onClick={() => setFilters({ ev: false, accessible: false, covered: false, open24h: false })}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-dashed border-destructive/60 text-destructive text-xs hover:bg-destructive/5 transition-colors">
                    <X className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        <AnimatePresence mode="wait">
          {!selectedLot ? (
            <motion.div key="lot-list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="space-y-8">

              {/* Page heading */}
              <div>
                <h1 className="text-3xl font-bold text-foreground">Find Parking</h1>
                <p className="text-muted-foreground mt-1 text-sm">Choose your vehicle type, pick a lot, then select your exact space</p>
              </div>

              {/* ── Vehicle selector ───────────────────────────────── */}
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Vehicle Type</p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {VEHICLE_TYPES.map(vt => {
                    const active = vehicleType === vt.id
                    return (
                      <motion.button key={vt.id} onClick={() => setVehicleType(vt.id)}
                        whileHover={{ y: -3, scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        className={`flex flex-col items-center gap-1.5 p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 ${active ? vt.activeColor + ' shadow-md' : 'border-border bg-card hover:border-primary/40 hover:bg-muted/40'}`}>
                        <span className="text-2xl sm:text-3xl">{vt.emoji}</span>
                        <span className="text-xs font-semibold text-center leading-tight">{vt.label}</span>
                        <span className={`text-[10px] text-center hidden sm:block leading-tight ${active ? 'opacity-75' : 'text-muted-foreground'}`}>{vt.desc}</span>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Vehicle info banner */}
              <AnimatePresence mode="wait">
                {vehicleType !== 'all' && (
                  <motion.div key={vehicleType} initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/60 border border-border">
                      <span className="text-2xl">{vehicleConfig.emoji}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{vehicleConfig.label} parking spaces will be highlighted</p>
                        <p className="text-xs text-muted-foreground">Rate multiplier: ×{vehicleConfig.mult} · {vehicleConfig.mult < 1 ? `${Math.round((1 - vehicleConfig.mult) * 100)}% cheaper` : vehicleConfig.mult > 1 ? `${Math.round((vehicleConfig.mult - 1) * 100)}% more` : 'standard rate'}</p>
                      </div>
                      <button onClick={() => setVehicleType('all')} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Lot grid ────────────────────────────────────────── */}
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  <span className="font-semibold text-foreground">{filteredLots.length}</span> parking locations found
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredLots.map((lot, i) => {
                    const occ = getOccBar(lot)
                    const mult = vehicleConfig.mult
                    return (
                      <motion.div key={lot.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        whileHover={{ y: -5 }}>
                        <Card className="overflow-hidden flex flex-col h-full hover:border-primary/50 hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => handleSelectLot(lot)}>
                          {/* Top band */}
                          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 pb-4">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h3 className="font-bold text-base text-foreground leading-tight">{lot.name}</h3>
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{lot.address}, {lot.city}</p>
                              </div>
                              <span className={`text-[11px] font-semibold px-2 py-1 rounded-full shrink-0 ${occ.badgeBg}`}>{occ.label}</span>
                            </div>
                            <span className="inline-block mt-2 text-[11px] font-medium bg-background/80 border border-border px-2 py-0.5 rounded-full capitalize">{lot.parking_type}</span>
                          </div>

                          {/* Occupancy bar */}
                          <div className="px-5 py-3 border-y border-border bg-muted/20">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                              <span>Occupancy</span>
                              <span className="font-semibold text-foreground">{lot.available_spaces} / {lot.total_spaces} free</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <motion.div className={`h-full rounded-full ${occ.barColor}`}
                                initial={{ width: 0 }} animate={{ width: `${occ.pct}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.06 + 0.2 }} />
                            </div>
                          </div>

                          {/* Space types */}
                          <div className="px-5 py-3 border-b border-border">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Accepts</p>
                            <div className="flex flex-wrap gap-1">
                              <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">🚗 Cars</span>
                              <span className="text-[11px] bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full">🏍️ Moto</span>
                              {lot.has_covered_spaces && <span className="text-[11px] bg-lime-50 text-lime-700 border border-lime-200 px-2 py-0.5 rounded-full">🚲 Bikes</span>}
                              {lot.parking_type !== 'valet' && <span className="text-[11px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">🚚 Trucks</span>}
                              {lot.has_ev_charging && <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">⚡ EVs</span>}
                            </div>
                          </div>

                          {/* Pricing */}
                          <div className="px-5 py-4 flex-1">
                            <div className="flex gap-2 mb-3">
                              <div className="flex-1 bg-muted/50 rounded-lg p-2.5">
                                <p className="text-[10px] text-muted-foreground">Per Hour</p>
                                <p className="text-lg font-bold text-primary">₹{(lot.hourly_rate * mult).toFixed(0)}</p>
                              </div>
                              <div className="flex-1 bg-muted/50 rounded-lg p-2.5">
                                <p className="text-[10px] text-muted-foreground">Per Day</p>
                                <p className="text-lg font-bold text-primary">₹{(lot.daily_rate * mult).toFixed(0)}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {lot.has_ev_charging    && <span className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full flex items-center gap-1"><Zap className="w-2.5 h-2.5" />EV</span>}
                              {lot.has_covered_spaces && <span className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full flex items-center gap-1"><Shield className="w-2.5 h-2.5" />Covered</span>}
                              {lot.is_handicap_accessible && <span className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full flex items-center gap-1"><Accessibility className="w-2.5 h-2.5" />Accessible</span>}
                              {lot.is_open_24_7       && <span className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full flex items-center gap-1"><Clock className="w-2.5 h-2.5" />24/7</span>}
                            </div>
                          </div>

                          {/* CTA */}
                          <div className="px-5 pb-5">
                            <Button className="w-full gap-2 font-semibold" onClick={(e) => { e.stopPropagation(); handleSelectLot(lot) }}>
                              View & Select Spaces <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </motion.div>

          ) : (
            /* ── Slot Picker ─────────────────────────────────────────── */
            <motion.div key="slot-picker" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }} className="space-y-6" ref={slotGridRef}>

              {/* Lot summary bar */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground">{selectedLot.name}</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="w-3.5 h-3.5" />{selectedLot.address}, {selectedLot.city}, {selectedLot.state}</p>
                </div>
                <div className="flex gap-4 shrink-0">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{availableCount}</p>
                    <p className="text-xs text-muted-foreground">Available for {vehicleConfig.label}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">₹{(selectedLot.hourly_rate * vehicleConfig.mult).toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">/ hour</p>
                  </div>
                </div>
              </div>

              {/* Vehicle type quick-switch */}
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Your Vehicle</p>
                <div className="flex gap-2 flex-wrap">
                  {VEHICLE_TYPES.map(vt => (
                    <button key={vt.id} onClick={() => { setVehicleType(vt.id); setSelectedSlot(null) }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${vehicleType === vt.id ? vt.activeColor + ' shadow-sm' : 'border-border bg-card hover:bg-muted'}`}>
                      {vt.emoji} {vt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Info bar */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Green spaces are available for your vehicle type. Greyed-out spaces are for other vehicles or unavailable. Click any <strong>highlighted space</strong> to select it.</span>
              </div>

              {/* Legend */}
              <div className="p-4 bg-card border border-border rounded-xl">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Legend</p>
                <Legend />
              </div>

              {/* Slot grid */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                {/* Grid header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
                  <div>
                    <p className="font-semibold text-foreground">{selectedLot.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{selectedLot.parking_type} · {selectedLot.total_spaces} total spaces</p>
                  </div>
                  {selectedSlot && (
                    <button onClick={() => setSelectedSlot(null)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                      <X className="w-3 h-3" /> Deselect
                    </button>
                  )}
                </div>

                {/* Entrance indicator */}
                <div className="flex items-center px-5 pt-4 pb-2 gap-2">
                  <div className="flex-1 h-1 bg-gradient-to-r from-green-400 to-transparent rounded" />
                  <span className="text-[10px] text-green-600 font-bold uppercase tracking-widest">▲ Entrance</span>
                  <div className="flex-1 h-1 bg-gradient-to-l from-green-400 to-transparent rounded" />
                </div>

                {/* Slot grid itself */}
                <div className="px-5 pb-6 overflow-x-auto">
                  <SlotGrid lot={selectedLot} vehicleType={vehicleType} selectedSlot={selectedSlot} onSelect={setSelectedSlot} />
                </div>

                {/* Exit indicator */}
                <div className="flex items-center px-5 pt-2 pb-4 gap-2">
                  <div className="flex-1 h-1 bg-gradient-to-r from-red-300 to-transparent rounded" />
                  <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest">▼ Exit</span>
                  <div className="flex-1 h-1 bg-gradient-to-l from-red-300 to-transparent rounded" />
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Floating booking panel (when slot selected) ─────────────── */}
      <AnimatePresence>
        {selectedSlot && selectedLot && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-30 p-4 bg-card border-t border-border shadow-2xl"
          >
            <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-4">
              {/* Selected space info */}
              <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
                <div className="w-14 h-14 rounded-xl bg-indigo-600 flex flex-col items-center justify-center text-white shrink-0 shadow-lg">
                  <span className="text-lg font-bold leading-none">{selectedSlot.number}</span>
                  <span className="text-[9px] uppercase tracking-wide opacity-80">Space</span>
                </div>
                <div>
                  <p className="font-bold text-foreground">{selectedLot.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Space {selectedSlot.number} · {vehicleConfig.emoji} {vehicleConfig.label} ·
                    <span className="font-semibold text-primary"> ₹{(selectedLot.hourly_rate * vehicleConfig.mult).toFixed(0)}/hr</span>
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 w-full sm:w-auto">
                <button onClick={() => setSelectedSlot(null)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
                  Change
                </button>
                <Link href={`/book?lot=${selectedLot.id}&slot=${selectedSlot.id}&vehicle=${vehicleType}`} className="flex-1 sm:flex-none">
                  <Button className="w-full gap-2 font-semibold px-6 py-2.5">
                    <CheckCircle2 className="w-4 h-4" /> Book Space {selectedSlot.number}
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom padding for floating panel */}
      {selectedSlot && <div className="h-28" />}
    </main>
  )
}
