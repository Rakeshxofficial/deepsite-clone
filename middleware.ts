import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import MY_TOKEN_KEY from "./lib/get-cookie-name";

export function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set("x-current-host", request.nextUrl.host);
  
  // Get the pathname
  const pathname = request.nextUrl.pathname;
  
  // Check if user has auth token
  const token = request.cookies.get(MY_TOKEN_KEY())?.value;
  
  // Allow access to auth pages and API routes without authentication
  if (pathname.startsWith('/auth') || pathname.startsWith('/api')) {
    return NextResponse.next({ headers });
  }
  
  // If no token and trying to access protected routes, redirect to auth
  if (!token) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }
  
  return NextResponse.next({ headers });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.svg|arrow.svg|providers|background_noisy.webp|banner.png|success.mp3).*)"],
};
