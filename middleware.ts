import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Protect /admin routes
    if (path.startsWith("/admin")) {
        // allow access to login page
        if (path === "/admin/login") {
            // if already logged in, redirect to dashboard
            const session = request.cookies.get("admin_session");
            if (session) {
                return NextResponse.redirect(new URL("/admin", request.url));
            }
            return NextResponse.next();
        }

        // Check for session cookie
        const session = request.cookies.get("admin_session");
        if (!session) {
            return NextResponse.redirect(new URL("/admin/login", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/admin/:path*",
};
