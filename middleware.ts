import { NextRequest, NextResponse } from "next/server";
import { rateLimiter } from "./lib/rate-limiter";

export async function middleware(req: NextRequest) {
  const ip = req.ip ?? "127.0.0.1";

  try {
    const { success } = await rateLimiter.limit(ip);

    if (!success) {
      return new NextResponse("You are prompting too fast.");
    }
  } catch (err) {
    return new NextResponse(
      "Sorry, something went wrong while processing your message. Please try again!"
    );
  }
}

export const config = {
  matcher: "/api/message/:path*",
};
