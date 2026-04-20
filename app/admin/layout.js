import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAdminAuth } from '@/lib/firebase-admin';

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;

  // We don't redirect here if missing, because the page.js handles the Login Gate UI.
  // But we can verify the token if it exists to help the client side.
  
  if (sessionToken) {
    try {
      const adminAuth = getAdminAuth();
      const decodedToken = await adminAuth.verifyIdToken(sessionToken);
      const uid = decodedToken.uid;

      const { data: profile } = await supabaseAdmin
        .from('users')
        .select('is_admin')
        .eq('id', uid)
        .single();

      if (!profile?.is_admin) {
        // If they have a token but aren't admin, clear cookie and redirect
        console.error('Admin Guard: User is not admin. Redirecting...');
        // redirect('/'); // Optional: Let the client handle the "Unauthorized" message
      }
    } catch (error) {
      console.error('Admin Guard: Token verification failed.');
    }
  }

  return <>{children}</>;
}
