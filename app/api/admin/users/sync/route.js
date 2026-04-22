import { getAdminAuth } from "@/lib/firebase-admin";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userIds } = await request.json();
    if (!userIds || !Array.isArray(userIds)) {
      return NextResponse.json({ error: "Invalid user IDs" }, { status: 400 });
    }

    const auth = getAdminAuth();
    
    // Fetch users in batches from Firebase
    const userRecords = await auth.getUsers(userIds.map(id => ({ uid: id })));
    
    const emailMap = {};
    userRecords.users.forEach(user => {
      emailMap[user.uid] = user.email;
    });

    return NextResponse.json({ emails: emailMap });

  } catch (err) {
    console.error("Firebase sync error:", err);
    return NextResponse.json({ error: "Firebase Sync Failed" }, { status: 500 });
  }
}
