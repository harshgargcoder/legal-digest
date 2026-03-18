import * as admin from "firebase-admin";

let adminApp: admin.app.App | null = null;

function getAdminApp() {
  if (adminApp) return adminApp;

  if (!admin.apps.length) {
    try {
      const keyJSON = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      const keyBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
      let serviceAccount: any = null;

      // 1. Try to load from Base64 (Most reliable for Vercel)
      if (keyBase64) {
        try {
          console.log(
            "Firebase Admin: Attempting to parse Base64 service account...",
          );
          const decoded = Buffer.from(keyBase64, "base64").toString("utf-8");
          serviceAccount = JSON.parse(decoded);
        } catch (e: any) {
          console.error(
            "Firebase Admin: Base64 decoding/parsing failed:",
            e.message,
          );
        }
      }

      // 2. Try to load from single JSON key if no Base64
      if (!serviceAccount && keyJSON && keyJSON.trim()) {
        try {
          console.log(
            "Firebase Admin: Attempting to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON...",
          );
          const cleanedKey = keyJSON.trim().replace(/^['"]|['"]$/g, "");
          serviceAccount = JSON.parse(cleanedKey);
        } catch (e: any) {
          console.warn("Firebase Admin: JSON parsing failed:", e.message);
        }
      }

      // 3. Robustly build config from available sources
      const config = {
        project_id:
          (serviceAccount?.project_id || serviceAccount?.projectId ||
            process.env.FIREBASE_PROJECT_ID ||
            process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "").toString().trim()
            .replace(/^['"]|['"]$/g, ""),
        client_email:
          (serviceAccount?.client_email || serviceAccount?.clientEmail ||
            process.env.FIREBASE_CLIENT_EMAIL || "").toString().trim().replace(
              /^['"]|['"]$/g,
              "",
            ),
        private_key:
          (serviceAccount?.private_key || serviceAccount?.privateKey ||
            process.env.FIREBASE_PRIVATE_KEY || "").toString().trim().replace(
              /^['"]|['"]$/g,
              "",
            ),
      };

      // 4. Ultra-Aggressive Private Key Normalization (PEM format)
      if (config.private_key) {
        let pKey = config.private_key;

        // Fix common escaping/mangling issues
        pKey = pKey.replace(/\\n/g, "\n").replace(/\r\n/g, "\n");

        // Split and clean every single line
        const lines = pKey.split("\n")
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0)
          .map((s: string) => s.replace(/^['"]|['"]$/g, "").trim()); // Strip internal quotes per line

        // Rebuild with proper headers/footers
        const cleanedLines = lines.filter((l: string) =>
          !l.includes("PRIVATE KEY")
        );
        const finalLines = [
          "-----BEGIN PRIVATE KEY-----",
          ...cleanedLines,
          "-----END PRIVATE KEY-----",
        ];

        config.private_key = finalLines.join("\n") + "\n";
        console.log(
          `Firebase Admin: Private key successfully normalized. (Lines: ${finalLines.length})`,
        );
      }

      // 5. Validation
      if (
        !config.project_id || !config.client_email || !config.private_key ||
        config.private_key.length < 100
      ) {
        throw new Error(
          `Firebase Admin: Missing or invalid configuration. Project: ${!!config
            .project_id}, Email: ${!!config.client_email}, Key: ${!!config
            .private_key}`,
        );
      }

      adminApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: config.project_id,
          clientEmail: config.client_email,
          privateKey: config.private_key,
        }),
      });
      console.log("Firebase Admin: Successfully initialized!");
      return adminApp;
    } catch (error) {
      console.error("Firebase admin initialization failed:", error);
      throw error;
    }
  }
  return admin.app();
}

export const getAdminAuth = () => getAdminApp().auth();
