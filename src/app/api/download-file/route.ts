import { NextResponse } from 'next/server';

export async function GET() {
  const accessToken = '21139~ymt4hua3thvKJQU7aAVK87JzzGQwetvnLFJnABRcW2QhQBW2fPyT446xzuZBV73G'; // Replace with your actual Canvas token
  const baseUrl = 'https://csulb.instructure.com/api/v1';
  
  try {
    // Step 1: Fetch the list of courses
    const coursesResponse = await fetch(`${baseUrl}/courses`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!coursesResponse.ok) {
      throw new Error('Failed to fetch courses');
    }

    const courses = await coursesResponse.json();
    const selectedCourseId = courses[0].id; // Select the first course or any specific course

    // Step 2: Fetch modules for the selected course
    const modulesResponse = await fetch(`${baseUrl}/courses/${selectedCourseId}/modules`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!modulesResponse.ok) {
      throw new Error('Failed to fetch modules');
    }

    const modules = await modulesResponse.json();
    const selectedModuleId = modules[0].id; // Select the first module or any specific module

    // Step 3: Fetch items for the selected module
    const moduleItemsResponse = await fetch(`${baseUrl}/courses/${selectedCourseId}/modules/${selectedModuleId}/items`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!moduleItemsResponse.ok) {
      throw new Error('Failed to fetch module items');
    }

    const moduleItems = await moduleItemsResponse.json();
    const selectedItemUrl = moduleItems[0].url; // Select the first file or any specific file

    // Step 4: Fetch the file download URL
    const fileResponse = await fetch(selectedItemUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!fileResponse.ok) {
      throw new Error('Failed to fetch file URL');
    }

    const fileData = await fileResponse.json();

    // Return the file download URL to the client
    return NextResponse.json({ url: fileData.url });
  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
  }
}
