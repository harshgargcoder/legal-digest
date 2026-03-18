import * as admin from "firebase-admin";

let adminApp: admin.app.App | null = null;

function getAdminApp() {
  if (adminApp) return adminApp;

  if (!admin.apps.length) {
    try {
      const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      let serviceAccount: any = null;

      // 1. Try to load from single JSON key
      if (key && key.trim()) {
        try {
          console.log("Firebase Admin: Attempting to parse JSON service account key...");
          const cleanedKey = key.trim().replace(/^['"]|['"]$/g, '');
          serviceAccount = JSON.parse(cleanedKey);
        } catch (e: any) {
          console.warn("Firebase Admin: JSON parsing of FIREBASE_SERVICE_ACCOUNT_KEY failed:", e.message);
        }
      }

      // 2. Map JSON keys to a standard config object if found
      const config: any = serviceAccount ? {
        projectId: serviceAccount.project_id || serviceAccount.projectId,
        clientEmail: serviceAccount.client_email || serviceAccount.clientEmail,
        privateKey: serviceAccount.private_key || serviceAccount.privateKey,
      } : {
        projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY,
      };

      // 3. Robust Private Key Normalization (PEM format)
      if (config.privateKey) {
        let pKey = config.privateKey;
        
        // Replace literal \n and fix escapes
        pKey = pKey.replace(/\\n/g, '\n');
        
        // Build clean lines
        const lines = pKey.split('\n')
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0);
        
        // Ensure standard headers/footers
        if (lines[0] && !lines[0].includes("BEGIN PRIVATE KEY")) {
          lines.unshift("-----BEGIN PRIVATE KEY-----");
        }
        if (lines[lines.length - 1] && !lines[lines.length - 1].includes("END PRIVATE KEY")) {
          lines.push("-----END PRIVATE KEY-----");
        }
        
        config.privateKey = lines.join('\n') + '\n';
        console.log(`Firebase Admin: Private key normalized (Lines: ${lines.length})`);
      }

      // 4. Validation & Throws with clear details
      const missing = [];
      if (!config.projectId) missing.push("Project ID");
      if (!config.clientEmail) missing.push("Client Email");
      if (!config.privateKey) missing.push("Private Key");

      if (missing.length > 0) {
        const errorMsg = `Firebase Admin: Missing configuration for: ${missing.join(", ")}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      adminApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: config.projectId,
          clientEmail: config.clientEmail,
          privateKey: config.privateKey,
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
