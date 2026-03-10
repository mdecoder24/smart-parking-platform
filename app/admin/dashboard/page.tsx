'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, LogOut, LayoutDashboard, Car, Calendar, BarChart3,
  DollarSign, Users, TrendingUp, TrendingDown, Zap, Shield,
  Clock, Accessibility, CheckCircle2, XCircle, AlertCircle,
  ChevronUp, ChevronDown, Eye, Settings, Bell, Search,
  RefreshCw, Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts'

// ─────────────────────────────────────────────
// Mock data (always shown — supplements Supabase)
// ─────────────────────────────────────────────
const MOCK_LOTS = [
  { id: '1', name: 'CityCenter Parking Hub',   address: '12 Downtown Ave',       city: 'Mumbai',    state: 'MH', parking_type: 'garage',  total_spaces: 80,  available_spaces: 34, occupied_spaces: 32, reserved_spaces: 14, hourly_rate: 40,  daily_rate: 300, has_ev_charging: true,  has_covered_spaces: true,  is_handicap_accessible: true,  is_open_24_7: true  },
  { id: '2', name: 'Westside Mall Parking',    address: '88 Mall Road',          city: 'Mumbai',    state: 'MH', parking_type: 'surface', total_spaces: 60,  available_spaces: 20, occupied_spaces: 28, reserved_spaces: 12, hourly_rate: 25,  daily_rate: 180, has_ev_charging: false, has_covered_spaces: false, is_handicap_accessible: true,  is_open_24_7: false },
  { id: '3', name: 'Techpark Smart Lot',       address: '1 Techpark Blvd',       city: 'Pune',      state: 'MH', parking_type: 'garage',  total_spaces: 100, available_spaces: 55, occupied_spaces: 30, reserved_spaces: 15, hourly_rate: 35,  daily_rate: 250, has_ev_charging: true,  has_covered_spaces: true,  is_handicap_accessible: true,  is_open_24_7: true  },
  { id: '4', name: 'Airport Express Parking',  address: 'Terminal 2, Airport Rd',city: 'Delhi',     state: 'DL', parking_type: 'garage',  total_spaces: 120, available_spaces: 70, occupied_spaces: 35, reserved_spaces: 15, hourly_rate: 60,  daily_rate: 450, has_ev_charging: true,  has_covered_spaces: true,  is_handicap_accessible: true,  is_open_24_7: true  },
  { id: '5', name: 'Green Cycle & Bike Stand', address: '5 Garden Lane',         city: 'Bangalore', state: 'KA', parking_type: 'surface', total_spaces: 40,  available_spaces: 30, occupied_spaces: 8,  reserved_spaces: 2,  hourly_rate: 10,  daily_rate: 60,  has_ev_charging: false, has_covered_spaces: false, is_handicap_accessible: false, is_open_24_7: false },
  { id: '6', name: 'Harbor View Valet',        address: '2 Sea Link Rd',         city: 'Mumbai',    state: 'MH', parking_type: 'valet',   total_spaces: 50,  available_spaces: 18, occupied_spaces: 24, reserved_spaces: 8,  hourly_rate: 80,  daily_rate: 600, has_ev_charging: true,  has_covered_spaces: true,  is_handicap_accessible: true,  is_open_24_7: false },
]

