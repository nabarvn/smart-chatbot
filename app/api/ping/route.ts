import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // redis ping
  try {
    await redis.set("ping:timestamp", new Date().toISOString());

    return NextResponse.json(
      { status: "ok", services: { redis: "ok" } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Redis ping failed:", error);
    
    return NextResponse.json(
      { status: "error", services: { redis: "error" } },
      { status: 503 }
    );
  }
}
