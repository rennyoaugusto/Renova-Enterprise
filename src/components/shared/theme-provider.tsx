"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

type Theme = "light" | "dark" | "system"

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function applyTheme(theme: Theme) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
  const isDark = theme === "dark" || (theme === "system" && prefersDark)
  document.documentElement.classList.toggle("dark", isDark)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system")

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("pilar-theme") as Theme | null
    const preferredTheme = storedTheme ?? "system"

    setThemeState(preferredTheme)
    applyTheme(preferredTheme)
  }, [])

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const onSystemThemeChanged = () => {
      if (theme === "system") {
        applyTheme("system")
      }
    }

    media.addEventListener("change", onSystemThemeChanged)
    return () => media.removeEventListener("change", onSystemThemeChanged)
  }, [theme])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme: (nextTheme) => {
        setThemeState(nextTheme)
        window.localStorage.setItem("pilar-theme", nextTheme)
        applyTheme(nextTheme)
      },
      toggleTheme: () => {
        const nextTheme = theme === "dark" ? "light" : "dark"
        setThemeState(nextTheme)
        window.localStorage.setItem("pilar-theme", nextTheme)
        applyTheme(nextTheme)
      }
    }),
    [theme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }

  return context
}
