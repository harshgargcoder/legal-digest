import * as admin from "firebase-admin";

let adminApp: admin.app.App | null = null;

function getAdminApp() {
  if (adminApp) return adminApp;

  if (!admin.apps.length) {
    try {
      const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      let serviceAccount: any;

      if (key) {
        try {
          console.log("Firebase Admin: Attempting to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON...");
          serviceAccount = JSON.parse(key);
        } catch (e: any) {
          console.warn("Firebase Admin: Initial JSON.parse failed, trying cleanup...", e.message);
          const cleanedKey = key.trim().replace(/^['"]|['"]$/g, '');
          try {
            serviceAccount = JSON.parse(cleanedKey);
          } catch (e2) {
            console.error("Firebase Admin: JSON parsing completely failed.");
          }
        }
      }

      // Fallback to individual environment variables if JSON parsing failed or key is missing
      if (!serviceAccount || !serviceAccount.private_key) {
        console.log("Firebase Admin: Falling back to individual environment variables...");
        serviceAccount = {
          projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY,
        };
      }

      if (serviceAccount.private_key || serviceAccount.privateKey) {
        const pKey = serviceAccount.private_key || serviceAccount.privateKey;
        const originalLen = pKey.length;
        const normalizedKey = pKey
          .replace(/\\n/g, '\n')
          .split('\n')
          .map((line: string) => line.trim())
          .filter((line: string) => line.length > 0)
          .join('\n');
        
        if (serviceAccount.private_key) serviceAccount.private_key = normalizedKey;
        if (serviceAccount.privateKey) serviceAccount.privateKey = normalizedKey;

        console.log(`Firebase Admin: Private key normalized. Length change: ${originalLen} -> ${normalizedKey.length}`);
      }

      if (!serviceAccount.projectId || !serviceAccount.privateKey && !serviceAccount.private_key) {
        throw new Error("Firebase Admin: Missing required configuration (Project ID, Client Email, or Private Key)");
      }

      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
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
