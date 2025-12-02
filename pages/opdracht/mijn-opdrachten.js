import React, { useState, useEffect } from 'react';
import { Navbar, Footer } from '../../components/template';

export default function MijnOpdrachtenPage() {
  const [opdrachten, setOpdrachten] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOpdracht, setSelectedOpdracht] = useState(null);
  const [user, setUser] = useState(null);
  const [newBid, setNewBid] = useState('');
  const [bids, setBids] = useState([]);
  const [bidLoading, setBidLoading] = useState(false);

  useEffect(() => {
    const fetchUser = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (err) {
          console.error('Error parsing user:', err);
        }
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchOpdrachten = async () => {
      try {
        const res = await fetch(`/api/opdracht/mijn-opdrachten?userId=${user.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Fout bij ophalen mijn opdrachten');
        setOpdrachten(data.opdrachten);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOpdrachten();
  }, [user]);

  const fetchBids = async (opdrachtId) => {
    try {
      const res = await fetch(`/api/bids?opdrachtId=${opdrachtId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fout bij ophalen biedingen');
      setBids(data.bids);
    } catch (err) {
      console.error(err.message);
      setBids([]);
    }
  };

  const handleBidSubmit = async () => {
    if (!newBid || Number(newBid) <= 0) return;
    setBidLoading(true);
    try {
      const res = await fetch('/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opdrachtId: selectedOpdracht.id,
          userId: user.id,
          amount: Number(newBid),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fout bij plaatsen bod');
      setNewBid('');
      fetchBids(selectedOpdracht.id);
    } catch (err) {
      alert(err.message);
    } finally {
      setBidLoading(false);
    }
  };

  const openModal = (opdracht) => {
    setSelectedOpdracht(opdracht);
    fetchBids(opdracht.id);
  };

  return (
    <div className="theme-l5" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ flex: 1, padding: '2rem' }}>
        <h1>Mijn Opdrachten</h1>
        {loading && <p>Laden...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          {opdrachten.map((opdracht) => (
            <div
              key={opdracht.id}
              className="card round white"
              style={{ padding: '1rem', cursor: 'pointer' }}
              onClick={() => openModal(opdracht)}
            >
              <h3>{opdracht.title}</h3>
              <p>{opdracht.description.substring(0, 80)}...</p>
              <p>Deadline: {new Date(opdracht.deadline).toLocaleDateString()}</p>
              <p>Status: {opdracht.status}</p>
            </div>
          ))}
        </div>
      </div>

      <Footer />

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
          onClick={() => setSelectedOpdracht(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              maxWidth: '600px',
              width: '90%',
              padding: '2rem',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
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

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Basis Informatie</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <p><strong>Beschrijving:</strong> {selectedOpdracht.description}</p>
                <p><strong>Categorie:</strong> {selectedOpdracht.category || 'Geen'}</p>
                <p><strong>Deadline:</strong> {new Date(selectedOpdracht.deadline).toLocaleDateString()}</p>
                <p><strong>Status:</strong> {selectedOpdracht.status}</p>
                <p><strong>Aangemaakt:</strong> {new Date(selectedOpdracht.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Locatie</h4>
              <p><strong>Locatie:</strong> {selectedOpdracht.location_city ? `${selectedOpdracht.location_city}, ${selectedOpdracht.location_address}, ${selectedOpdracht.location_postcode}` : 'Geen'}</p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Opbouw Tijd</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <p><strong>Datum:</strong> {selectedOpdracht.opbouw_date ? new Date(selectedOpdracht.opbouw_date).toLocaleDateString() : 'Niet opgegeven'}</p>
                <p><strong>Tijd:</strong> {selectedOpdracht.opbouw_time || 'Niet opgegeven'}</p>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Opbouw Details</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <p><strong>Hard Opbouw:</strong> {selectedOpdracht.hard_opbouw || 'Niet opgegeven'}</p>
                <p><strong>Dagen Aantal:</strong> {selectedOpdracht.opbouw_dagen_amount || 'Niet opgegeven'}</p>
                <p><strong>Mannen Nodig:</strong> {selectedOpdracht.opbouw_men_needed || 'Niet opgegeven'}</p>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Afbouw Details</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <p><strong>Datum:</strong> {selectedOpdracht.planning_afbouw_date ? new Date(selectedOpdracht.planning_afbouw_date).toLocaleDateString() : 'Niet opgegeven'}</p>
                <p><strong>Tijd:</strong> {selectedOpdracht.planning_afbouw_time || 'Niet opgegeven'}</p>
                <p><strong>Hard Afbouw:</strong> {selectedOpdracht.hard_afbouw || 'Niet opgegeven'}</p>
                <p><strong>Dagen Aantal:</strong> {selectedOpdracht.afbouw_dagen_amount || 'Niet opgegeven'}</p>
                <p><strong>Mannen Nodig:</strong> {selectedOpdracht.afbouw_men_needed || 'Niet opgegeven'}</p>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Transport</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <p><strong>Opbouw Type:</strong> {selectedOpdracht.opbouw_transport_type || 'Niet opgegeven'}</p>
                <p><strong>Opbouw Aantal:</strong> {selectedOpdracht.opbouw_transport_amount || 'Niet opgegeven'}</p>
                <p><strong>Afbouw Type:</strong> {selectedOpdracht.afbouw_transport_type || 'Niet opgegeven'}</p>
                <p><strong>Afbouw Aantal:</strong> {selectedOpdracht.afbouw_transport_amount || 'Niet opgegeven'}</p>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Hoogwerkers</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <p><strong>Opbouw Type:</strong> {selectedOpdracht.opbouw_hoogwerkers_type || 'Niet opgegeven'}</p>
                <p><strong>Opbouw Aantal:</strong> {selectedOpdracht.opbouw_hoogwerkers_amount || 'Niet opgegeven'}</p>
                <p><strong>Afbouw Type:</strong> {selectedOpdracht.afbouw_hoogwerkers_type || 'Niet opgegeven'}</p>
                <p><strong>Afbouw Aantal:</strong> {selectedOpdracht.afbouw_hoogwerkers_amount || 'Niet opgegeven'}</p>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Links en Opslag</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <p><strong>Magazijnbon Link:</strong> {selectedOpdracht.magazijnbon_link ? <a href={selectedOpdracht.magazijnbon_link} target="_blank" rel="noopener noreferrer">Bekijk</a> : 'Niet opgegeven'}</p>
                <p><strong>Project Map Opbouw Link:</strong> {selectedOpdracht.project_map_opbouw_link ? <a href={selectedOpdracht.project_map_opbouw_link} target="_blank" rel="noopener noreferrer">Bekijk</a> : 'Niet opgegeven'}</p>
                <p><strong>Project Map Afbouw Link:</strong> {selectedOpdracht.project_map_afbouw_link ? <a href={selectedOpdracht.project_map_afbouw_link} target="_blank" rel="noopener noreferrer">Bekijk</a> : 'Niet opgegeven'}</p>
                <p><strong>Storageplace Adres:</strong> {selectedOpdracht.storageplace_adres || 'Niet opgegeven'}</p>
              </div>
            </div>

            {!user?.is_poster && (
              <div style={{ marginTop: '1rem' }}>
                <h3>Plaats je bod</h3>
                <input
                  type="number"
                  value={newBid}
                  onChange={(e) => setNewBid(e.target.value)}
                  placeholder="Bedrag (€)"
                  style={{ padding: '0.5rem', width: '100%', marginBottom: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <button
                  onClick={handleBidSubmit}
                  disabled={bidLoading}
                  style={{ padding: '0.5rem 1rem', backgroundColor: '#51cf66', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  {bidLoading ? 'Bezig...' : 'Bod plaatsen'}
                </button>

                <h4 style={{ marginTop: '1rem' }}>Biedingen</h4>
                {bids.length === 0 ? (
                  <p>Nog geen biedingen</p>
                ) : (
                  <ul>
                    {bids.map((bid) => (
                      <li key={bid.id}>€{bid.amount} door {bid.user_name}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
