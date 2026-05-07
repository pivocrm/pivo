import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/cadastro", "/mk"];
const AUTH_ROUTES = ["/login", "/cadastro"];

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

const isRealSupabase =
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("seu-projeto") &&
  !SUPABASE_URL.includes("placeholder") &&
  SUPABASE_ANON_KEY.length > 20 &&
  !SUPABASE_ANON_KEY.includes("placeholder");

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!isRealSupabase) {
    if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r)) || pathname === "/") {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }: { name: string; value: string }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options: CookieOptions }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
      if (user && AUTH_ROUTES.includes(pathname)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return supabaseResponse;
    }

    if (pathname === "/") return supabaseResponse;

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return supabaseResponse;
  } catch {
    if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r)) || pathname === "/") {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
