import { createSystem, defaultConfig, defineConfig, defineTextStyles } from '@chakra-ui/react'
import { nativeSelectAnatomy, selectAnatomy } from '@chakra-ui/react/anatomy'
import { colors } from './colors'

/**
 * Typography scale shared by every page. Use `textStyle="pageTitle"` etc.
 * instead of ad-hoc fontFamily/fontSize/fontWeight combinations so headings line
 * up across the site. Sizes are fluid (clamp) so no breakpoint props are needed.
 * Weights stay at 400–600; tracking never tighter than -0.025em.
 */
const textStyles = defineTextStyles({
  // Public site (Experience mode): Fraunces display + Space Grotesk text.
  heroTitle: {
    value: {
      fontFamily: 'serif',
      fontWeight: '600',
      fontSize: 'clamp(3rem, 2rem + 4vw, 4.5rem)',
      lineHeight: '1.04',
      letterSpacing: '-0.025em',
    },
  },
  pageTitle: {
    value: {
      fontFamily: 'serif',
      fontWeight: '600',
      fontSize: 'clamp(2.25rem, 1.5rem + 3vw, 3.75rem)',
      lineHeight: '1.08',
      letterSpacing: '-0.025em',
    },
  },
  detailTitle: {
    value: {
      fontFamily: 'serif',
      fontWeight: '600',
      fontSize: 'clamp(2rem, 1.4rem + 2.4vw, 3rem)',
      lineHeight: '1.12',
      letterSpacing: '-0.02em',
    },
  },
  sectionTitle: {
    value: {
      fontFamily: 'serif',
      fontWeight: '600',
      fontSize: 'clamp(1.75rem, 1.3rem + 1.6vw, 2.5rem)',
      lineHeight: '1.15',
      letterSpacing: '-0.02em',
    },
  },
  cardTitle: {
    value: {
      fontFamily: 'body',
      fontWeight: '600',
      fontSize: 'clamp(1.125rem, 1rem + 0.4vw, 1.25rem)',
      lineHeight: '1.3',
      letterSpacing: '0',
    },
  },
  lead: {
    value: {
      fontFamily: 'body',
      fontWeight: '400',
      fontSize: 'clamp(1.0625rem, 1rem + 0.25vw, 1.1875rem)',
      lineHeight: '1.65',
    },
  },
  body: {
    value: { fontFamily: 'body', fontWeight: '400', fontSize: '1rem', lineHeight: '1.65' },
  },
  meta: {
    value: {
      fontFamily: 'body',
      fontWeight: '400',
      fontSize: '0.875rem',
      lineHeight: '1.5',
      fontVariantNumeric: 'tabular-nums',
    },
  },
  label: {
    value: { fontFamily: 'body', fontWeight: '500', fontSize: '0.875rem', lineHeight: '1.4' },
  },
  // Admin (Operate mode): one sans family, quieter scale.
  adminTitle: {
    value: { fontFamily: 'body', fontWeight: '600', fontSize: '1.5rem', lineHeight: '1.25', letterSpacing: '-0.01em' },
  },
  adminSection: {
    value: { fontFamily: 'body', fontWeight: '600', fontSize: '1.125rem', lineHeight: '1.35' },
  },
})

// Form controls: visible 3:1 border, darker on hover, brand-blue focus ring.
const controlOutline = {
  borderColor: 'border.control',
  _hover: { borderColor: 'border.controlHover' },
}

const customConfig = defineConfig({
  theme: {
    textStyles,
    recipes: {
      input: {
        base: { '--focus-color': 'colors.primary.500' },
        variants: { variant: { outline: controlOutline } },
      },
      textarea: {
        base: { '--focus-color': 'colors.primary.500' },
        variants: { variant: { outline: controlOutline } },
      },
    },
    slotRecipes: {
      nativeSelect: {
        slots: nativeSelectAnatomy.keys(),
        base: { field: { '--focus-color': 'colors.primary.500' } },
        variants: { variant: { outline: { field: controlOutline } } },
      },
      select: {
        slots: selectAnatomy.keys(),
        base: { trigger: { '--focus-color': 'colors.primary.500' } },
        variants: { variant: { outline: { trigger: controlOutline } } },
      },
    },
    tokens: {
      // One corner radius for the whole site: every named radius resolves to
      // 6px, so cards, buttons, inputs, images, badges and dialogs all match.
      // Only `full` stays a true circle, for small status dots, spinners and
      // radio/switch internals that must be round to read correctly.
      radii: {
        none: { value: '0' },
        '2xs': { value: '6px' },
        xs: { value: '6px' },
        sm: { value: '6px' },
        md: { value: '6px' },
        lg: { value: '6px' },
        xl: { value: '6px' },
        '2xl': { value: '6px' },
        '3xl': { value: '6px' },
        '4xl': { value: '6px' },
        full: { value: '9999px' },
      },
      // Faces are registered by next/font in app/layout.tsx; reference them via
      // their CSS variables so the token always matches the loaded font.
      fonts: {
        heading: { value: 'var(--font-space-grotesk), system-ui, sans-serif' },
        body: { value: 'var(--font-space-grotesk), system-ui, sans-serif' },
        display: { value: 'var(--font-space-grotesk), system-ui, sans-serif' },
        serif: { value: 'var(--font-fraunces), Georgia, serif' },
        mono: { value: 'var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, monospace' },
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
        },
        surface: {
          light: { value: colors.surface.light },
        },
      },
    },
    semanticTokens: {
      radii: {
        l1: { value: '6px' },
        l2: { value: '6px' },
        l3: { value: '6px' },
      },
      colors: {
        background: {
          DEFAULT: { value: colors.background.light },
        },
        surface: {
          DEFAULT: { value: colors.surface.light },
        },
        text: {
          DEFAULT: { value: colors.text.light.primary },
          primary: { value: colors.text.light.primary },
          secondary: { value: colors.text.light.secondary },
          muted: { value: colors.text.light.muted },
        },
        border: {
          DEFAULT: { value: colors.border.light },
          // Form controls need a visible boundary: >=3:1 against white and
          // #f6f7f8 (WCAG 1.4.11). The hairline above is for cards/dividers.
          control: { value: '#848e9b' },
          controlHover: { value: '#6b7684' },
          // Chakra's checkbox/radio controls use border.emphasized.
          emphasized: { value: '#848e9b' },
        },
        glass: {
          bg: { value: colors.glass.light.background },
          border: { value: colors.glass.light.border },
        },
        accent: {
          DEFAULT: { value: colors.primary[500] },
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, customConfig)

export type System = typeof system
