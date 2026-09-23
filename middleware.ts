import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - r/ (public NFC/QR redirects - must remain instant & public)
     * - api/ (API routes handled individually)
     * - public asset files (e.g. .svg, .png, .jpg)
     */
    "/((?!_next/static|_next/image|favicon.ico|r/|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
