import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;

  // Decode JWT directly — no Prisma needed, Edge-compatible
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const isLoggedIn = !!token;
  const role = token?.role as string | undefined;

  const isAuthRoute = ["/login", "/register"].some((p) =>
    nextUrl.pathname.startsWith(p)
  );
  const isClientRoute = nextUrl.pathname.startsWith("/client");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");

  // Utente non loggato → redirect a /login (tranne sulle pagine pubbliche)
  if (!isLoggedIn && (isClientRoute || isAdminRoute)) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Utente loggato che cerca di accedere a /login o /register
  if (isLoggedIn && isAuthRoute) {
    const dest = role === "ADMIN" ? "/admin" : "/client/dashboard";
    return NextResponse.redirect(new URL(dest, nextUrl));
  }

  // CLIENT che tenta di accedere all'admin → blocca
  if (isAdminRoute && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/client/dashboard", nextUrl));
  }

  // ADMIN che tenta di accedere all'area cliente → reindirizza
  if (isClientRoute && role !== "CLIENT") {
    return NextResponse.redirect(new URL("/admin", nextUrl));
  }

  // Root → smista in base al ruolo
  if (nextUrl.pathname === "/") {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", nextUrl));
    const dest = role === "ADMIN" ? "/admin" : "/client/dashboard";
    return NextResponse.redirect(new URL(dest, nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
