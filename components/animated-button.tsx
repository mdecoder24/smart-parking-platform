'use client'

import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { ButtonHTMLAttributes } from 'react'

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive'
  size?: 'default' | 'sm' | 'lg'
  isLoading?: boolean
}

export function AnimatedButton({
  children,
  variant = 'default',
  size = 'default',
  isLoading = false,
  ...props
}: AnimatedButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Button
        variant={variant}
        size={size}
        disabled={isLoading || props.disabled}
        {...props}
        className={`relative overflow-hidden ${props.className}`}
      >
        {isLoading ? (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            ⚙️
          </motion.span>
        ) : (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.span>
        )}
      </Button>
    </motion.div>
  )
}
