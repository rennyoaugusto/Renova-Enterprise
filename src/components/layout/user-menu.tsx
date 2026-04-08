"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

import { createClient } from "@/lib/supabase/client"

export function UserMenu() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleLogout() {
    setIsLoading(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/login")
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className="premium-button-secondary"
      style={{ padding: "0.4375rem 0.75rem", fontSize: "0.8125rem" }}
      title="Sair do sistema"
    >
      <LogOut size={14} />
      <span>{isLoading ? "Saindo..." : "Sair"}</span>
    </button>
  )
}
