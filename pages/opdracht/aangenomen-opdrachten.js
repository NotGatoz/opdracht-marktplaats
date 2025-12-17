import React, { useState, useEffect } from 'react';
import { Navbar, Footer } from '../../components/template';

export default function AangenomenOpdrachtenPage() {
  const [gebodenOpdrachten, setGebodenOpdrachten] = useState([]);
  const [aangenomenOpdrachten, setAangenomenOpdrachten] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOpdracht, setSelectedOpdracht] = useState(null);
  const [user, setUser] = useState(null);
  const [newBid, setNewBid] = useState('');
  const [bids, setBids] = useState([]);
  const [bidLoading, setBidLoading] = useState(false);
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageLoading, setMessageLoading] = useState(false);

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
      setLoading(true);
      try {
        // Fetch geboden opdrachten
        const gebodenRes = await fetch(`/api/opdracht/aangenomen-opdrachten?userId=${user.id}&type=geboden`);
        const gebodenData = await gebodenRes.json();
        if (!gebodenRes.ok) throw new Error(gebodenData.error || 'Fout bij ophalen geboden opdrachten');
        setGebodenOpdrachten(gebodenData.opdrachten);

        // Fetch aangenomen opdrachten
        const aangenomenRes = await fetch(`/api/opdracht/aangenomen-opdrachten?userId=${user.id}&type=aangenomen`);
        const aangenomenData = await aangenomenRes.json();
        if (!aangenomenRes.ok) throw new Error(aangenomenData.error || 'Fout bij ophalen aangenomen opdrachten');
        setAangenomenOpdrachten(aangenomenData.opdrachten);
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

  useEffect(() => {
    if (showMessagePopup && selectedOpdracht) {
      fetchMessages();
    }
  }, [showMessagePopup, selectedOpdracht]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages/get?opdrachtId=${selectedOpdracht.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fout bij ophalen berichten');
      setMessages(data.messages);
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    setMessageLoading(true);
    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opdrachtId: selectedOpdracht.id,
          userId: user.id,
          message: newMessage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fout bij verzenden bericht');
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      alert(err.message);
    } finally {
      setMessageLoading(false);
    }
  };

  return (
    <div className="theme-l5" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ flex: 1, padding: '2rem', marginTop: '80px' }}>
        <h1>Geboden en Aangenomen Opdrachten</h1>
        {loading && <p>Laden...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '2rem' }}>
          {/* Left side: Geboden opdrachten */}
          <div style={{ flex: 1, backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
            <h2>Geboden Opdrachten</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              {gebodenOpdrachten.length === 0 ? (
                <p>Je hebt nog op geen opdrachten geboden</p>
              ) : (
                gebodenOpdrachten.map((opdracht) => (
                  <div
                    key={opdracht.id}
                    className="card round white"
                    style={{ padding: '1rem', cursor: 'pointer' }}
                    onClick={() => openModal(opdracht)}
                  >
                    <h3>{opdracht.title}</h3>
                    <p>{opdracht.description.substring(0, 80)}...</p>
                    <p>Deadline: {new Date(opdracht.deadline).toLocaleDateString()}</p>
                    <p>Status: <span style={{ color: opdracht.status === 'aangenomen' ? 'green' : 'inherit' }}>{opdracht.status}</span></p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right side: Aangenomen opdrachten */}
          <div style={{ flex: 1, backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
            <h2>Aangenomen Opdrachten</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              {aangenomenOpdrachten.map((opdracht) => (
                <div
                  key={opdracht.id}
                  className="card round white"
                  style={{ padding: '1rem', cursor: 'pointer' }}
                  onClick={() => openModal(opdracht)}
                >
                  <h3>{opdracht.title}</h3>
                  <p>{opdracht.description.substring(0, 80)}...</p>
                  <p>Deadline: {new Date(opdracht.deadline).toLocaleDateString()}</p>
                  <p>Status: <span style={{ color: opdracht.status === 'aangenomen' ? 'green' : 'inherit' }}>{opdracht.status}</span></p>
                </div>
              ))}
            </div>
          </div>
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
              maxWidth: '1000px',
              width: '95%',
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

            <h2 style={{ marginBottom: '1.5rem' }}>{selectedOpdracht.title}</h2>

            <div style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              marginBottom: '1.5rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <h4 style={{ marginTop: 0, marginBottom: '1rem', color: '#333' }}>Basis Informatie</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Beschrijving:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.description}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Categorie:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.category || 'Geen'}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Deadline:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{new Date(selectedOpdracht.deadline).toLocaleDateString()}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Status:</strong></p>
                  <p style={{ margin: '0', color: selectedOpdracht.status === 'aangenomen' ? 'green' : '#333' }}>{selectedOpdracht.status}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Aangemaakt:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{new Date(selectedOpdracht.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              marginBottom: '1.5rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <h4 style={{ marginTop: 0, marginBottom: '1rem', color: '#333' }}>Locatie</h4>
              <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.location_city ? `${selectedOpdracht.location_city}, ${selectedOpdracht.location_address}, ${selectedOpdracht.location_postcode}` : 'Geen'}</p>
            </div>

            <div style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              marginBottom: '1.5rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <h4 style={{ marginTop: 0, marginBottom: '1rem', color: '#333' }}>Opbouw</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Datum:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.opbouw_date ? new Date(selectedOpdracht.opbouw_date).toLocaleDateString() : 'Niet opgegeven'}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Tijd:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.opbouw_time || 'Niet opgegeven'}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Hard Opbouw:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.hard_opbouw || 'Niet opgegeven'}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Dagen Aantal:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.opbouw_dagen_amount || 'Niet opgegeven'}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Mannen Nodig:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.opbouw_men_needed || 'Niet opgegeven'}</p>
                </div>
              </div>
            </div>

            <div style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              marginBottom: '1.5rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <h4 style={{ marginTop: 0, marginBottom: '1rem', color: '#333' }}>Afbouw</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Datum:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.planning_afbouw_date ? new Date(selectedOpdracht.planning_afbouw_date).toLocaleDateString() : 'Niet opgegeven'}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Tijd:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.planning_afbouw_time || 'Niet opgegeven'}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Hard Afbouw:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.hard_afbouw || 'Niet opgegeven'}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Dagen Aantal:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.afbouw_dagen_amount || 'Niet opgegeven'}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Mannen Nodig:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.afbouw_men_needed || 'Niet opgegeven'}</p>
                </div>
              </div>
            </div>

            <div style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              marginBottom: '1.5rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <h4 style={{ marginTop: 0, marginBottom: '1rem', color: '#333' }}>Transport</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Opbouw Type:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.opbouw_transport_type || 'Niet opgegeven'}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Opbouw Aantal:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.opbouw_transport_amount || 'Niet opgegeven'}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Afbouw Type:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.afbouw_transport_type || 'Niet opgegeven'}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Afbouw Aantal:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.afbouw_transport_amount || 'Niet opgegeven'}</p>
                </div>
              </div>
            </div>

            <div style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              marginBottom: '1.5rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <h4 style={{ marginTop: 0, marginBottom: '1rem', color: '#333' }}>Hoogwerkers</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Opbouw Type:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.opbouw_hoogwerkers_type || 'Niet opgegeven'}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Opbouw Aantal:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.opbouw_hoogwerkers_amount || 'Niet opgegeven'}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Afbouw Type:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.afbouw_hoogwerkers_type || 'Niet opgegeven'}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Afbouw Aantal:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.afbouw_hoogwerkers_amount || 'Niet opgegeven'}</p>
                </div>
              </div>
            </div>

            <div style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              marginBottom: '1.5rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <h4 style={{ marginTop: 0, marginBottom: '1rem', color: '#333' }}>Links en Opslag</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Magazijnbon Link:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.magazijnbon_link ? <a href={selectedOpdracht.magazijnbon_link} target="_blank" rel="noopener noreferrer">Bekijk</a> : 'Niet opgegeven'}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Project Map Opbouw Link:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.project_map_opbouw_link ? <a href={selectedOpdracht.project_map_opbouw_link} target="_blank" rel="noopener noreferrer">Bekijk</a> : 'Niet opgegeven'}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Project Map Afbouw Link:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.project_map_afbouw_link ? <a href={selectedOpdracht.project_map_afbouw_link} target="_blank" rel="noopener noreferrer">Bekijk</a> : 'Niet opgegeven'}</p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}><strong>Storageplace Adres:</strong></p>
                  <p style={{ margin: '0', color: '#333' }}>{selectedOpdracht.storageplace_adres || 'Niet opgegeven'}</p>
                </div>
              </div>
            </div>

            {((selectedOpdracht.images && selectedOpdracht.images.length > 0) || (selectedOpdracht.pdfs && selectedOpdracht.pdfs.length > 0)) && (
              <div style={{ 
                backgroundColor: 'white', 
                padding: '1.5rem', 
                borderRadius: '8px', 
                marginBottom: '1.5rem',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                <h4 style={{ marginTop: 0, marginBottom: '1rem', color: '#333' }}>Bijlagen</h4>
                {selectedOpdracht.images && selectedOpdracht.images.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h5 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Afbeeldingen:</h5>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {selectedOpdracht.images.map((image, index) => (
                        <img
                          key={index}
                          src={`data:image/jpeg;base64,${image}`}
                          alt={`Afbeelding ${index + 1}`}
                          style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {selectedOpdracht.pdfs && selectedOpdracht.pdfs.length > 0 && (
                  <div>
                    <h5 style={{ marginTop: 0, marginBottom: '0.5rem' }}>PDFs:</h5>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {selectedOpdracht.pdfs.map((pdf, index) => (
                        <a
                          key={index}
                          href={`/api/opdracht/pdf?id=${selectedOpdracht.id}&index=${index}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}
                        >
                          {selectedOpdracht.pdf_filenames && selectedOpdracht.pdf_filenames[index] ? selectedOpdracht.pdf_filenames[index] : `PDF ${index + 1} bekijken`}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              marginBottom: '1.5rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <h4 style={{ marginTop: 0, marginBottom: '1rem', color: '#333' }}>Biedingen</h4>
              {bids.length === 0 ? (
                <p style={{ margin: '0', color: '#333' }}>Nog geen biedingen</p>
              ) : (
                <ul style={{ margin: '0', paddingLeft: '1.5rem' }}>
                  {bids.map((bid) => (
                    <li key={bid.id} style={{ color: '#333', marginBottom: '0.5rem' }}>€{bid.amount} door {bid.user_name} ({new Date(bid.created_at).toLocaleDateString()}){bid.comment && ` - ${bid.comment}`}</li>
                  ))}
                </ul>
              )}
            </div>

            <div style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <button
                onClick={() => setShowMessagePopup(true)}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Contact
              </button>
            </div>
          </div>
        </div>
      )}

      {showMessagePopup && (
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
            zIndex: 1001,
          }}
          onClick={() => setShowMessagePopup(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              maxWidth: '500px',
              width: '90%',
              padding: '2rem',
              position: 'relative',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            <button
              onClick={() => setShowMessagePopup(false)}
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

            <h3>Contact Opdrachtgever</h3>

            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Typ je bericht..."
              style={{ padding: '0.5rem', width: '100%', marginBottom: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }}
            />
            <button
              onClick={handleSendMessage}
              disabled={messageLoading}
              style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              {messageLoading ? 'Verzenden...' : 'Verzenden'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
