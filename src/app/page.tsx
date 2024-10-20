"use client";
import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchAndDownloadFile = async () => {
    setLoading(true);
    setError(null);

    try {
      // Call the API route to start the multi-step process
      const response = await fetch('/api/download-file');

      if (!response.ok) {
        throw new Error('Failed to start file download process');
      }

      const data = await response.json(); // Expecting a URL from the server response

      // Use the final URL to download the file
      const downloadUrl = data.url;
      const fileResponse = await fetch(downloadUrl);

      if (!fileResponse.ok) {
        throw new Error('Failed to download file');
      }

      // Convert response to Blob and trigger download
      const blob = await fileResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'file.pdf'); // Set the default filename
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
      <h1>Download File from Canvas</h1>
      <button onClick={fetchAndDownloadFile} disabled={loading}>
        {loading ? 'Fetching File...' : 'Download File'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
