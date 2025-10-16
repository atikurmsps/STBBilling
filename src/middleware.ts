import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = new URL(req.url);

  // Public routes
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect inactive users to inactive page
  if (token.role === "INACTIVE" && pathname !== "/inactive") {
    const inactiveUrl = new URL("/inactive", req.url);
    return NextResponse.redirect(inactiveUrl);
  }

  // Redirect non-inactive users away from inactive page
  if (pathname === "/inactive" && token.role !== "INACTIVE") {
    const homeUrl = new URL("/", req.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/(.*)"],
};


