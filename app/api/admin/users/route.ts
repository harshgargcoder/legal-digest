import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAdminAuth } from "@/lib/firebase-admin";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase environment variables are not configured.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

type AdminContext = {
  uid: string;
};

type AdminAction = "ban" | "unban";
type CardMetric = {
  badgeText: string;
  footerText: string;
  barPercent: number;
};
type IpLogEntry = {
  ipAddress: string;
  seenAt: string;
  location: string;
  status: "Trusted" | "Warning" | "Critical" | "Malicious";
  riskReason: string | null;
};
type ActivityEntry = {
  title: string;
  description: string;
  timestamp: string;
  status: "Trusted" | "Warning" | "Critical" | "Malicious";
};
type IpLogRow = {
  user_id: string;
  ip_address: string;
  seen_at: string;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  country_code?: string | null;
  risk_level?: string | null;
  risk_reason?: string | null;
};

function getBearerToken(req: Request) {
  const header = req.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length);
}

function getRequestIp(req: Request) {
  const header = req.headers.get("x-forwarded-for");
  if (header) return header.split(",")[0].trim().replace(/^::ffff:/, "");
  return req.headers.get("x-real-ip")?.trim().replace(/^::ffff:/, "") ?? null;
}

function isHardBlockedIp(ipAddress: string | null) {
  if (!ipAddress) return false;
  const raw = `${process.env.MALICIOUS_IPS ?? ""},${
    process.env.BLOCKED_IPS ?? ""
  }`;
  const set = new Set(raw.split(",").map((s) => s.trim()).filter(Boolean));
  return set.has(ipAddress);
}

async function isSupabaseAdmin(uid: string) {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("role")
    .eq("user_id", uid)
    .maybeSingle();

  if (error) throw error;
  return data?.role === "Admin";
}

async function requireAdmin(req: Request): Promise<AdminContext> {
  const token = getBearerToken(req);
  if (!token) {
    throw new ResponseError("Missing authorization token", 401);
  }

  const auth = getAdminAuth();
  const decoded = await auth.verifyIdToken(token);
  const fromClaim = decoded.admin === true || decoded.role === "Admin";
  console.log("UID:", decoded.uid);
  const fromDb = await isSupabaseAdmin(decoded.uid);
  console.log("FROM DB:", fromDb);

  if (!fromClaim && !fromDb) {
    throw new ResponseError("Forbidden", 403);
  }

  return { uid: decoded.uid };
}

class ResponseError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function listAllFirebaseUsers() {
  const auth = getAdminAuth();
  const users: Awaited<ReturnType<typeof auth.listUsers>>["users"] = [];
  let nextPageToken: string | undefined;

  do {
    const page = await auth.listUsers(1000, nextPageToken);
    users.push(...page.users);
    nextPageToken = page.pageToken;
  } while (nextPageToken);

  return users;
}

function parseDateOrNull(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateKey(daysAgo = 0) {
  const d = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  return d.toISOString().split("T")[0];
}

function clampPercent(value: number) {
  return Math.max(6, Math.min(100, Math.round(value)));
}

function percentOf(value: number, max: number) {
  if (max <= 0) return 0;
  return (value / max) * 100;
}

function stdDev(values: number[]) {
  if (!values.length) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
    values.length;
  return Math.sqrt(variance);
}

function getIpMeta(
  ipAddress: string,
  row?: {
    city?: string | null;
    region?: string | null;
    country_code?: string | null;
    country?: string | null;
    risk_level?: string | null;
  },
): {
  location: string;
  region: string;
  status: "Trusted" | "Warning" | "Critical" | "Malicious";
} {
  const ip = ipAddress.trim().toLowerCase();
  const isLocal = ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip) ||
    ip.startsWith("::ffff:127.");

  if (isLocal) {
    return { location: "Local/Private", region: "Local", status: "Trusted" };
  }

  const risk = (row?.risk_level ?? "trusted").toLowerCase();
  const status = risk === "malicious" ? "Malicious" : risk === "critical" ? "Critical" : risk === "warning" ? "Warning" : "Trusted";
  
  // Build location string
  let location = "Unknown";
  if (row?.city && row?.country_code) {
    location = `${row.city}, ${row.country_code}`;
  } else if (row?.region && row?.country_code) {
    location = `${row.region}, ${row.country_code}`;
  } else if (row?.country) {
    location = row.country;
  } else if (row?.country_code) {
    location = row.country_code;
  }

  // Determine Region (for UI analytics if needed)
  let region = "Unknown";
  const cc = (row?.country_code || row?.country || "").toUpperCase();
  if (cc) {
    const NA = new Set(["US", "CA", "MX", "USA", "CANADA"]);
    const EU = new Set(["GB", "IE", "FR", "DE", "ES", "IT", "NL", "BE", "SE", "NO", "DK", "FI", "CH", "AT", "PL", "PT", "CZ", "HU", "GR", "RO", "UA", "UK", "UNITED KINGDOM", "FRANCE", "GERMANY"]);
    const AS = new Set(["IN", "CN", "JP", "KR", "SG", "MY", "TH", "VN", "ID", "AE", "SA", "PK", "BD", "LK", "NP", "INDIA", "CHINA", "JAPAN"]);
    
    if (NA.has(cc)) region = "NA";
    else if (EU.has(cc)) region = "EU";
    else if (AS.has(cc)) region = "AS";
    else region = "Other";
  }

  return { location, region, status };
}

