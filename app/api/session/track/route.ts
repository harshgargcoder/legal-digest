import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAdminAuth } from "@/lib/firebase-admin";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase environment variables are not configured.");
}

const supabase = createClient(supabaseUrl, supabaseKey);
type IpRiskLevel = "trusted" | "warning" | "critical" | "malicious";

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

  if (!first) {
    const host = req.headers.get("host")?.toLowerCase() ?? "";
    const isLocalHost =
      host.includes("localhost") ||
      host.startsWith("127.0.0.1") ||
      host.startsWith("[::1]");
    if (isLocalHost) {
      return "127.0.0.1";
    }
    return null;
  }
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

function getHardBlockedIps() {
  const fromEnv = `${process.env.MALICIOUS_IPS ?? ""},${process.env.BLOCKED_IPS ?? ""}`;
  return new Set(
    fromEnv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

async function assessIpRisk(params: {
  ipAddress: string;
  userId: string;
  userAgent: string | null;
}) {
  const { ipAddress, userId, userAgent } = params;
  const hardBlocked = getHardBlockedIps();
  if (hardBlocked.has(ipAddress)) {
    return {
      level: "malicious" as IpRiskLevel,
      reason: "Matched hard-blocked IP list (MALICIOUS_IPS/BLOCKED_IPS).",
    };
  }

  if (isPrivateOrLocalIp(ipAddress)) {
    return { level: "trusted" as IpRiskLevel, reason: "Local/private network IP." };
  }

  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const last10m = new Date(Date.now() - 10 * 60 * 1000).toISOString();

  const [sameIp24h, sameUserIp10m] = await Promise.all([
    supabase
      .from("user_ip_logs")
      .select("user_id")
      .eq("ip_address", ipAddress)
      .gte("seen_at", last24h)
      .limit(2000),
    supabase
      .from("user_ip_logs")
      .select("id", { count: "exact", head: true })
      .eq("ip_address", ipAddress)
      .eq("user_id", userId)
      .gte("seen_at", last10m),
  ]);

  const distinctUsers = new Set((sameIp24h.data ?? []).map((r) => r.user_id)).size;
  const rapidCount = sameUserIp10m.count ?? 0;
  const uaLooksBot =
    !userAgent ||
    userAgent.length < 12 ||
    /curl|wget|python|scrapy|httpclient|bot|crawler/i.test(userAgent);

  if (distinctUsers >= 8 || rapidCount >= 25) {
    return {
      level: "critical" as IpRiskLevel,
      reason: `Anomalous traffic: ${distinctUsers} users in 24h, ${rapidCount} events in 10m.`,
    };
  }

  if (distinctUsers >= 4 || rapidCount >= 10 || uaLooksBot) {
    return {
      level: "warning" as IpRiskLevel,
      reason: uaLooksBot
        ? `Suspicious user-agent detected. ${distinctUsers} users in 24h, ${rapidCount} events in 10m.`
        : `Unusual pattern: ${distinctUsers} users in 24h, ${rapidCount} events in 10m.`,
    };
  }

  return { level: "trusted" as IpRiskLevel, reason: "No threat indicators detected." };
}

async function fetchIpGeo(ipAddress: string) {
  if (isPrivateOrLocalIp(ipAddress)) {
    return {
      city: "Localhost",
      region: "Private Network",
      country: "Local",
      countryCode: "LC",
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

    const [geo, risk] = await Promise.all([
      fetchIpGeo(ipAddress),
      assessIpRisk({ ipAddress, userId: decoded.uid, userAgent }),
    ]);

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
        risk_level: risk.level,
        risk_reason: risk.reason,
      },
    ]);

    if (error) {
      let fallback = await supabase.from("user_ip_logs").insert([
        {
          user_id: decoded.uid,
          ip_address: ipAddress,
          user_agent: userAgent,
          risk_level: risk.level,
          risk_reason: risk.reason,
        },
      ]);
      if (fallback.error) {
        fallback = await supabase.from("user_ip_logs").insert([
          {
            user_id: decoded.uid,
            ip_address: ipAddress,
            user_agent: userAgent,
          },
        ]);
      }
      error = fallback.error;
    }

    if (error) {
      return NextResponse.json(
        { tracked: false, reason: "IP table missing or unavailable", detail: error.message },
        { status: 200 },
      );
    }

    return NextResponse.json({
      tracked: true,
      ipAddress,
      riskLevel: risk.level,
      warning:
        risk.level === "critical" || risk.level === "malicious"
          ? "High-risk IP activity detected."
          : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ tracked: false, error: message }, { status: 500 });
  }
}
