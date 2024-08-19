import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // List of public routes that don't require authentication
  const publicRoutes = ['/', '/auth']

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname)

  // If the route is not public and there's no session, redirect to auth page
  if (!isPublicRoute && !session) {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}