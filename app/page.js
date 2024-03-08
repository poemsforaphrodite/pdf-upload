'use client';

import { useState } from 'react';

export default function Home() {
  const [pdfUrl, setPdfUrl] = useState('');
  const [fileStoreUrl, setFileStoreUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/upload-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pdfUrl }),
    });
    const data = await response.json();
    setFileStoreUrl(data.fileStoreUrl);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={pdfUrl}
          onChange={(e) => setPdfUrl(e.target.value)}
          placeholder="Enter PDF URL"
        />
        <button type="submit">Upload</button>
      </form>
      {fileStoreUrl && <p>File Store URL: {fileStoreUrl}</p>}
    </div>
  );
}
