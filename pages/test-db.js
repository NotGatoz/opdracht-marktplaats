import React, { useEffect, useState } from 'react';

export default function TestDB() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchDB = async () => {
      try {
        const res = await fetch('/api/test-db');
        const json = await res.json();
        setData(json);
      } catch (err) {
        setData({ success: false, error: err.message });
      }
    };
    fetchDB();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>Database Test</h2>
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
