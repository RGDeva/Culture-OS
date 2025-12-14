'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes'

type Theme = 'dark' | 'light' | 'system'

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
  [key: string]: any
}

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  enableSystem = false,
  disableTransitionOnChange = true,
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
      themes={['light', 'dark']}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

export function useTheme() {
  const context = useNextTheme()
  
  // Add a null check to handle the case where the context is not available
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  const { theme, setTheme, resolvedTheme, themes = ['light', 'dark'] } = context

  const toggleTheme = React.useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }, [resolvedTheme, setTheme])

  return {
    theme,
    setTheme,
    resolvedTheme,
    toggleTheme,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
    themes,
  }
}
