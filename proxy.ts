import { NextResponse } from "next/server"

import { auth } from "@/auth"

export default auth((req) => {
  const pathname = req.nextUrl.pathname
  const user = req.auth?.user

  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (pathname.startsWith("/dashboard/products") && user.role !== "SELLER") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  if (pathname.startsWith("/admin") && user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  if (pathname.startsWith("/seller") && user.role !== "SELLER") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/seller/:path*"],
}
