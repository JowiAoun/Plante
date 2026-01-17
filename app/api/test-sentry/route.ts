import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  // Explicitly capture an exception
  Sentry.captureException(new Error("Sentry API Route Manual Capture"));
  
  // Or force a crash (which Sentry also catches automatically)
  throw new Error("Sentry API Route Crash");

  return NextResponse.json({ success: false });
}
