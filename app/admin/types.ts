export type AdminUser = {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  isBanned: boolean;
  lastSignInTime: string | null;
  createdAt: string | null;
  lastActivityDate: string | null;
  ipAddress: string | null;
  ipRiskLevel: "trusted" | "warning" | "critical" | "malicious" | string;
  ipRiskReason: string | null;
  ipHistory: {
    ipAddress: string;
    seenAt: string;
    location: string;
    status: "Trusted" | "Warning" | "Critical" | "Malicious";
    riskReason: string | null;
  }[];
  activityHistory: {
    title: string;
    description: string;
    timestamp: string;
    status: "Trusted" | "Warning" | "Critical" | "Malicious";
  }[];
  presenceStatus: "Online" | "Offline" | "Inactive" | "Logged Out";
};

export type CardMetric = {
  badgeText: string;
  footerText: string;
  barPercent: number;
};

export type CardMetrics = {
  totalUsers: CardMetric;
  activeSessions: CardMetric;
  flaggedUsers: CardMetric;
};

export type Summary = {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  adminUsers: number;
};
