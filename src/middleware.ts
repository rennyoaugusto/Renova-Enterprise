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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtectedRoute = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
  const isAuthRoute = authRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

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

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
}
