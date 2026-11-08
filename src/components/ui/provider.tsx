"use client"

import { useState } from "react"
import createCache from "@emotion/cache"
import { CacheProvider } from "@emotion/react"
import { ChakraProvider } from "@chakra-ui/react"
import { useServerInsertedHTML } from "next/navigation"
import { system } from "@/theme"
import { Toaster } from "react-hot-toast"
import ScrollbarController from "@/components/ScrollbarController"

/**
 * Emotion registry for the App Router. Without it Emotion writes its `<style>`
 * tags inline next to the components that use them, so the server HTML and the
 * first client render disagree about the DOM (React hydration error #418 on
 * hard loads). Styles inserted during SSR are collected and flushed into the
 * document head through `useServerInsertedHTML` instead.
 */
function EmotionRegistry({ children }: { children: React.ReactNode }) {
  const [registry] = useState(() => {
    const cache = createCache({ key: "css" })
    cache.compat = true
    const prevInsert = cache.insert
    let inserted: { name: string; isGlobal: boolean }[] = []
    cache.insert = (...args: Parameters<typeof prevInsert>) => {
      const [selector, serialized] = args
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push({ name: serialized.name, isGlobal: !selector })
      }
      return prevInsert(...args)
    }
    const flush = () => {
      const names = inserted
      inserted = []
      return names
    }
    return { cache, flush }
  })

  useServerInsertedHTML(() => {
    const names = registry.flush()
    if (names.length === 0) return null
    const { cache } = registry
    let styles = ""
    let dataEmotionAttribute = cache.key
    const globals: { name: string; style: string }[] = []
    for (const { name, isGlobal } of names) {
      const style = cache.inserted[name]
      if (typeof style !== "string") continue
      if (isGlobal) {
        globals.push({ name, style })
      } else {
        styles += style
        dataEmotionAttribute += ` ${name}`
      }
    }
    return (
      <>
        {globals.map(({ name, style }) => (
          <style
            key={name}
            data-emotion={`${cache.key}-global ${name}`}
            dangerouslySetInnerHTML={{ __html: style }}
          />
        ))}
        {styles ? (
          <style data-emotion={dataEmotionAttribute} dangerouslySetInnerHTML={{ __html: styles }} />
        ) : null}
      </>
    )
  })

  return <CacheProvider value={registry.cache}>{children}</CacheProvider>
}

// Children are rendered directly. The previous `<AnimatePresence mode="wait">
// <div key={pathname}>` wrapper never produced real exit animations under the
// App Router (the exiting copy already rendered the next route), but it did
// remount every page about 340ms after each client navigation, doubling every
// data request and resetting layout state such as the admin sidebar.
export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <EmotionRegistry>
      <ChakraProvider value={system}>
        <ScrollbarController />
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: { fontSize: "14px" },
            success: { iconTheme: { primary: "#16a34a", secondary: "#fff" } },
            error: { duration: 5000, iconTheme: { primary: "#dc2626", secondary: "#fff" } },
          }}
        />
      </ChakraProvider>
    </EmotionRegistry>
  )
}
