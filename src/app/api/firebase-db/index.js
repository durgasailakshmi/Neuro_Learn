import { NextResponse } from 'next/server'; 
import { storage } from "@/app/config/firebase";
import { ref, uploadBytesResumable } from "firebase/storage";

export async function GET() {
  const accessToken = '21139~ymt4hua3thvKJQU7aAVK87JzzGQwetvnLFJnABRcW2QhQBW2fPyT446xzuZBV73G'; // Replace with your actual Canvas token
  const fileIdApiUrl = `https://csulb.instructure.com/files/17995162/download?download_frd=1&verifier=BJWz137C0ZTcM8SiDBzhWgRvvBw6eRPeoC7AU6Ec`; // Canvas API URL

  try {
    // Fetch the file from Canvas API
    const fileResponse = await fetch(fileIdApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!fileResponse.ok) {
      throw new Error('Failed to fetch file from Canvas');
    }

    // Get the file blob and convert it to an ArrayBuffer
    const fileData = await fileResponse.arrayBuffer();
    const buffer = Buffer.from(fileData); // Convert ArrayBuffer to Buffer

    // Upload the file to Firebase Storage
    const storageRef = ref(storage, `files/downloaded_file.pdf`);
    const uploadTask = uploadBytesResumable(storageRef, buffer, { contentType: "application/pdf" });

    // Return the response to trigger download
    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/pdf', 
        'Content-Disposition': 'attachment; filename="downloaded_file.pdf"',
      },
    });
  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
  }
}
