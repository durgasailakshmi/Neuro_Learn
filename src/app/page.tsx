"use client";
import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAndDownloadZip = async () => {
    setLoading(true);
    setError(null);

    try {
      // Call the API route to generate and download the zip file
      const response = await fetch('/api/download-file');

      if (!response.ok) {
        throw new Error('Failed to generate zip file');
      }

      // Convert response to Blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'canvas_files.zip'); // Download the zip file
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Download Course Files as Zip</h1>
      <button onClick={fetchAndDownloadZip} disabled={loading}>
        {loading ? 'Generating Zip...' : 'Download Zip'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
