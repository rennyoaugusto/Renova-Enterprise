import { createClient } from "@/lib/supabase/server"
import type { UserRole } from "@/types/usuario"

export async function getCurrentUserWithRole() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, role: null as UserRole | null, profile: null as { nome: string; email: string } | null }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome,email,papel")
    .eq("id", user.id)
    .maybeSingle()

  return {
    user,
    role: (profile?.papel ?? null) as UserRole | null,
    profile: profile ? { nome: profile.nome, email: profile.email } : null
  }
}
