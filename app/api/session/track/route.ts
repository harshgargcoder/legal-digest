import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAdminAuth } from "@/lib/firebase-admin";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase environment variables are not configured.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

function getBearerToken(req: Request) {
  const header = req.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length);
}

function parseClientIp(req: Request) {
  const candidates = [
    req.headers.get("x-forwarded-for"),
    req.headers.get("x-real-ip"),
    req.headers.get("cf-connecting-ip"),
    req.headers.get("true-client-ip"),
  ];

  const first = candidates
    .find(Boolean)
    ?.split(",")[0]
    .trim()
    .replace(/^::ffff:/, "");

  if (!first) return null;
  return first;
}

function isPrivateOrLocalIp(ipAddress: string) {
  const ip = ipAddress.toLowerCase();
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip) ||
    ip.startsWith("::ffff:127.")
  );
}

async function fetchIpGeo(ipAddress: string) {
  if (isPrivateOrLocalIp(ipAddress)) {
    return {
      city: "Local",
      region: "Private Network",
      country: "Local",
      countryCode: "LO",
      isp: null as string | null,
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ipAddress)}`, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeout);
    if (!res.ok) return null;

    const data = (await res.json()) as {
      success?: boolean;
      city?: string;
      region?: string;
      country?: string;
      country_code?: string;
      connection?: { isp?: string };
    };

    if (!data.success) return null;
    return {
      city: data.city ?? null,
      region: data.region ?? null,
      country: data.country ?? null,
      countryCode: data.country_code ?? null,
      isp: data.connection?.isp ?? null,
    };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return NextResponse.json({ error: "Missing authorization token" }, { status: 401 });
    }

    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(token);
    const ipAddress = parseClientIp(req);
    const userAgent = req.headers.get("user-agent") ?? null;

    if (!ipAddress) {
      return NextResponse.json({ tracked: false, reason: "No client IP in headers" });
    }

    const geo = await fetchIpGeo(ipAddress);

    // Prefer rich insert (with geolocation); fallback to legacy schema.
    let { error } = await supabase.from("user_ip_logs").insert([
      {
        user_id: decoded.uid,
        ip_address: ipAddress,
        user_agent: userAgent,
        city: geo?.city ?? null,
        region: geo?.region ?? null,
        country: geo?.country ?? null,
        country_code: geo?.countryCode ?? null,
        isp: geo?.isp ?? null,
      },
    ]);

    if (error) {
      const fallback = await supabase.from("user_ip_logs").insert([
        {
          user_id: decoded.uid,
          ip_address: ipAddress,
          user_agent: userAgent,
        },
      ]);
      error = fallback.error;
    }

    if (error) {
      return NextResponse.json(
        { tracked: false, reason: "IP table missing or unavailable", detail: error.message },
        { status: 200 },
      );
    }

    return NextResponse.json({ tracked: true, ipAddress });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ tracked: false, error: message }, { status: 500 });
  }
}
