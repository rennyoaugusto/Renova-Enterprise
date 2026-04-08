import { redirect } from "next/navigation"

import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { getCurrentUserWithRole } from "@/lib/auth"

type SistemaLayoutProps = Readonly<{
  children: React.ReactNode
}>

export default async function SistemaLayout({ children }: SistemaLayoutProps) {
  const { user, role, profile } = await getCurrentUserWithRole()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[hsl(var(--background))]">
      <Sidebar
        role={role}
        userName={profile?.nome ?? user.email ?? "Usuário"}
        userEmail={profile?.email ?? user.email ?? ""}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
