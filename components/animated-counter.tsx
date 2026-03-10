'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface AnimatedCounterProps {
  value: number | string
  duration?: number
  decimals?: number
  className?: string
  prefix?: string
  suffix?: string
}

export function AnimatedCounter({
  value,
  duration = 2,
  decimals = 0,
  className,
  prefix = '',
  suffix = ''
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState('0')
  const numValue = typeof value === 'string' ? parseFloat(value) : value

  useEffect(() => {
    if (isNaN(numValue)) {
      setDisplayValue(String(value))
      return
    }

    let startValue = 0
    const startTime = Date.now()

    const updateCounter = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / (duration * 1000), 1)
      const current = Math.floor(startValue + (numValue - startValue) * progress)
      
      setDisplayValue(
        prefix + current.toFixed(decimals) + suffix
      )

      if (progress < 1) {
        requestAnimationFrame(updateCounter)
      }
    }

    updateCounter()
  }, [numValue, duration, decimals, prefix, suffix])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      {displayValue}
    </motion.div>
  )
}
