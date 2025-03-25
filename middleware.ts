import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  })

  const { pathname } = request.nextUrl

  // Handle root path
  if (pathname === "/") {
    return token 
      ? NextResponse.redirect(new URL("/dashboard", request.url))
      : NextResponse.redirect(new URL("/login", request.url))
  }

  const isAuthRoute = pathname.startsWith("/login") || 
                     pathname.startsWith("/register")

  const isProtectedRoute = pathname.startsWith("/profile") ||
                         pathname.startsWith("/dashboard") ||
                         pathname.startsWith("/add-food") ||
                         pathname.startsWith("/history") ||
                         pathname.startsWith("/reports") ||
                         pathname.startsWith("/goals") ||
                         pathname.startsWith("/weekly-plan") ||
                         pathname.startsWith("/verify")

  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !token) {
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect to dashboard if already logged in and trying to access auth routes
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// See: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: [
    "/profile/:path*",
    "/dashboard/:path*",
    "/add-food/:path*",
    "/history/:path*",
    "/reports/:path*",
    "/goals/:path*",
    "/weekly-plan/:path*",
    "/verify/:path*",
  ],
}