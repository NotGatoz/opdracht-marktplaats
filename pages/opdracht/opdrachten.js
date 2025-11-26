import React, { useEffect, useState } from 'react';
import { Navbar, Footer } from '../../components/template';

export default function OpdrachtenPage() {
  const [opdrachten, setOpdrachten] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOpdrachten = async () => {
      try {
        const res = await fetch('/api/opdracht/opdrachten');
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Fout bij ophalen opdrachten');
        }

        setOpdrachten(data.opdrachten);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOpdrachten();
  }, []);

  return (
    <div className="theme-l5" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ flex: 1, padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Alle Opdrachten</h1>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && opdrachten.length === 0 && <p>Er zijn nog geen opdrachten geplaatst.</p>}

        {!loading && opdrachten.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {opdrachten.map((opdracht) => (
              <div
                key={opdracht.id}
                className="card round white"
                style={{ padding: '1rem', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
              >
                <h3>{opdracht.title}</h3>
                <p><b>Categorie:</b> {opdracht.category || 'Niet gespecificeerd'}</p>
                <p><b>Prijs:</b> €{opdracht.price}</p>
                <p><b>Deadline:</b> {new Date(opdracht.deadline).toLocaleDateString()}</p>
                {opdracht.location && <p><b>Locatie:</b> {opdracht.location}</p>}
                <p style={{ fontSize: '0.85rem', color: '#666' }}>
                  Gepubliceerd: {new Date(opdracht.created_at).toLocaleString()}
                </p>
                <p><b>Status:</b> {opdracht.status}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
