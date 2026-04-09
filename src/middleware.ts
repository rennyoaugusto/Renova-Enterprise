import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const protectedRoutes = [
  "/dashboard",
  "/validacoes",
  "/usuarios",
  "/configuracoes",
  "/metricas"
]

const authRoutes = ["/login", "/redefinir-senha", "/primeiro-acesso"]

/** Rotas onde usuário autenticado não deve ser mandado ao dashboard (ex.: recuperação de senha após o link do e-mail). */
const authRoutesAllowLoggedIn = ["/primeiro-acesso"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtectedRoute = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
  const isAuthRoute = authRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
  const isAuthRouteRedirectIfLoggedIn =
    isAuthRoute &&
    !authRoutesAllowLoggedIn.some((route) => pathname === route || pathname.startsWith(`${route}/`))

  let response = NextResponse.next({ request })

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(
          cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>
        ) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as never)
          )
        }
      }
    }
  )

  const {
    data: { user }
  } = await supabase.auth.getUser()

  const meta = user?.user_metadata as Record<string, unknown> | undefined
  const primeiroAcesso =
    Boolean(user) &&
    (meta?.primeiro_acesso === true || meta?.primeiro_acesso === "true")

  if (user && primeiroAcesso) {
    const allowPrimeiro = pathname === "/primeiro-acesso" || pathname.startsWith("/primeiro-acesso/")
    const allowApi = pathname.startsWith("/api/")
    if (!allowPrimeiro && !allowApi) {
      return NextResponse.redirect(new URL("/primeiro-acesso", request.url))
    }
  }

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isAuthRouteRedirectIfLoggedIn && user && !primeiroAcesso) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Evita passar middleware em assets do Next e arquivos estáticos (incl. .css em /_next/static),
     * o que em alguns ambientes reduz respostas inesperadas durante HMR.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|woff2?)$).*)"
  ]
}
