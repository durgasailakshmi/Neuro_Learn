import { NextResponse } from 'next/server';
import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';
import { bucket } from '../../../firebaseAdmin'; // Import the bucket directly
import { getStorage, ref, listAll } from "firebase/storage";

// Define TypeScript types for Course, Module, FileItem, and ModuleItem
type Course = {
  id: number;
  name: string;
};

type Module = {
  id: number;
  name: string;
};

type FileItem = {
  id: number;
  type: string;
  url: string;
  filename: string;
};

type ModuleItem = {
  id: number;
  type: string;
  url: string;
};

// Helper function to add a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

//Sushma function to fetch courses 
export const fetchCourseFolders = async () => {
  const storage = getStorage();
  const storageRef = ref(storage, ''); // Update path if necessary to match your structure
  const course_Names: string[] = [];

  try {
    const result = await listAll(storageRef);
    result.prefixes.forEach((folderRef) => {
      course_Names.push(folderRef.name); // Extract folder name as course name
    });
    console.log(course_Names);
  } catch (error) {
    console.error("Error fetching course folders:", error);
  }

  return course_Names;
};

// Separate function to fetch courses
async function fetchCoursesHandler(accessToken: string, baseUrl: string): Promise<Course[]> {
  const response = await fetch(`${baseUrl}/courses`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch courses');
  }

  const courses = await response.json() as Course[];
  console.log(`Fetched ${courses.length} courses`);
  return courses;
}

// Main GET function
async function GET(request: Request) {
  // Retrieve the access token from the Authorization header
  
  const authorizationHeader = request.headers.get('Authorization');
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized access: No Bearer token provided' }, { status: 401 });
  }

  const accessToken = authorizationHeader.split(' ')[1];
  const baseUrl = 'https://csulb.instructure.com/api/v1';

  try {
    console.log('Fetching courses from Canvas API...');
    const courses = await fetchCoursesHandler(accessToken, baseUrl); // Use the fetchCourses function

    // Iterate over each course to fetch modules and files
    for (const course of courses) {
      console.log(`Fetching modules for course: ${course.name}`);
      
      try {
        const modulesResponse = await fetch(`${baseUrl}/courses/${course.id}/modules`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!modulesResponse.ok) {
          const errorMessage = await modulesResponse.text();
          console.warn(`Skipping course ${course.id} due to error: ${errorMessage}`);
          continue;
        }

        const modules = await modulesResponse.json() as Module[];
        console.log(`Fetched ${modules.length} modules for course: ${course.name}`);

        // Iterate over each module and fetch the module items
        for (const module of modules) {
          console.log(`Fetching items for module: ${module.name}`);
          const moduleItemsResponse = await fetch(`${baseUrl}/courses/${course.id}/modules/${module.id}/items`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (!moduleItemsResponse.ok) {
            const errorMessage = await moduleItemsResponse.text();
            console.warn(`Skipping module ${module.id} due to error: ${errorMessage}`);
            continue;
          }

          const moduleItems = await moduleItemsResponse.json() as ModuleItem[];

          // Fetch each file item and handle all file types
          for (const item of moduleItems) {
            if (item.type === 'File') {
              const fileUrl = item.url;
              console.log(`Fetching file metadata for item: ${item.id}`);

              // Fetch the file metadata
              const fileResponse = await fetch(fileUrl, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
              });

              if (!fileResponse.ok) {
                console.warn(`Skipping file ${item.id} in module ${module.id}: Failed to fetch file metadata. Error: ${fileResponse.statusText}`);
                continue;
              }

              const fileData = await fileResponse.json() as FileItem;

              // Fetch the actual file content
              const fileContentResponse = await fetch(fileData.url);
              const fileBlob = await fileContentResponse.blob();
              const fileBuffer = await fileBlob.arrayBuffer();

              // Upload the file to Firebase Storage
              const fileName = `${course.name}/${fileData.filename}`;
              const fileRef = bucket.file(fileName);

              console.log(`Uploading ${fileData.filename} to Firebase...`);
              await fileRef.save(Buffer.from(fileBuffer), {
                contentType: fileBlob.type,
              });
              console.log(`Uploaded ${fileData.filename} to Firebase`);
            }
          }
        }
        
      } catch (error) {
        console.error(`Error fetching modules or items for course ${course.id}:`, error);
      }
      
      // Add a delay to avoid hitting rate limits
      await delay(1000);
    }

    console.log('All files uploaded to Firebase Storage');
    return NextResponse.json({ message: 'All files uploaded to Firebase Storage' });
  } catch (error) {
    console.error('Error uploading files to Firebase:', error);
    return NextResponse.json({ error: 'Failed to upload files to Firebase' }, { status: 500 });
  }
  
}
// ... existing code ...

export { fetchCoursesHandler, GET as GET };

// Remove the entire handler function