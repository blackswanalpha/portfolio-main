'use client'

import { Box, type BoxProps } from '@chakra-ui/react'
import { forwardRef } from 'react'

export interface GlassPanelProps extends BoxProps {
  /** @deprecated Ignored. The panel is a solid surface; decorative blur was removed. */
  blur?: string
}

/** A raised surface: solid background, hairline border, small neutral shadow. */
export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ blur, children, ...props }, ref) => {
    // Pulled out so it never reaches Box, where `blur` is a CSS filter prop.
    void blur
    return (
      <Box
        ref={ref}
        bg="surface"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="border"
        boxShadow="0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 12px -6px rgba(15, 23, 42, 0.08)"
        {...props}
      >
        {children}
      </Box>
    )
  }
)

GlassPanel.displayName = 'GlassPanel'
