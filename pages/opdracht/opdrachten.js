import React, { useState, useEffect } from 'react';
import { Navbar, Footer } from '../../components/template';

export default function OpdrachtenPage() {
  const [opdrachten, setOpdrachten] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOpdracht, setSelectedOpdracht] = useState(null);

  useEffect(() => {
    const fetchOpdrachten = async () => {
      try {
        const res = await fetch('/api/opdracht/opdrachten'); // Make sure API path is correct
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Fout bij ophalen opdrachten');
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

      <div style={{ flex: 1, padding: '2rem' }}>
        <h1>Opdrachten</h1>

        {loading && <p>Laden...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          {opdrachten.map((opdracht) => (
            <div
              key={opdracht.id}
              className="card round white"
              style={{ padding: '1rem', cursor: 'pointer' }}
              onClick={() => setSelectedOpdracht(opdracht)}
            >
              <h3>{opdracht.title}</h3>
              <p>{opdracht.description.substring(0, 80)}...</p>
              <p>Prijs: €{opdracht.price}</p>
              <p>Status: {opdracht.status}</p>
            </div>
          ))}
        </div>
      </div>

      <Footer />

      {/* Modal */}
      {selectedOpdracht && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setSelectedOpdracht(null)} // click outside closes modal
        >
          <div
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              maxWidth: '600px',
              width: '90%',
              padding: '2rem',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setSelectedOpdracht(null)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'red',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Sluiten
            </button>

            <h2>{selectedOpdracht.title}</h2>
            <p><strong>Beschrijving:</strong> {selectedOpdracht.description}</p>
            <p><strong>Categorie:</strong> {selectedOpdracht.category || 'Geen'}</p>
            <p><strong>Prijs:</strong> €{selectedOpdracht.price}</p>
            <p><strong>Deadline:</strong> {new Date(selectedOpdracht.deadline).toLocaleDateString()}</p>
            <p><strong>Locatie:</strong> {selectedOpdracht.location || 'Geen'}</p>
            <p><strong>Status:</strong> {selectedOpdracht.status}</p>
            <p><strong>Aangemaakt:</strong> {new Date(selectedOpdracht.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}
