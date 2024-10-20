"use client"
import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchFileIdAndDownload = async () => {
    setLoading(true);
    setError(null);

    try {
      // Call the API route
      const response = await fetch('/api/download-file'); // Call your server-side API

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      // Convert response to Blob and trigger download
      const blob = await response.blob();
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
      <button onClick={fetchFileIdAndDownload} disabled={loading}>
        {loading ? 'Fetching File...' : 'Download File'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
