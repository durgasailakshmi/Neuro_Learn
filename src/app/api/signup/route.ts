import { NextResponse } from 'next/server';
import { db } from '../../../firebaseAdmin';

// POST request handler
export async function POST(request: Request) {
  try {
    const { name, email, campusId } = await request.json();

    // Add the new user data to Firestore
    await db.collection('users').add({
      name,
      email,
      campusId,
      createdAt: new Date(),
    });

    return NextResponse.json({ message: 'Signup successful' }, { status: 200 });
  } catch (error) {
    console.error("Error saving user profile to Firestore:", error);
    return NextResponse.json({ error: 'Error saving data' }, { status: 500 });
  }
}
