import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'
import { colors } from './colors'

const customConfig = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: 'Space Grotesk, system-ui, sans-serif' },
        body: { value: 'Space Grotesk, system-ui, sans-serif' },
        display: { value: 'Space Grotesk, system-ui, sans-serif' },
        mono: { value: 'JetBrains Mono, monospace' },
      },
      fontWeights: {
        light: { value: '300' },
        normal: { value: '400' },
        medium: { value: '500' },
        semibold: { value: '600' },
        bold: { value: '700' },
        extrabold: { value: '800' },
      },
      colors: {
        primary: {
          50: { value: colors.primary[50] },
          100: { value: colors.primary[100] },
          200: { value: colors.primary[200] },
          300: { value: colors.primary[300] },
          400: { value: colors.primary[400] },
          500: { value: colors.primary[500] },
          600: { value: colors.primary[600] },
          700: { value: colors.primary[700] },
          800: { value: colors.primary[800] },
          900: { value: colors.primary[900] },
        },
        bg: {
          light: { value: colors.background.light },
          dark: { value: colors.background.dark },
        },
        surface: {
          light: { value: colors.surface.light },
          dark: { value: colors.surface.dark },
        },
      },
    },
    semanticTokens: {
      colors: {
        background: {
          DEFAULT: {
            value: { _light: colors.background.light, _dark: colors.background.dark },
          },
        },
        surface: {
          DEFAULT: {
            value: { _light: colors.surface.light, _dark: colors.surface.dark },
          },
        },
        text: {
          DEFAULT: {
            value: { _light: colors.text.light.primary, _dark: colors.text.dark.primary },
          },
          primary: {
            value: { _light: colors.text.light.primary, _dark: colors.text.dark.primary },
          },
          secondary: {
            value: { _light: colors.text.light.secondary, _dark: colors.text.dark.secondary },
          },
          muted: {
            value: { _light: colors.text.light.muted, _dark: colors.text.dark.muted },
          },
        },
        border: {
          DEFAULT: {
            value: { _light: colors.border.light, _dark: colors.border.dark },
          },
        },
        glass: {
          bg: {
            value: { _light: colors.glass.light.background, _dark: colors.glass.dark.background },
          },
          border: {
            value: { _light: colors.glass.light.border, _dark: colors.glass.dark.border },
          },
        },
        accent: {
          DEFAULT: {
            value: { _light: colors.primary[500], _dark: colors.primary[400] },
          },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, customConfig)

export type System = typeof system
