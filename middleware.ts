import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextRequest, NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  // auth() attaches auth info to the request; the actual
  // authorization logic lives in authConfig.callbacks.authorized
}) as unknown as (req: NextRequest) => NextResponse;

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth (NextAuth routes)
     * - _next (all Next.js internals: static files, HMR, chunks, etc.)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - Static assets with file extensions (.css, .js, .png, .jpg, etc.)
     */
    "/((?!api/auth|_next|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\..*).*)",
  ],
};
