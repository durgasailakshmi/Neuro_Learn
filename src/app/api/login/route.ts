import { NextResponse } from 'next/server';
import { db } from '../../../firebaseAdmin';

// POST request handler
export async function POST(request: Request) {
  try {
    const { name, email, campusId, courses } = await request.json();

    // Create a document for the student with the campusId as the document ID
    const studentRef = db.collection('course').doc(campusId);

    // Add basic student info (name, email, and campusId)
    await studentRef.set({
      name,
      email,
      campusId,
      createdAt: new Date(),
    });

    // Add each course as a sub-collection with default fields
    for (const course of courses) {
      await studentRef.collection(course).doc('details').set({
        isAttempted: false,
        score: [],
        averageScore: 0,
      });
    }

    return NextResponse.json({ message: 'Login successful' }, { status: 200 });
  } catch (error) {
    console.error("Error saving course profile to Firestore:", error);
    return NextResponse.json({ error: 'Error saving data' }, { status: 500 });
  }
}
