// src/app/api/getCourseList/route.ts
import { NextResponse } from 'next/server';
import { bucket } from '@/firebaseAdmin'; // Adjust the import path as needed

// Function to fetch course folder names from Firebase Storage
const fetchCourseFolders = async () => {
  const courseNames: string[] = [];

  try {
    // List files/folders in the root of the storage bucket
    //const [files] = await bucket.getFiles({ delimiter: '/' });
    //console.log("Fetched files:", files);
    const [files] = await bucket.getFiles(); // Try without { delimiter: '/' }
    //console.log("Fetched files1:", files);
    // Only get folder names
    files.forEach((file) => {
      //console.log("File name:", file.name);
      const folderName = file.name.split('/')[0];
      //console.log("Folder name:", folderName);
      if (folderName !== "COE Graduate Student Success Center") {
        
      if (!courseNames.includes(folderName)) {
        courseNames.push(folderName); // Add folder name only once
      }
    }
    });
    
    console.log('The course names are:', courseNames);
  } catch (error) {
    console.error("Error fetching course folders:", error);
  }

  return courseNames;
};

// Named export for the GET method
export async function GET() {
  try {
    const courseNames = await fetchCourseFolders();
    return NextResponse.json(courseNames);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Failed to fetch course names' }, { status: 500 });
  }
}
