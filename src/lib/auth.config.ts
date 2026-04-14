import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" as const },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.status = user.status;
        token.companyId = user.companyId;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.status = token.status;
        session.user.companyId = token.companyId;
      }
      return session;
    },
    async authorized({ auth, request }: any) {
      const { nextUrl } = request;
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const isAuthRoute = ["/login", "/register"].some((p) => nextUrl.pathname.startsWith(p));
      const isClientRoute = nextUrl.pathname.startsWith("/client");
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      if (nextUrl.pathname === "/") {
        if (!isLoggedIn) return Response.redirect(new URL("/login", nextUrl));
        return Response.redirect(new URL(role === "ADMIN" ? "/admin" : "/client/dashboard", nextUrl));
      }
      if (!isLoggedIn && (isClientRoute || isAdminRoute)) return Response.redirect(new URL("/login", nextUrl));
      if (isLoggedIn && isAuthRoute) return Response.redirect(new URL(role === "ADMIN" ? "/admin" : "/client/dashboard", nextUrl));
      if (isAdminRoute && role !== "ADMIN") return Response.redirect(new URL("/client/dashboard", nextUrl));
      if (isClientRoute && role !== "CLIENT") return Response.redirect(new URL("/admin", nextUrl));
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