const MOCK_RESERVATIONS = [
  { id: 'PS8F3K2A', lot: 'CityCenter Parking Hub',   space: 'A3',  vehicle: '🚗 Car',        plate: 'MH 12 AB 3456', start: '2026-03-10T08:00', end: '2026-03-10T10:00', duration: '2h',  total: 94.4,   status: 'completed' },
  { id: 'PSMMKFHU', lot: 'Techpark Smart Lot',        space: 'B14', vehicle: '⚡ Electric',   plate: 'MH 04 EV 7890', start: '2026-03-10T09:30', end: '2026-03-10T12:30', duration: '3h',  total: 138.6,  status: 'active'    },
  { id: 'PS9JQ3RN', lot: 'Airport Express Parking',   space: 'C22', vehicle: '🚗 Car',        plate: 'DL 01 CD 2345', start: '2026-03-10T06:00', end: '2026-03-10T18:00', duration: '12h', total: 849.6,  status: 'active'    },
  { id: 'PSKL7WPQ', lot: 'Westside Mall Parking',     space: 'A9',  vehicle: '🏍️ Motorcycle', plate: 'MH 02 MO 5678', start: '2026-03-10T11:00', end: '2026-03-10T14:00', duration: '3h',  total: 44.25,  status: 'active'    },
  { id: 'PS2TN8XC', lot: 'Harbor View Valet',         space: 'V5',  vehicle: '🚗 Car',        plate: 'MH 08 HV 9012', start: '2026-03-10T07:00', end: '2026-03-10T09:00', duration: '2h',  total: 188.8,  status: 'completed' },
  { id: 'PS4MB6YD', lot: 'CityCenter Parking Hub',    space: 'B7',  vehicle: '🚲 Bicycle',    plate: 'N/A',           start: '2026-03-10T10:00', end: '2026-03-10T11:00', duration: '1h',  total: 11.8,   status: 'completed' },
  { id: 'PS7FZ2KE', lot: 'Green Cycle & Bike Stand',  space: 'G12', vehicle: '🚲 Bicycle',    plate: 'N/A',           start: '2026-03-10T08:30', end: '2026-03-10T09:30', duration: '1h',  total: 11.8,   status: 'cancelled' },
  { id: 'PS5QW1JF', lot: 'Techpark Smart Lot',        space: 'A31', vehicle: '🚚 Truck',      plate: 'MH 14 TK 3456', start: '2026-03-10T07:00', end: '2026-03-10T10:00', duration: '3h',  total: 207.9,  status: 'completed' },
]

// Revenue trend (last 14 days)
function generateRevenueTrend() {
  const days: { date: string; revenue: number; bookings: number }[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date('2026-03-10')
    d.setDate(d.getDate() - i)
    const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
    days.push({ date: label, revenue: Math.floor(2000 + Math.random() * 4000), bookings: Math.floor(12 + Math.random() * 30) })
  }
  return days
}
const REVENUE_TREND = generateRevenueTrend()

const OCCUPANCY_BY_LOT = MOCK_LOTS.map(l => ({
  name: l.name.split(' ').slice(0, 2).join(' '),
  occupied: l.occupied_spaces,
  available: l.available_spaces,
  reserved: l.reserved_spaces,
  pct: Math.round(((l.occupied_spaces + l.reserved_spaces) / l.total_spaces) * 100),
}))

const VEHICLE_MIX = [
  { name: 'Cars',        value: 58, color: '#3b82f6' },
  { name: 'Motorcycles', value: 18, color: '#f97316' },
  { name: 'Bicycles',    value: 10, color: '#22c55e' },
  { name: 'Trucks',      value: 8,  color: '#a855f7' },
  { name: 'EVs',         value: 6,  color: '#10b981' },
]

const HOURLY_PATTERN = [
  { hour: '6AM', bookings: 4 },  { hour: '7AM', bookings: 12 },
  { hour: '8AM', bookings: 28 }, { hour: '9AM', bookings: 35 },
  { hour: '10AM', bookings: 22 },{ hour: '11AM', bookings: 18 },
  { hour: '12PM', bookings: 25 },{ hour: '1PM', bookings: 20 },
  { hour: '2PM', bookings: 16 }, { hour: '3PM', bookings: 14 },
  { hour: '4PM', bookings: 18 }, { hour: '5PM', bookings: 30 },
  { hour: '6PM', bookings: 38 }, { hour: '7PM', bookings: 26 },
  { hour: '8PM', bookings: 15 }, { hour: '9PM', bookings: 8 },
]

// ─────────────────────────────────────────────
// Sidebar nav items
// ─────────────────────────────────────────────
type Tab = 'overview' | 'lots' | 'reservations' | 'analytics'
const NAV: { id: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
  { id: 'overview',     label: 'Overview',     icon: LayoutDashboard },
  { id: 'lots',         label: 'Parking Lots', icon: Car,             badge: MOCK_LOTS.length },
  { id: 'reservations', label: 'Reservations', icon: Calendar,        badge: MOCK_RESERVATIONS.filter(r => r.status === 'active').length },
  { id: 'analytics',   label: 'Analytics',    icon: BarChart3 },
]

