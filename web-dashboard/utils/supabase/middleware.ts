import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session — this keeps the user logged in
  const { data: { user } } = await supabase.auth.getUser();

  // Public routes — no auth required
  const isPublicPage = request.nextUrl.pathname === "/" || request.nextUrl.pathname === "/pricing" || request.nextUrl.pathname === "/docs";
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");
  const isMcpRoute = request.nextUrl.pathname.startsWith("/mcp");
  const isJoinRoute = request.nextUrl.pathname.startsWith("/join");

  // Redirect unauthenticated users to login (only for protected routes)
  // Skip MCP (uses Bearer token auth) and join routes (public invite acceptance)
  if (!user && !isAuthPage && !isApiRoute && !isPublicPage && !isMcpRoute && !isJoinRoute) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages (except cli-login)
  const isCliLogin = request.nextUrl.pathname === "/auth/cli-login";
  if (user && isAuthPage && !isCliLogin) {
    return NextResponse.redirect(new URL("/org/new", request.url));
  }

  return supabaseResponse;
};
