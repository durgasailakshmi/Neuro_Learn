import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import { bucket } from '../../../firebaseAdmin'; // Import the bucket directly

// Define a TypeScript type for a course
type Course = {
  id: number;
  name: string;
};

// Define a TypeScript type for a module
type Module = {
  id: number;
  name: string;
};

// Define a TypeScript type for a file item
type FileItem = {
  id: number;
  type: string;
  url: string;
  filename: string;
};

// Helper function to add a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET() {
  const accessToken = '21139~ymt4hua3thvKJQU7aAVK87JzzGQwetvnLFJnABRcW2QhQBW2fPyT446xzuZBV73G'; // Replace with your actual Canvas token
  const baseUrl = 'https://csulb.instructure.com/api/v1';

  try {
    console.log('Fetching courses...');

    // Step 1: Fetch the list of courses
    const coursesResponse = await fetch(`${baseUrl}/courses`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!coursesResponse.ok) {
      console.error('Failed to fetch courses:', coursesResponse.statusText);
      return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
    }

    // Cast the response to a Course[] type
    const courses = await coursesResponse.json() as Course[];

    console.log(`Fetched ${courses.length} courses`);

    // Step 2: Loop through each course
    for (const course of courses) {
      const courseId = course.id;
      console.log(`Fetching modules for course: ${courseId}`);

      // Fetch modules for the current course
      const modulesResponse = await fetch(`${baseUrl}/courses/${courseId}/modules`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!modulesResponse.ok) {
        console.warn(`Skipping course ${courseId}: Failed to fetch modules. Error: ${modulesResponse.statusText}`);
        continue; // Skip this course and continue with the next one
      }

      // Cast the response to a Module[] type
      const modules = await modulesResponse.json() as Module[];
      console.log(`Fetched ${modules.length} modules for course: ${courseId}`);

      // Step 3: Loop through each module
      for (const module of modules) {
        const moduleId = module.id;
        console.log(`Fetching module items for module: ${moduleId} in course ${courseId}`);

        // Delay between module fetches to avoid rate limiting
        await delay(1000); // 1 second delay

        // Fetch items for the current module
        const moduleItemsResponse = await fetch(`${baseUrl}/courses/${courseId}/modules/${moduleId}/items`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!moduleItemsResponse.ok) {
          console.warn(`Skipping module ${moduleId} in course ${courseId}: Failed to fetch module items. Error: ${modulesResponse.statusText}`);
          continue; // Skip this module and continue with the next one
        }

        // Cast the response to a FileItem[] type
        const moduleItems = await moduleItemsResponse.json() as FileItem[];
        console.log(`Fetched ${moduleItems.length} items for module: ${moduleId}`);

        // Step 4: Loop through each module item and handle all file types
        for (const item of moduleItems) {
          if (item.type === 'File') {
            const fileUrl = item.url;
            console.log(`Fetching file metadata for item: ${item.id}`);

            // Delay between file fetches to avoid rate limiting
            await delay(1000); // 1 second delay

            // Fetch the file metadata
            const fileResponse = await fetch(fileUrl, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            });

            if (!fileResponse.ok) {
              console.warn(`Skipping file ${item.id} in module ${moduleId}: Failed to fetch file metadata. Error: ${fileResponse.statusText}`);
              continue; // Skip this file and continue with the next one
            }

            const fileData = await fileResponse.json() as FileItem;

            // Fetch the actual file content
            const fileContentResponse = await fetch(fileData.url);
            const fileBlob = await fileContentResponse.blob();
            const fileBuffer = await fileBlob.arrayBuffer();

            // Step 5: Upload the file to Firebase Storage
            const fileName = `${course.name}/${module.name}/${fileData.filename}`; // Organize by course/module in Firebase Storage
            const fileRef = bucket.file(fileName); // Reference to the file in Firebase Storage

            console.log(`Uploading ${fileData.filename} to Firebase...`);
            await fileRef.save(Buffer.from(fileBuffer), {
              contentType: fileBlob.type,
            });
            console.log(`Uploaded ${fileData.filename} to Firebase`);
          }
        }
      }
    }

    console.log('All files uploaded to Firebase Storage');
    return NextResponse.json({ message: 'All files uploaded to Firebase Storage' });
  } catch (error) {
    console.error('Error uploading files to Firebase:', error);
    return NextResponse.json({ error: 'Failed to upload files to Firebase' }, { status: 500 });
  }
}
