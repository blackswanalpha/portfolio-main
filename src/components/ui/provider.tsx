"use client"

import { ChakraProvider } from "@chakra-ui/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"
import { system } from "@/theme"
import { AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"

export function Provider(props: ColorModeProviderProps) {
  const pathname = usePathname()

  return (
    <ColorModeProvider {...props}>
      <ChakraProvider value={system}>
        <AnimatePresence mode="wait">
          <div key={pathname}>
            {props.children}
          </div>
        </AnimatePresence>
      </ChakraProvider>
    </ColorModeProvider>
  )
}