// ─────────────────────────────────────────────
// Small helpers
// ─────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, trend, color = 'text-primary' }: {
  label: string; value: string; sub: string; icon: React.ElementType; trend?: number; color?: string
}) {
  return (
    <Card className="p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <div className={`w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center ${color}`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
      </div>
      <div>
        <p className="text-3xl font-black text-foreground tracking-tight">{value}</p>
        <div className="flex items-center gap-1.5 mt-1">
          {trend !== undefined && (
            trend >= 0
              ? <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600"><TrendingUp className="w-3 h-3" />+{trend}%</span>
              : <span className="flex items-center gap-0.5 text-xs font-semibold text-red-500"><TrendingDown className="w-3 h-3" />{trend}%</span>
          )}
          <span className="text-xs text-muted-foreground">{sub}</span>
        </div>
      </div>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active:    'bg-emerald-100 text-emerald-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
    open:      'bg-green-100 text-green-700',
    garage:    'bg-purple-100 text-purple-700',
    surface:   'bg-amber-100 text-amber-700',
    valet:     'bg-pink-100 text-pink-700',
  }
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${map[status] ?? 'bg-muted text-muted-foreground'}`}>
      {status}
    </span>
  )
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter()
  const [tab, setTab]             = useState<Tab>('overview')
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatus] = useState('all')
  const [sidebarOpen, setSidebar] = useState(true)
  const [lastRefresh]             = useState(new Date())

  // Auth guard
  useEffect(() => {
    const uid = localStorage.getItem('user_id')
    if (!uid) router.push('/admin/login')
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_id')
    router.push('/admin/login')
  }

  // Derived stats
  const totalSpaces    = MOCK_LOTS.reduce((s, l) => s + l.total_spaces, 0)
  const totalAvail     = MOCK_LOTS.reduce((s, l) => s + l.available_spaces, 0)
  const totalOccupied  = MOCK_LOTS.reduce((s, l) => s + l.occupied_spaces + l.reserved_spaces, 0)
  const avgOccupancy   = Math.round((totalOccupied / totalSpaces) * 100)
  const totalRevToday  = MOCK_RESERVATIONS.reduce((s, r) => s + r.total, 0)
  const totalBookings  = MOCK_RESERVATIONS.length
  const activeBookings = MOCK_RESERVATIONS.filter(r => r.status === 'active').length

  const filteredReservations = useMemo(() => {
    return MOCK_RESERVATIONS.filter(r => {
      const matchSearch = !search || r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.lot.toLowerCase().includes(search.toLowerCase()) ||
        r.plate.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || r.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [search, statusFilter])

  const filteredLots = useMemo(() =>
    MOCK_LOTS.filter(l => !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.city.toLowerCase().includes(search.toLowerCase())),
  [search])

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── Top bar ──────────────────────────────────────────────── */}
      <header className="h-14 border-b border-border bg-card sticky top-0 z-30 flex items-center px-4 gap-4 shadow-sm">
        <button onClick={() => setSidebar(v => !v)} className="p-1.5 rounded-lg hover:bg-muted transition-colors lg:hidden">
          <LayoutDashboard className="w-5 h-5" />
        </button>
        <Link href="/" className="flex items-center gap-2 text-primary font-black text-lg tracking-tight">
          <MapPin className="w-5 h-5" />
          <span>ParkSmart</span>
          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold ml-1">Admin</span>
        </Link>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:block">
            Last refresh: {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button className="p-2 rounded-lg hover:bg-muted transition-colors relative">
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <button className="p-2 rounded-lg hover:bg-muted transition-colors">
            <Settings className="w-4.5 h-4.5" />
          </button>
          <div className="w-px h-5 bg-border mx-1" />
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-muted">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ──────────────────────────────────────────────── */}
        <AnimatePresence initial={false}>
          {(sidebarOpen) && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-r border-border bg-card flex flex-col shrink-0 overflow-hidden"
            >
              <div className="p-3 space-y-0.5 flex-1">
                {NAV.map(n => (
                  <button
                    key={n.id}
                    onClick={() => setTab(n.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === n.id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                  >
                    <n.icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1 text-left">{n.label}</span>
                    {n.badge !== undefined && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === n.id ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
                        {n.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Sidebar footer */}
              <div className="p-3 border-t border-border">
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">A</div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Admin</p>
                    <p className="text-[10px] text-muted-foreground">admin@parksmart.in</p>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ── Main content ─────────────────────────────────────────── */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-6 space-y-6">

            {/* Page title + search bar */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <h1 className="text-2xl font-black text-foreground">
                  {tab === 'overview' && 'Dashboard Overview'}
                  {tab === 'lots' && 'Parking Lots'}
                  {tab === 'reservations' && 'Reservations'}
                  {tab === 'analytics' && 'Analytics'}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {new Date('2026-03-10').toLocaleDateString('en-IN', { dateStyle: 'full' })}
                </p>
              </div>
              {(tab === 'lots' || tab === 'reservations') && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-56 h-9" />
                </div>
              )}
              <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-2 hover:bg-muted transition-colors">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>

            {/* ━━━━━━━━━━━━ OVERVIEW TAB ━━━━━━━━━━━━ */}
            <AnimatePresence mode="wait">
              {tab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">

                  {/* KPI grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard label="Today's Revenue"   value={`₹${totalRevToday.toFixed(0)}`}   sub="vs yesterday" trend={12}  icon={DollarSign} />
                    <KpiCard label="Active Bookings"   value={String(activeBookings)}            sub={`of ${totalBookings} total`} trend={5}    icon={Calendar}   />
                    <KpiCard label="Available Spaces"  value={String(totalAvail)}               sub={`of ${totalSpaces} total`}   trend={-3}   icon={MapPin}     />
                    <KpiCard label="Avg Occupancy"     value={`${avgOccupancy}%`}               sub="across all lots" trend={8}              icon={BarChart3}  />
                  </div>

                  {/* Secondary KPIs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { icon: Zap,           label: 'EV Lots',          value: `${MOCK_LOTS.filter(l => l.has_ev_charging).length}`,      color: 'text-emerald-600' },
                      { icon: Shield,        label: 'Covered Lots',     value: `${MOCK_LOTS.filter(l => l.has_covered_spaces).length}`,   color: 'text-blue-600'    },
                      { icon: Accessibility, label: 'Accessible',       value: `${MOCK_LOTS.filter(l => l.is_handicap_accessible).length}`,color: 'text-purple-600' },
                      { icon: Clock,         label: 'Open 24/7',        value: `${MOCK_LOTS.filter(l => l.is_open_24_7).length}`,         color: 'text-amber-600'   },
                    ].map(({ icon: Icon, label, value, color }) => (
                      <div key={label} className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3">
                        <div className={`${color} shrink-0`}><Icon className="w-4 h-4" /></div>
                        <div>
                          <p className="text-lg font-black text-foreground">{value}</p>
                          <p className="text-[11px] text-muted-foreground">{label}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Charts row */}
                  <div className="grid lg:grid-cols-3 gap-5">
                    {/* Revenue area chart */}
                    <Card className="p-5 lg:col-span-2">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-foreground">Revenue Trend</h3>
                          <p className="text-xs text-muted-foreground">Last 14 days</p>
                        </div>
                        <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 border border-border rounded px-2 py-1">
                          <Download className="w-3 h-3" /> Export
                        </button>
                      </div>
                      <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={REVENUE_TREND}>
                          <defs>
                            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} />
                          <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/1000).toFixed(1)}k`} />
                          <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                          <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#revGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Card>

                    {/* Vehicle mix donut */}
                    <Card className="p-5">
                      <h3 className="font-bold text-foreground mb-1">Vehicle Mix</h3>
                      <p className="text-xs text-muted-foreground mb-4">Today's bookings</p>
                      <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                          <Pie data={VEHICLE_MIX} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                            {VEHICLE_MIX.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                          </Pie>
                          <Tooltip formatter={(v: number) => [`${v}%`, '']} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-1.5 mt-2">
                        {VEHICLE_MIX.map(v => (
                          <div key={v.name} className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: v.color }} />{v.name}</span>
                            <span className="font-semibold">{v.value}%</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>

                  {/* Occupancy bar chart */}
                  <Card className="p-5">
                    <h3 className="font-bold text-foreground mb-1">Occupancy by Lot</h3>
                    <p className="text-xs text-muted-foreground mb-4">Current status</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={OCCUPANCY_BY_LOT} barCategoryGap="30%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} />
                        <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Bar dataKey="occupied"  name="Occupied"  fill="#ef4444" radius={[4,4,0,0]} />
                        <Bar dataKey="reserved"  name="Reserved"  fill="#f97316" radius={[4,4,0,0]} />
                        <Bar dataKey="available" name="Available" fill="#22c55e" radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>

                  {/* Recent reservations */}
                  <Card className="overflow-hidden">
                    <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                      <h3 className="font-bold text-foreground">Recent Reservations</h3>
                      <button onClick={() => setTab('reservations')} className="text-xs text-primary hover:underline">View all</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border bg-muted/30 text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                            <th className="px-5 py-3 text-left">Booking ID</th>
                            <th className="px-5 py-3 text-left">Lot</th>
                            <th className="px-5 py-3 text-left">Vehicle</th>
                            <th className="px-5 py-3 text-left">Amount</th>
                            <th className="px-5 py-3 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {MOCK_RESERVATIONS.slice(0, 5).map(r => (
                            <tr key={r.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                              <td className="px-5 py-3 font-mono font-semibold text-foreground">#{r.id}</td>
                              <td className="px-5 py-3 text-muted-foreground max-w-[180px] truncate">{r.lot}</td>
                              <td className="px-5 py-3">{r.vehicle}</td>
                              <td className="px-5 py-3 font-semibold text-foreground">₹{r.total.toFixed(2)}</td>
                              <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* ━━━━━━━━━━━━ LOTS TAB ━━━━━━━━━━━━ */}
              {tab === 'lots' && (
                <motion.div key="lots" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  {/* Summary row */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-card border border-border rounded-xl px-4 py-3">
                      <p className="text-xs text-muted-foreground">Total Lots</p>
                      <p className="text-2xl font-black text-foreground">{MOCK_LOTS.length}</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl px-4 py-3">
                      <p className="text-xs text-muted-foreground">Total Spaces</p>
                      <p className="text-2xl font-black text-foreground">{totalSpaces}</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl px-4 py-3">
                      <p className="text-xs text-muted-foreground">Avg Occupancy</p>
                      <p className="text-2xl font-black text-foreground">{avgOccupancy}%</p>
                    </div>
                  </div>

                  {/* Lots cards */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {filteredLots.map((lot, i) => {
                      const occ = Math.round(((lot.occupied_spaces + lot.reserved_spaces) / lot.total_spaces) * 100)
                      const barColor = occ >= 90 ? 'bg-red-500' : occ >= 65 ? 'bg-amber-500' : 'bg-emerald-500'
                      const revenue = lot.hourly_rate * lot.occupied_spaces * 2.5
                      return (
                        <motion.div key={lot.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                          <Card className="p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <div>
                                <h3 className="font-bold text-foreground">{lot.name}</h3>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{lot.address}, {lot.city}</p>
                              </div>
                              <StatusBadge status={lot.parking_type} />
                            </div>

                            {/* Occupancy bar */}
                            <div className="mb-3">
                              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>Occupancy</span>
                                <span className="font-semibold text-foreground">{lot.available_spaces} free / {lot.total_spaces} total</span>
                              </div>
                              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                                <motion.div className={`h-full rounded-full ${barColor}`} initial={{ width: 0 }} animate={{ width: `${occ}%` }} transition={{ duration: 0.8, delay: i * 0.05 + 0.2 }} />
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-1">{occ}% occupied</p>
                            </div>

                            {/* Stats row */}
                            <div className="grid grid-cols-3 gap-2 text-center mb-3">
                              <div className="bg-red-50 rounded-lg py-1.5">
                                <p className="text-sm font-bold text-red-600">{lot.occupied_spaces}</p>
                                <p className="text-[10px] text-red-400">Occupied</p>
                              </div>
                              <div className="bg-amber-50 rounded-lg py-1.5">
                                <p className="text-sm font-bold text-amber-600">{lot.reserved_spaces}</p>
                                <p className="text-[10px] text-amber-400">Reserved</p>
                              </div>
                              <div className="bg-green-50 rounded-lg py-1.5">
                                <p className="text-sm font-bold text-green-600">{lot.available_spaces}</p>
                                <p className="text-[10px] text-green-400">Available</p>
                              </div>
                            </div>

                            {/* Amenities */}
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {lot.has_ev_charging    && <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full flex items-center gap-1"><Zap className="w-2.5 h-2.5" />EV</span>}
                              {lot.has_covered_spaces && <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-full flex items-center gap-1"><Shield className="w-2.5 h-2.5" />Covered</span>}
                              {lot.is_handicap_accessible && <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded-full flex items-center gap-1"><Accessibility className="w-2.5 h-2.5" />Accessible</span>}
                              {lot.is_open_24_7       && <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full flex items-center gap-1"><Clock className="w-2.5 h-2.5" />24/7</span>}
                            </div>

                            {/* Rates + Est. Revenue */}
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">₹{lot.hourly_rate}/hr · ₹{lot.daily_rate}/day</span>
                              <span className="font-semibold text-primary">Est. ₹{revenue.toFixed(0)} today</span>
                            </div>
                          </Card>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* ━━━━━━━━━━━━ RESERVATIONS TAB ━━━━━━━━━━━━ */}
              {tab === 'reservations' && (
                <motion.div key="reservations" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  {/* Filters */}
                  <div className="flex flex-wrap gap-2">
                    {['all', 'active', 'completed', 'cancelled'].map(s => (
                      <button key={s} onClick={() => setStatus(s)}
                        className={`px-3 py-1.5 rounded-full border text-xs font-semibold capitalize transition-all ${statusFilter === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}>
                        {s === 'all' ? `All (${MOCK_RESERVATIONS.length})` : `${s} (${MOCK_RESERVATIONS.filter(r => r.status === s).length})`}
                      </button>
                    ))}
                  </div>

                  {/* Summary row */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                      <p className="text-xs text-emerald-600 font-medium">Active Now</p>
                      <p className="text-2xl font-black text-emerald-700">{MOCK_RESERVATIONS.filter(r => r.status === 'active').length}</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                      <p className="text-xs text-blue-600 font-medium">Completed</p>
                      <p className="text-2xl font-black text-blue-700">{MOCK_RESERVATIONS.filter(r => r.status === 'completed').length}</p>
                    </div>
                    <div className="bg-card border border-border rounded-xl px-4 py-3">
                      <p className="text-xs text-muted-foreground">Today's Revenue</p>
                      <p className="text-2xl font-black text-foreground">₹{totalRevToday.toFixed(0)}</p>
                    </div>
                  </div>

                  {/* Table */}
                  <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border bg-muted/30 text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                            <th className="px-5 py-3 text-left">Booking ID</th>
                            <th className="px-5 py-3 text-left">Parking Lot</th>
                            <th className="px-5 py-3 text-left">Space</th>
                            <th className="px-5 py-3 text-left">Vehicle</th>
                            <th className="px-5 py-3 text-left">Plate</th>
                            <th className="px-5 py-3 text-left">Duration</th>
                            <th className="px-5 py-3 text-left">Check-in</th>
                            <th className="px-5 py-3 text-right">Amount</th>
                            <th className="px-5 py-3 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredReservations.map((r, i) => (
                            <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                              className="border-b border-border hover:bg-muted/30 transition-colors">
                              <td className="px-5 py-3.5 font-mono font-bold text-foreground text-xs">#{r.id}</td>
                              <td className="px-5 py-3.5 text-muted-foreground max-w-[160px]">
                                <p className="truncate text-xs">{r.lot}</p>
                              </td>
                              <td className="px-5 py-3.5 font-semibold text-foreground">{r.space}</td>
                              <td className="px-5 py-3.5">{r.vehicle}</td>
                              <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{r.plate}</td>
                              <td className="px-5 py-3.5 text-muted-foreground">{r.duration}</td>
                              <td className="px-5 py-3.5 text-muted-foreground text-xs">{new Date(r.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                              <td className="px-5 py-3.5 text-right font-bold text-foreground">₹{r.total.toFixed(2)}</td>
                              <td className="px-5 py-3.5"><StatusBadge status={r.status} /></td>
                            </motion.tr>
                          ))}
                          {filteredReservations.length === 0 && (
                            <tr><td colSpan={9} className="text-center py-12 text-muted-foreground">No reservations match your filters.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* ━━━━━━━━━━━━ ANALYTICS TAB ━━━━━━━━━━━━ */}
              {tab === 'analytics' && (
                <motion.div key="analytics" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">

                  {/* Revenue + bookings dual chart */}
                  <Card className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-foreground">Revenue & Bookings</h3>
                        <p className="text-xs text-muted-foreground">Last 14 days</p>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={REVENUE_TREND}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} />
                        <YAxis yAxisId="left" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/1000).toFixed(1)}k`} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Line yAxisId="left"  type="monotone" dataKey="revenue"  name="Revenue (₹)"  stroke="#3b82f6" strokeWidth={2.5} dot={false} />
                        <Line yAxisId="right" type="monotone" dataKey="bookings" name="Bookings"      stroke="#10b981" strokeWidth={2.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>

                  <div className="grid lg:grid-cols-2 gap-5">
                    {/* Hourly pattern */}
                    <Card className="p-5">
                      <h3 className="font-bold text-foreground mb-1">Hourly Booking Pattern</h3>
                      <p className="text-xs text-muted-foreground mb-4">Average over last 7 days</p>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={HOURLY_PATTERN}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="hour" tick={{ fontSize: 9 }} tickLine={false} interval={1} />
                          <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                          <Tooltip />
                          <Bar dataKey="bookings" name="Bookings" fill="#6366f1" radius={[4,4,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>

                    {/* Vehicle mix + occupancy % */}
                    <Card className="p-5">
                      <h3 className="font-bold text-foreground mb-1">Lot Performance</h3>
                      <p className="text-xs text-muted-foreground mb-4">Occupancy % by location</p>
                      <div className="space-y-3">
                        {OCCUPANCY_BY_LOT.sort((a, b) => b.pct - a.pct).map(l => (
                          <div key={l.name}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-foreground font-medium truncate max-w-[65%]">{l.name}</span>
                              <span className={`font-bold ${l.pct >= 90 ? 'text-red-600' : l.pct >= 65 ? 'text-amber-600' : 'text-emerald-600'}`}>{l.pct}%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <motion.div className={`h-full rounded-full ${l.pct >= 90 ? 'bg-red-500' : l.pct >= 65 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                initial={{ width: 0 }} animate={{ width: `${l.pct}%` }} transition={{ duration: 0.8 }} />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 pt-4 border-t border-border space-y-2">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Vehicle Mix Today</p>
                        {VEHICLE_MIX.map(v => (
                          <div key={v.name} className="flex items-center gap-2 text-xs">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: v.color }} />
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${v.value}%`, background: v.color }} />
                            </div>
                            <span className="text-muted-foreground w-24 text-right">{v.name} ({v.value}%)</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>

                  {/* Revenue by lot table */}
                  <Card className="overflow-hidden">
                    <div className="px-5 py-4 border-b border-border">
                      <h3 className="font-bold text-foreground">Revenue by Parking Lot</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border bg-muted/30 text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                            <th className="px-5 py-3 text-left">Lot</th>
                            <th className="px-5 py-3 text-left">City</th>
                            <th className="px-5 py-3 text-left">Type</th>
                            <th className="px-5 py-3 text-right">Rate</th>
                            <th className="px-5 py-3 text-right">Occupancy</th>
                            <th className="px-5 py-3 text-right">Est. Daily Rev.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {MOCK_LOTS.map((lot, i) => {
                            const occ  = Math.round(((lot.occupied_spaces + lot.reserved_spaces) / lot.total_spaces) * 100)
                            const rev  = lot.hourly_rate * lot.occupied_spaces * 2.5
                            return (
                              <tr key={lot.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                <td className="px-5 py-3 font-semibold text-foreground">{lot.name}</td>
                                <td className="px-5 py-3 text-muted-foreground">{lot.city}</td>
                                <td className="px-5 py-3"><StatusBadge status={lot.parking_type} /></td>
                                <td className="px-5 py-3 text-right text-foreground font-medium">₹{lot.hourly_rate}/hr</td>
                                <td className="px-5 py-3 text-right">
                                  <span className={`font-bold ${occ >= 90 ? 'text-red-600' : occ >= 65 ? 'text-amber-600' : 'text-emerald-600'}`}>{occ}%</span>
                                </td>
                                <td className="px-5 py-3 text-right font-bold text-primary">₹{rev.toFixed(0)}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}
