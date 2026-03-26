import { NextResponse, NextRequest } from "next/server";

export function middleware(_req: NextRequest) {
  // Frontend does not manipulate auth cookies; backend sets httpOnly cookie.
  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
