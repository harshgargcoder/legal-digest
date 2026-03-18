import * as admin from "firebase-admin";

let adminApp: admin.app.App | null = null;

function getAdminApp() {
  if (adminApp) return adminApp;

  if (!admin.apps.length) {
    try {
      const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      if (!key) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is missing in environment variables.");
      }

      let serviceAccount;
      try {
        serviceAccount = JSON.parse(key);
      } catch (e) {
        // Fallback for cases where the key might be wrapped in extra quotes by the environment loader
        const cleanedKey = key.trim().replace(/^['"]|['"]$/g, '');
        serviceAccount = JSON.parse(cleanedKey);
      }

      if (serviceAccount.private_key) {
        // Robust replacement of literal \n and handling of already-real newlines
        serviceAccount.private_key = serviceAccount.private_key
          .replace(/\\n/g, '\n')
          .split('\n')
          .map((line: string) => line.trim())
          .join('\n')
          .trim();
      }

      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      return adminApp;
    } catch (error) {
      console.error("Firebase admin initialization failed:", error);
      throw error;
    }
  }
  return admin.app();
}

export const getAdminAuth = () => getAdminApp().auth();
