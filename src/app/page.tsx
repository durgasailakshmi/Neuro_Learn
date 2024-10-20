"use client";
import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchAndDownloadZip = async () => {
    setLoading(true);
    setError(null);

    try {
      // Call the API route to start the process of downloading a ZIP file
      const response = await fetch('/api/download-file');

      if (!response.ok) {
        throw new Error('Failed to start file download process');
      }

      // Get the ZIP file as a Blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'canvas_files.zip'); // Set the default ZIP filename
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      setError("Error downloading file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Download All Files as ZIP</h1>
      <button onClick={fetchAndDownloadZip} disabled={loading}>
        {loading ? 'Fetching Files...' : 'Download ZIP'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
