import React, { useState } from 'react';

export default function UploadForm({ email }){
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  const submit = async () => {
    if (!email) return alert('Enter email in dashboard first (use landing page).');
    if (!title || !url) return alert('Enter title and URL');
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, url, email })
    });
    const data = await res.json();
    if (data.ok) {
      setTitle(''); setUrl('');
      alert('Uploaded — appears on leaderboard');
    } else {
      alert('Upload failed');
    }
  };

  return (
    <div style={{marginTop:16}}>
      <h3>Upload Entry</h3>
      <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
      <input placeholder="URL" value={url} onChange={e=>setUrl(e.target.value)} />
      <button onClick={submit}>Upload</button>
    </div>
  );
}
