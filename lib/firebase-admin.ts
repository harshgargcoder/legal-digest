import * as admin from "firebase-admin";

let adminApp: admin.app.App | null = null;

type ServiceAccountShape = {
  project_id?: string;
  projectId?: string;
  client_email?: string;
  clientEmail?: string;
  private_key?: string;
  privateKey?: string;
};

function stripOuterQuotes(value: string) {
  return value.trim().replace(/^['"]|['"]$/g, "");
}

function tryParseJson<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function parseServiceAccountFromEnv(): ServiceAccountShape | null {
  const keyBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (keyBase64?.trim()) {
    const decoded = Buffer.from(stripOuterQuotes(keyBase64), "base64").toString(
      "utf-8",
    );
    const parsed = tryParseJson<ServiceAccountShape>(decoded);
    if (parsed) return parsed;
  }

  const keyJSON = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (keyJSON?.trim()) {
    const cleaned = stripOuterQuotes(keyJSON);
    const parsed = tryParseJson<ServiceAccountShape>(cleaned);
    if (parsed) return parsed;
  }

  return null;
}

function normalizePrivateKey(privateKey: string) {
  let key = stripOuterQuotes(privateKey)
    .replace(/\\r/g, "")
    .replace(/\\n/g, "\n");

  // If only base64 body is provided, convert to PEM once.
  if (!key.includes("BEGIN PRIVATE KEY")) {
    const body = key.replace(/\s+/g, "");
    if (/^[A-Za-z0-9+/=]+$/.test(body)) {
      const wrapped = body.match(/.{1,64}/g)?.join("\n") ?? body;
      key = `-----BEGIN PRIVATE KEY-----\n${wrapped}\n-----END PRIVATE KEY-----\n`;
    }
  }

  return key;
}

function validatePrivateKeyPem(key: string) {
  if (!key.includes("BEGIN PRIVATE KEY") || !key.includes("END PRIVATE KEY")) {
    throw new Error("FIREBASE private key must be a valid PEM block.");
  }

  const lines = key.trim().split(/\r?\n/);
  const body = lines.slice(1, -1).join("").trim();

  if (!/^[A-Za-z0-9+/=]+$/.test(body)) {
    throw new Error("FIREBASE private key body contains non-base64 characters.");
  }

  if (body.length % 4 !== 0) {
    throw new Error(
      "FIREBASE private key body length is invalid (base64 length must be divisible by 4). Re-copy your service account key.",
    );
  }
}

function getAdminApp() {
  if (adminApp) return adminApp;

  if (!admin.apps.length) {
    try {
      const serviceAccount = parseServiceAccountFromEnv();
      const config = {
        projectId: stripOuterQuotes(
          (
            serviceAccount?.project_id ||
            serviceAccount?.projectId ||
            process.env.FIREBASE_PROJECT_ID ||
            process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
            ""
          ).toString(),
        ),
        clientEmail: stripOuterQuotes(
          (
            serviceAccount?.client_email ||
            serviceAccount?.clientEmail ||
            process.env.FIREBASE_CLIENT_EMAIL ||
            ""
          ).toString(),
        ),
        privateKey: normalizePrivateKey(
          (
            serviceAccount?.private_key ||
            serviceAccount?.privateKey ||
            process.env.FIREBASE_PRIVATE_KEY ||
            ""
          ).toString(),
        ),
      };

      if (
        !config.projectId ||
        !config.clientEmail ||
        !config.privateKey ||
        !config.privateKey.includes("BEGIN PRIVATE KEY")
      ) {
        throw new Error(
          `Firebase Admin: Missing/invalid config. Project: ${Boolean(config.projectId)}, Email: ${Boolean(config.clientEmail)}, Key: ${Boolean(config.privateKey)}`,
        );
      }
      validatePrivateKeyPem(config.privateKey);

      adminApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: config.projectId,
          clientEmail: config.clientEmail,
          privateKey: config.privateKey,
        }),
      });
      return adminApp;
    } catch (error: unknown) {
      console.error("Firebase admin initialization failed:", error);
      throw error;
    }
  }
  return admin.app();
}

export const getAdminAuth = () => getAdminApp().auth();
