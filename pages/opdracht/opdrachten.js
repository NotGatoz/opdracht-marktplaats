import React, { useState, useEffect } from 'react';
import { Navbar, Footer } from '../../components/template';

export default function OpdrachtenPage() {
  const [opdrachten, setOpdrachten] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOpdracht, setSelectedOpdracht] = useState(null);
  const [user, setUser] = useState(null);
  const [newBid, setNewBid] = useState('');
  const [bidComment, setBidComment] = useState('');
  const [bids, setBids] = useState([]);
  const [bidLoading, setBidLoading] = useState(false);
  const [hasBid, setHasBid] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('');
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
    const fetchOpdrachten = async () => {
      try {
        const userId = user?.id;
        const url = userId ? `/api/opdracht/opdrachten?userId=${userId}` : '/api/opdracht/opdrachten';
        const res = await fetch(url);
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
  }, [user]);

  const fetchBids = async (opdrachtId) => {
    try {
      const res = await fetch(`/api/bids?opdrachtId=${opdrachtId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fout bij ophalen biedingen');
      setBids(data.bids);
      setHasBid(data.bids.some(bid => bid.user_id == user?.id));
    } catch (err) {
      console.error(err.message);
      setBids([]);
      setHasBid(false);
    }
  };

  const handleBidSubmit = async () => {
    if (!newBid || Number(newBid) <= 0) return;
    // Check if user has already bid to prevent frontend submission
    if (bids.some(bid => bid.user_id == user?.id)) {
      alert('Je hebt al een bod geplaatst op deze opdracht');
      return;
    }
    setBidLoading(true);
    try {
      const res = await fetch('/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opdrachtId: selectedOpdracht.id,
          userId: user.id,
          amount: Number(newBid),
          comment: bidComment,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fout bij plaatsen bod');
      setNewBid('');
      setBidComment('');
      fetchBids(selectedOpdracht.id); // Refresh bids after successful submission
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

  const fetchOpdrachten = async () => {
    try {
      const userId = user?.id;
      const url = userId ? `/api/opdracht/opdrachten?userId=${userId}` : '/api/opdracht/opdrachten';
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fout bij ophalen opdrachten');
      setOpdrachten(data.opdrachten);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBidAction = async (action, bidId) => {
    try {
      const res = await fetch('/api/bid-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          bidId,
          opdrachtId: selectedOpdracht.id,
          userId: user?.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fout bij actie');
      fetchBids(selectedOpdracht.id); // Refresh bids
      fetchOpdrachten(); // Refresh opdrachten to update "geboden" indicator
    } catch (err) {
      alert(err.message);
    }
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
      fetchMessages(); // Refresh messages
    } catch (err) {
      alert(err.message);
    } finally {
      setMessageLoading(false);
    }
  };



  const filteredOpdrachten = opdrachten
    .filter((opdracht) => {
      if (opdracht.status === 'aangenomen') return false;

      const matchesSearch = searchQuery === '' ||
        opdracht.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opdracht.description.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      switch (selectedFilter) {
        case 'geboden':
          return opdracht.total_bid_count > 0;
        case 'nog niet geboden':
          return opdracht.total_bid_count == 0; // Use loose equality to handle string "0"
        case 'ik geboden':
          return user && opdracht.user_bid_count > 0;
        case 'nieuw':
          return true; // Will be sorted later
        case 'oud':
          return true; // Will be sorted later
        default:
          return true;
      }
    })
    .sort((a, b) => {
      if (selectedFilter === 'nieuw') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (selectedFilter === 'oud') {
        return new Date(a.created_at) - new Date(b.created_at);
      }
      return 0; // Default order
    });

  return (
    <div className="theme-l5" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ flex: 1, padding: '2rem', marginTop: '80px' }}>
        <h1>Opdrachten</h1>
        {loading && <p>Laden...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Zoek opdrachten..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '0.5rem', width: '100%', marginBottom: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            style={{ padding: '0.5rem', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="">Alle opdrachten</option>
            <option value="geboden">Geboden</option>
            <option value="nog niet geboden">Nog niet geboden</option>
            <option value="ik geboden">Ik heb geboden</option>
            <option value="nieuw">Nieuw</option>
            <option value="oud">Oud</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          {filteredOpdrachten.map((opdracht) => (
            <div
              key={opdracht.id}
              className="card round white"
              style={{ padding: '1rem', cursor: 'pointer', position: 'relative' }}
              onClick={() => openModal(opdracht)}
            >
              <h3>{opdracht.title}</h3>
              <p>{opdracht.description.substring(0, 80)}...</p>
              <p>Deadline: {new Date(opdracht.deadline).toLocaleDateString()}</p>
              <p>Status: {opdracht.status}</p>
              {opdracht.total_bid_count > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  color: 'red',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  geboden
                </div>
              )}
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

            {((selectedOpdracht.images && selectedOpdracht.images.length > 0) || (selectedOpdracht.pdfs && selectedOpdracht.pdfs.length > 0)) && (
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Bijlagen</h4>
                {selectedOpdracht.images && selectedOpdracht.images.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <h5>Afbeeldingen:</h5>
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
                    <h5>PDFs:</h5>
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



            {!user?.is_poster && (
              <div style={{ marginTop: '1rem' }}>
                <button
                  onClick={() => setShowMessagePopup(true)}
                  style={{ padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '0.5rem' }}
                >
                  Contact
                </button>
                {hasBid ? (
                  <button
                    onClick={() => {
                      if (confirm('Weet je zeker dat je je bod wilt verwijderen?')) {
                        handleBidAction('ignore', null);
                      }
                    }}
                    style={{ padding: '0.5rem 1rem', backgroundColor: '#ff6b6b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Bod verwijderen
                  </button>
                ) : (
                  <>
                    <h3>Plaats je bod</h3>
                    <input
                      type="number"
                      value={newBid}
                      onChange={(e) => setNewBid(e.target.value)}
                      placeholder="Bedrag (€)"
                      style={{ padding: '0.5rem', width: '100%', marginBottom: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <textarea
                      value={bidComment}
                      onChange={(e) => setBidComment(e.target.value)}
                      placeholder="Opmerking (optioneel)"
                      style={{ padding: '0.5rem', width: '100%', marginBottom: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', minHeight: '60px' }}
                    />
                    <button
                      onClick={handleBidSubmit}
                      disabled={bidLoading}
                      style={{ padding: '0.5rem 1rem', backgroundColor: '#51cf66', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      {bidLoading ? 'Bezig...' : 'Bod plaatsen'}
                    </button>
                  </>
                )}
              </div>
            )}
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
