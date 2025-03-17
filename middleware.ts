// middleware.ts (root directory)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const { pathname } = request.nextUrl;
  
  // Define paths that are accessible without authentication
  const authRoutes = ['/auth/signin', '/auth/signup'];
  const publicPaths = [
    '/api/auth',
    '/_next',
    '/favicon.ico',
    '/images'
  ];
  
  // Check if the current path is in the public paths
  const isPublicPath = [...authRoutes, ...publicPaths].some(
    (path) => pathname.startsWith(path)
  );
  
  // Get the token if it exists
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  // If the path is one of the auth routes and the user is already authenticated
  // redirect them to the dashboard
  if (authRoutes.includes(pathname) && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // If the path is not a public path and the user is not authenticated
  // redirect them to the signin page
  if (!isPublicPath && !token) {
    // Store the original URL to redirect after login
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(
      new URL(`/auth/signin?callbackUrl=${callbackUrl}`, request.url)
    );
  }
  
  // If none of the conditions above are met, proceed with the request
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image).*)', '/'],
};