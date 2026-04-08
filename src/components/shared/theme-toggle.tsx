"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/shared/theme-provider"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="premium-button-secondary"
      style={{ padding: "0.4375rem" }}
      aria-label="Alternar tema"
      title={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
    >
      {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  )
}
