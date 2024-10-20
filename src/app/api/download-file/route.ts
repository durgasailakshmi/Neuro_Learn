import { NextResponse } from 'next/server';
import archiver from 'archiver';
import stream from 'stream';

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

    // Initialize a ZIP archive
    const archive = archiver('zip', { zlib: { level: 9 } });
    const passThrough = new stream.PassThrough();

    // Pipe the archive data into the PassThrough stream
    archive.pipe(passThrough);

    // Step 2: Loop through all courses
    for (const course of courses) {
      const courseId = course.id;

      // Fetch modules for each course
      const modulesResponse = await fetch(`${baseUrl}/courses/${courseId}/modules`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!modulesResponse.ok) {
        console.warn(`Failed to fetch modules for course ${courseId}`);
        continue; // Skip this course if modules can't be fetched
      }

      const modules = await modulesResponse.json();

      // Step 3: Loop through all modules in the course
      for (const module of modules) {
        const moduleId = module.id;

        // Fetch items for each module
        const moduleItemsResponse = await fetch(`${baseUrl}/courses/${courseId}/modules/${moduleId}/items`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!moduleItemsResponse.ok) {
          console.warn(`Failed to fetch items for module ${moduleId}`);
          continue; // Skip this module if items can't be fetched
        }

        const moduleItems = await moduleItemsResponse.json();

        // Step 4: Loop through all module items and fetch each file
        for (const item of moduleItems) {
          if (item.url) {
            const fileResponse = await fetch(item.url, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            });

            if (fileResponse.ok) {
              const fileContent = await fileResponse.text(); // Assuming it's a text file, you may need to change this for binary files
              const fileName = `${course.name}/${module.name}/${item.title || item.id}.pdf`;
              archive.append(fileContent, { name: fileName });
            } else {
              console.warn(`Failed to fetch file for item ${item.id}`);
            }
          }
        }
      }
    }

    // Finalize the ZIP archive
    archive.finalize();

    // Step 5: Convert PassThrough to ReadableStream
    const readableStream = new ReadableStream({
      start(controller) {
        passThrough.on('data', (chunk) => controller.enqueue(chunk));
        passThrough.on('end', () => controller.close());
        passThrough.on('error', (err) => controller.error(err));
      },
    });

    // Return the ZIP file as a ReadableStream to the client
    return new NextResponse(readableStream, {
      headers: {
        'Content-Disposition': 'attachment; filename="canvas_files.zip"',
        'Content-Type': 'application/zip',
      },
    });
  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json({ error: 'Failed to download files' }, { status: 500 });
  }
}
