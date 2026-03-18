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

      const serviceAccount = JSON.parse(key);
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
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