export async function GET(req: Request) {
  try {
    if (isHardBlockedIp(getRequestIp(req))) {
      return NextResponse.json(
        { error: "Blocked IP: access denied by security policy." },
        { status: 403 },
      );
    }

    await requireAdmin(req);

    const [firebaseUsers, prefsResult, usageResult] = await Promise.all([
      listAllFirebaseUsers(),
      supabase
        .from("user_preferences")
        .select("user_id, role, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("usage_metrics")
        .select("user_id, activity_date")
        .gte(
          "activity_date",
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        )
        .order("activity_date", { ascending: false }),
    ]);

    if (prefsResult.error) throw prefsResult.error;
    if (usageResult.error) throw usageResult.error;

    const prefMap = new Map(
      (prefsResult.data ?? []).map((p) => [
        p.user_id,
        { role: p.role ?? "Law Student", createdAt: p.created_at ?? null },
      ]),
    );

    let ipTracking = false;
    let ipNote =
      "IP is not tracked in current schema. Add IP logging on sign-in/events to show it here.";
    const ipByUser = new Map<string, string>();
    const ipRiskByUser = new Map<string, string>();
    const ipRiskReasonByUser = new Map<string, string | null>();
    const ipHistoryByUser = new Map<string, IpLogEntry[]>();
    const activityHistoryByUser = new Map<string, ActivityEntry[]>();
    const ipSeenPerUser = new Map<string, Set<string>>();
    let ipData: IpLogRow[] = [];
    let ipError: Error | null = null;

    const ipQueryWithGeo = await supabase
      .from("user_ip_logs")
      .select(
        "user_id, ip_address, seen_at, city, region, country, country_code, risk_level, risk_reason",
      )
      .order("seen_at", { ascending: false })
      .limit(5000);

    if (!ipQueryWithGeo.error && ipQueryWithGeo.data) {
      ipData = ipQueryWithGeo.data as IpLogRow[];
    } else {
      const ipQueryLegacy = await supabase
        .from("user_ip_logs")
        .select("user_id, ip_address, seen_at, risk_level, risk_reason")
        .order("seen_at", { ascending: false })
        .limit(5000);
      if (!ipQueryLegacy.error && ipQueryLegacy.data) {
        ipData = ipQueryLegacy.data as IpLogRow[];
      } else if (ipQueryLegacy.error) {
        ipError = ipQueryLegacy.error;
      }
    }

    if (!ipError && ipData) {
      for (const row of ipData) {
        if (!ipByUser.has(row.user_id) && row.ip_address) {
          ipByUser.set(row.user_id, row.ip_address);
          ipRiskByUser.set(row.user_id, row.risk_level ?? "trusted");
          ipRiskReasonByUser.set(row.user_id, row.risk_reason ?? null);
        }

        if (!row.user_id || !row.ip_address || !row.seen_at) continue;

        if (!ipSeenPerUser.has(row.user_id)) {
          ipSeenPerUser.set(row.user_id, new Set<string>());
        }
        if (!ipHistoryByUser.has(row.user_id)) {
          ipHistoryByUser.set(row.user_id, []);
        }
        if (!activityHistoryByUser.has(row.user_id)) {
          activityHistoryByUser.set(row.user_id, []);
        }

        const seenSet = ipSeenPerUser.get(row.user_id)!;
        if (seenSet.has(row.ip_address)) continue;
        seenSet.add(row.ip_address);

        const meta = getIpMeta(row.ip_address, row);
        const history = ipHistoryByUser.get(row.user_id)!;
        if (history.length < 10) {
          history.push({
            ipAddress: row.ip_address,
            seenAt: row.seen_at,
            location: meta.location,
            status: meta.status,
            riskReason: row.risk_reason ?? null,
          });
        }

        const activity = activityHistoryByUser.get(row.user_id)!;
        if (activity.length < 25) {
          const title = meta.status === "Malicious"
            ? "Malicious IP Activity"
            : meta.status === "Critical"
            ? "Critical Risk Login Pattern"
            : meta.status === "Warning"
            ? "Suspicious Login Pattern"
            : "Session Authenticated";

          const description = meta.status === "Trusted"
            ? `Login/session seen from ${row.ip_address} (${meta.location}).`
            : row.risk_reason
            ? `${row.risk_reason} IP: ${row.ip_address} (${meta.location}).`
            : `Risk signal detected from ${row.ip_address} (${meta.location}).`;

          activity.push({
            title,
            description,
            timestamp: row.seen_at,
            status: meta.status,
          });
        }
      }
      ipTracking = true;
      ipNote = ipData.length > 0
        ? "IP addresses shown are tracked from real user sessions."
        : "IP tracking is enabled. Session data will appear after users log in.";
    } else if (ipError) {
      ipTracking = false;
      ipNote =
        "IP table unavailable. Create `user_ip_logs` and enable session tracking to display IPs.";
    }

    const lastActivityMap = new Map<string, string>();
    for (const row of usageResult.data ?? []) {
      if (!lastActivityMap.has(row.user_id) && row.activity_date) {
        lastActivityMap.set(row.user_id, row.activity_date);
      }
    }

    const now = new Date();
    const todayDate = now.toISOString().split("T")[0];
    const sevenDaysAgo = new Date(
      now.getTime() - 7 * 24 * 60 * 60 * 1000,
    ).toISOString().split("T")[0];

    const users = firebaseUsers
      .map((fUser) => {
        const pref = prefMap.get(fUser.uid);
        const creationTime = pref?.createdAt ?? fUser.metadata.creationTime ??
          null;
        const lastActivityDate = lastActivityMap.get(fUser.uid) ?? null;

        return {
          uid: fUser.uid,
          email: fUser.email ?? "",
          displayName: fUser.displayName ?? "",
          role: pref?.role ?? "Law Student",
          isBanned: fUser.disabled ?? false,
          lastSignInTime: fUser.metadata.lastSignInTime ?? null,
          createdAt: creationTime,
          lastActivityDate,
          ipAddress: ipByUser.get(fUser.uid) ?? null,
          ipRiskLevel: ipRiskByUser.get(fUser.uid) ?? "trusted",
          ipRiskReason: ipRiskReasonByUser.get(fUser.uid) ?? null,
          ipHistory: ipHistoryByUser.get(fUser.uid) ?? [],
          activityHistory: activityHistoryByUser.get(fUser.uid) ?? [],
        };
      })
      .sort((a, b) => {
        const aDate = parseDateOrNull(a.createdAt);
        const bDate = parseDateOrNull(b.createdAt);
        if (!aDate && !bDate) return 0;
        if (!aDate) return 1;
        if (!bDate) return -1;
        return bDate.getTime() - aDate.getTime();
      });

    const activeToday = users.filter(
      (user) => user.lastActivityDate === todayDate,
    ).length;
    const activeSevenDays = users.filter(
      (user) =>
        user.lastActivityDate !== null && user.lastActivityDate >= sevenDaysAgo,
    ).length;
    const bannedUsers = users.filter((user) => user.isBanned).length;
    const adminUsers = users.filter((user) => user.role === "Admin").length;

    // Dynamic performance cards based on live dataset.
    const createdAtDates = users
      .map((u) => parseDateOrNull(u.createdAt ?? undefined))
      .filter((d): d is Date => d !== null)
      .map((d) => d.toISOString().split("T")[0]);

    const sevenDaysAgoKey = dateKey(7);
    const fourteenDaysAgoKey = dateKey(14);

    const signupsCurrent7d = createdAtDates.filter((d) =>
      d >= sevenDaysAgoKey
    ).length;
    const signupsPrev7d = createdAtDates.filter(
      (d) => d >= fourteenDaysAgoKey && d < sevenDaysAgoKey,
    ).length;
    const growthPctRaw = signupsPrev7d === 0
      ? signupsCurrent7d > 0 ? 100 : 0
      : ((signupsCurrent7d - signupsPrev7d) / signupsPrev7d) * 100;
    const growthPct = Math.round(growthPctRaw);

    const activeByDate = new Map<string, Set<string>>();
    for (const row of usageResult.data ?? []) {
      if (!row.activity_date || !row.user_id) continue;
      if (!activeByDate.has(row.activity_date)) {
        activeByDate.set(row.activity_date, new Set<string>());
      }
      activeByDate.get(row.activity_date)?.add(row.user_id);
    }

    const last7DaysCounts = Array.from({ length: 7 }).map((_, idx) => {
      const key = dateKey(6 - idx);
      return activeByDate.get(key)?.size ?? 0;
    });
    const avgDailyActive = last7DaysCounts.reduce((sum, value) =>
      sum + value, 0) /
      Math.max(last7DaysCounts.length, 1);
    const activityStdDev = stdDev(last7DaysCounts);
    const stabilityScore = avgDailyActive > 0
      ? Math.max(0, 100 - (activityStdDev / avgDailyActive) * 100)
      : 0;

    const bannedRatio = users.length > 0 ? bannedUsers / users.length : 0;
    const flaggedSeverity = bannedRatio >= 0.1
      ? "Critical"
      : bannedRatio >= 0.03
      ? "Elevated"
      : "Healthy";

    const cardMetrics: {
      totalUsers: CardMetric;
      activeSessions: CardMetric;
      flaggedUsers: CardMetric;
    } = {
      totalUsers: {
        badgeText: `${growthPct >= 0 ? "+" : ""}${growthPct}%`,
        footerText: `7d signups ${signupsCurrent7d}`,
        barPercent: clampPercent(percentOf(users.length, 5000)),
      },
      activeSessions: {
        badgeText: stabilityScore >= 80
          ? "Stable"
          : stabilityScore >= 55
          ? "Fluctuating"
          : "Volatile",
        footerText: `Avg ${avgDailyActive.toFixed(1)}/day`,
        barPercent: clampPercent(stabilityScore),
      },
      flaggedUsers: {
        badgeText: flaggedSeverity,
        footerText: `${(bannedRatio * 100).toFixed(1)}% flagged`,
        barPercent: clampPercent(bannedRatio * 100),
      },
    };

    return NextResponse.json({
      users,
      summary: {
        totalUsers: users.length,
        activeToday,
        activeSevenDays,
        bannedUsers,
        adminUsers,
      },
      cardMetrics,
      generatedAt: new Date().toISOString(),
      ipTracking,
      ipNote,
    });
  } catch (err) {
    if (err instanceof ResponseError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Unknown server error";
    console.error("Admin users GET error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (isHardBlockedIp(getRequestIp(req))) {
      return NextResponse.json(
        { error: "Blocked IP: access denied by security policy." },
        { status: 403 },
      );
    }

    await requireAdmin(req);

    const body = (await req.json()) as { targetUserId?: string };
    const targetUserId = body.targetUserId?.trim();

    if (!targetUserId) {
      return NextResponse.json(
        { error: "targetUserId is required" },
        { status: 400 },
      );
    }

    const auth = getAdminAuth();
    const targetUser = await auth.getUser(targetUserId);

    if (!targetUser.email) {
      return NextResponse.json(
        { error: "Target user does not have an email login." },
        { status: 400 },
      );
    }

    const resetLink = await auth.generatePasswordResetLink(targetUser.email);
    return NextResponse.json({ success: true, resetLink });
  } catch (err) {
    if (err instanceof ResponseError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Unknown server error";
    console.error("Admin users POST error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    if (isHardBlockedIp(getRequestIp(req))) {
      return NextResponse.json(
        { error: "Blocked IP: access denied by security policy." },
        { status: 403 },
      );
    }

    await requireAdmin(req);

    const body = (await req.json()) as {
      targetUserId?: string;
      action?: AdminAction;
    };
    const targetUserId = body.targetUserId?.trim();
    const action = body.action;

    if (!targetUserId || !action || !["ban", "unban"].includes(action)) {
      return NextResponse.json(
        { error: "targetUserId and valid action are required" },
        { status: 400 },
      );
    }

    const auth = getAdminAuth();
    await auth.updateUser(targetUserId, { disabled: action === "ban" });

    return NextResponse.json({
      success: true,
      targetUserId,
      isBanned: action === "ban",
    });
  } catch (err) {
    if (err instanceof ResponseError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Unknown server error";
    console.error("Admin users PATCH error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    if (isHardBlockedIp(getRequestIp(req))) {
      return NextResponse.json(
        { error: "Blocked IP: access denied by security policy." },
        { status: 403 },
      );
    }

    const admin = await requireAdmin(req);
    const body = (await req.json()) as { targetUserId?: string };
    const targetUserId = body.targetUserId?.trim();

    if (!targetUserId) {
      return NextResponse.json(
        { error: "targetUserId is required" },
        { status: 400 },
      );
    }

    if (targetUserId === admin.uid) {
      return NextResponse.json(
        { error: "Admin cannot delete their own account." },
        { status: 400 },
      );
    }

    const auth = getAdminAuth();
    await auth.deleteUser(targetUserId);

    await Promise.all([
      supabase.from("user_preferences").delete().eq("user_id", targetUserId),
      supabase.from("bookmarks").delete().eq("user_id", targetUserId),
      supabase.from("posts").delete().eq("user_id", targetUserId),
      supabase.from("usage_metrics").delete().eq("user_id", targetUserId),
    ]);

    return NextResponse.json({ success: true, targetUserId });
  } catch (err) {
    if (err instanceof ResponseError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Unknown server error";
    console.error("Admin users DELETE error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
