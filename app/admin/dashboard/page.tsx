'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MapPin, LogOut, Users, DollarSign, BarChart3, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { getParkingLots, getOccupancySummary, getRevenueSummary } from '@/lib/db-queries'
import { staggerContainer, staggerItem, slideInDown } from '@/lib/animations'
import type { ParkingLot, OccupancySummary, RevenueSummary } from '@/lib/types'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function AdminDashboard() {
  const router = useRouter()
  const [lots, setLots] = useState<ParkingLot[]>([])
  const [occupancy, setOccupancy] = useState<OccupancySummary[]>([])
  const [revenue, setRevenue] = useState<RevenueSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check authentication
    const userId = localStorage.getItem('user_id')
    if (!userId) {
      router.push('/admin/login')
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        const [lotsData, occupancyData] = await Promise.all([
          getParkingLots(),
          getOccupancySummary(),
        ])

        setLots(lotsData)
        setOccupancy(occupancyData)

        // Fetch revenue for first lot
        if (lotsData.length > 0) {
          const revenueData = await getRevenueSummary(lotsData[0].id, 30)
          setRevenue(revenueData)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_id')
    router.push('/admin/login')
  }

  const totalRevenue = revenue.reduce((sum, item) => sum + (item.total_revenue || 0), 0)
  const totalReservations = revenue.reduce((sum, item) => sum + (item.reservation_count || 0), 0)
  const totalSpaces = lots.reduce((sum, lot) => sum + lot.total_spaces, 0)
  const totalOccupied = lots.reduce((sum, lot) => sum + lot.occupied_spaces, 0)
  const avgOccupancy = totalSpaces > 0 ? ((totalOccupied / totalSpaces) * 100).toFixed(1) : '0'

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <motion.div 
        className="border-b border-border bg-card sticky top-0 z-10"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <MapPin className="w-6 h-6" />
            <span className="text-xl font-bold">ParkSmart Admin</span>
          </Link>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-6">
          <Link
            href="/admin/dashboard"
            className="py-4 px-1 border-b-2 border-primary text-foreground font-medium text-sm"
          >
            Overview
          </Link>
          <Link
            href="/admin/lots"
            className="py-4 px-1 border-b-2 border-transparent text-muted-foreground hover:text-foreground font-medium text-sm"
          >
            Parking Lots
          </Link>
          <Link
            href="/admin/reservations"
            className="py-4 px-1 border-b-2 border-transparent text-muted-foreground hover:text-foreground font-medium text-sm"
          >
            Reservations
          </Link>
          <Link
            href="/admin/analytics"
            className="py-4 px-1 border-b-2 border-transparent text-muted-foreground hover:text-foreground font-medium text-sm"
          >
            Analytics
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  ${totalRevenue.toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reservations</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {totalReservations}
                </p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spaces</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {totalSpaces}
                </p>
              </div>
              <MapPin className="w-8 h-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Occupancy</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {avgOccupancy}%
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Revenue Trend</h3>
            {revenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total_revenue"
                    stroke="#2563eb"
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No revenue data available
              </p>
            )}
          </Card>

          {/* Occupancy Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Lot Occupancy</h3>
            {occupancy.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={occupancy}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" width={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="occupied_count" fill="#ef4444" name="Occupied" />
                  <Bar dataKey="available_count" fill="#22c55e" name="Available" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No occupancy data available
              </p>
            )}
          </Card>
        </div>

        {/* Parking Lots Table */}
        <Card className="mt-8 overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Parking Lots</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Location</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Total Spaces</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Available</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Occupancy</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {lots.map((lot) => {
                  const occupancyPercent = lot.total_spaces > 0
                    ? ((lot.occupied_spaces + lot.reserved_spaces) / lot.total_spaces * 100).toFixed(0)
                    : '0'

                  return (
                    <tr key={lot.id} className="border-b border-border hover:bg-muted/50">
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{lot.name}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {lot.city}, {lot.state}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">{lot.total_spaces}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{lot.available_spaces}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{occupancyPercent}%</td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/admin/lots/${lot.id}`}>
                          <Button variant="outline" size="sm">
                            Manage
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </main>
  )
}
