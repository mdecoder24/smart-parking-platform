'use client'

import { useEffect, useRef } from 'react'
import type { ParkingLot } from '@/lib/types'

interface ParkingMapProps {
  lots: ParkingLot[]
  selectedLotId?: string
  onSelectLot?: (lotId: string) => void
}

export function ParkingMap({ lots, selectedLotId, onSelectLot }: ParkingMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    // Check if Google Maps API is available
    if (!window.google) {
      console.error('Google Maps API not loaded')
      return
    }

    if (!containerRef.current) return

    // Initialize map
    const centerLat = lots.length > 0 ? lots[0].latitude : 37.7749
    const centerLng = lots.length > 0 ? lots[0].longitude : -122.4194

    mapRef.current = new window.google.maps.Map(containerRef.current, {
      zoom: 13,
      center: { lat: centerLat, lng: centerLng },
      mapTypeControl: true,
      fullscreenControl: true,
      streetViewControl: false,
    })

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []

    // Add markers for each parking lot
    lots.forEach((lot) => {
      const marker = new window.google.maps.Marker({
        position: { lat: lot.latitude, lng: lot.longitude },
        map: mapRef.current,
        title: lot.name,
      })

      const occupancy = lot.total_spaces > 0
        ? ((lot.occupied_spaces + lot.reserved_spaces) / lot.total_spaces * 100).toFixed(0)
        : '0'

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-3 max-w-xs">
            <h3 class="font-bold text-sm">${lot.name}</h3>
            <p class="text-xs text-gray-600 mb-2">${lot.address}</p>
            <div class="grid grid-cols-2 gap-2 text-xs mb-2">
              <div>
                <p class="text-gray-500">Available</p>
                <p class="font-bold text-green-600">${lot.available_spaces}</p>
              </div>
              <div>
                <p class="text-gray-500">Occupancy</p>
                <p class="font-bold">${occupancy}%</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p class="text-gray-500">Hourly</p>
                <p class="font-bold">$${lot.hourly_rate.toFixed(2)}</p>
              </div>
              <div>
                <p class="text-gray-500">Daily</p>
                <p class="font-bold">$${lot.daily_rate.toFixed(2)}</p>
              </div>
            </div>
          </div>
        `,
      })

      marker.addListener('click', () => {
        // Close all info windows
        markersRef.current.forEach((m) => {
          if (m.infoWindow) m.infoWindow.close()
        })
        infoWindow.open(mapRef.current, marker)
        onSelectLot?.(lot.id)
      })

      marker.infoWindow = infoWindow

      // Highlight selected lot
      if (selectedLotId === lot.id) {
        marker.setIcon(
          new window.google.maps.MarkerImage(
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNCIgZmlsbD0iIzI1NjNlYiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+',
            new window.google.maps.Size(40, 40),
            new window.google.maps.Point(20, 20)
          )
        )
      }

      markersRef.current.push(marker)
    })
  }, [lots, selectedLotId, onSelectLot])

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-lg border border-border"
      style={{ minHeight: '500px' }}
    />
  )
}
