import Link from "next/link"

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[50vh] w-full max-w-screen-sm flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted))]">404</p>
      <h1 className="text-xl font-semibold text-[hsl(var(--foreground))]">Página não encontrada</h1>
      <p className="text-sm text-[hsl(var(--muted))]">
        O endereço pode estar incorreto ou o conteúdo foi movido.
      </p>
      <Link href="/dashboard" className="premium-button">
        Ir para o início
      </Link>
    </main>
  )
}
