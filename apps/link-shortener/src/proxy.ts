import { NextResponse, type NextRequest } from "next/server";

// Session cookie the auth service sets through /auth-api (the __Secure- name is used over HTTPS)
const SESSION_COOKIES = ["better-auth.session_token", "__Secure-better-auth.session_token"];

// Optimistic check before any page renders: no session cookie means straight to /login.
// The API still verifies the access token on every call, and the client re-checks the session.
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === "/login") return NextResponse.next();
  if (SESSION_COOKIES.some((name) => request.cookies.has(name))) return NextResponse.next();
  const login = new URL("/login", request.url);
  login.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(login);
}

export const config = {
  // Pages only: not the API, the auth proxy, short-link redirects or static assets
  matcher: ["/((?!api|auth-api|r/|_next/static|_next/image|favicon.ico).*)"],
};
