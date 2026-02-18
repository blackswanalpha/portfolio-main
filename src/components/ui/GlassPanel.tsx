'use client'

import { Box, type BoxProps } from '@chakra-ui/react'
import { forwardRef } from 'react'

export interface GlassPanelProps extends BoxProps {
  blur?: string
  opacity?: number
}

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ blur = '16px', opacity = 0.7, children, ...props }, ref) => {
    return (
      <Box
        ref={ref}
        bg="glass.bg"
        backdropFilter={`blur(${blur})`}
        borderRadius="xl"
        border="1px solid"
        borderColor="glass.border"
        boxShadow="lg"
        {...props}
      >
        {children}
      </Box>
    )
  }
)

GlassPanel.displayName = 'GlassPanel'