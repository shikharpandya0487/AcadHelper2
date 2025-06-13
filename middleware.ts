import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const token = await getToken({
    req: req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const publicPaths = path ==="/home";

  if (publicPaths && token) {
    return NextResponse.redirect(new URL("/Dashboard", req.nextUrl));
  }
  if (!publicPaths && !token) {
    return NextResponse.redirect(new URL("/home", req.nextUrl));
  }
}

export const config = {
  matcher: ["/", "/signup", "/home","/Dashboard,/admin/Courses,/Schedule,/Leaderboard,/Focus,/Notification"],
};