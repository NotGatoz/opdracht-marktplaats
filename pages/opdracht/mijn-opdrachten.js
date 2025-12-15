
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
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);

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

  const handleBidAction = async (action, bidId) => {
    try {
      const res = await fetch('/api/bid-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          bidId,
          opdrachtId: selectedOpdracht.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fout bij actie');
      fetchBids(selectedOpdracht.id); // Refresh bids
      // Refresh opdrachten to update status
      const fetchOpdrachten = async () => {
        try {
          const res = await fetch(`/api/opdracht/mijn-opdrachten?userId=${user.id}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Fout bij ophalen mijn opdrachten');
          setOpdrachten(data.opdrachten);
          // Update selectedOpdracht if it's still selected
          const updatedOpdracht = data.opdrachten.find(op => op.id === selectedOpdracht.id);
          if (updatedOpdracht) {
            setSelectedOpdracht(updatedOpdracht);
          }
        } catch (err) {
          console.error(err.message);
        }
      };
      fetchOpdrachten();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteOpdracht = async () => {
    if (!deleteModal) return;
    setDeleteLoading(true);
    try {
      const res = await fetch('/api/opdracht/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deleteModal.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fout bij verwijderen opdracht');
      // Refresh opdrachten list
      const fetchOpdrachten = async () => {
        try {
          const res = await fetch(`/api/opdracht/mijn-opdrachten?userId=${user.id}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Fout bij ophalen mijn opdrachten');
          setOpdrachten(data.opdrachten);
        } catch (err) {
          console.error(err.message);
        }
      };
      fetchOpdrachten();
      setDeleteModal(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEditModal = (opdracht) => {
    setEditModal(opdracht);
    setEditFormData({
      title: opdracht.title || '',
      description: opdracht.description || '',
      category: opdracht.category || '',
      deadline: opdracht.deadline ? opdracht.deadline.split('T')[0] : '',
      location_address: opdracht.location_address || '',
      location_city: opdracht.location_city || '',
      location_postcode: opdracht.location_postcode || '',
      opbouw_date: opdracht.opbouw_date ? opdracht.opbouw_date.split('T')[0] : '',
      opbouw_time: opdracht.opbouw_time || '',
      hard_opbouw: opdracht.hard_opbouw || '',
      opbouw_dagen_amount: opdracht.opbouw_dagen_amount || '',
      opbouw_men_needed: opdracht.opbouw_men_needed || '',
      planning_afbouw_date: opdracht.planning_afbouw_date ? opdracht.planning_afbouw_date.split('T')[0] : '',
      planning_afbouw_time: opdracht.planning_afbouw_time || '',
      hard_afbouw: opdracht.hard_afbouw || '',
      afbouw_dagen_amount: opdracht.afbouw_dagen_amount || '',
      afbouw_men_needed: opdracht.afbouw_men_needed || '',
      opbouw_transport_type: opdracht.opbouw_transport_type || '',
      opbouw_transport_amount: opdracht.opbouw_transport_amount || '',
      afbouw_transport_type: opdracht.afbouw_transport_type || '',
      afbouw_transport_amount: opdracht.afbouw_transport_amount || '',
      opbouw_hoogwerkers_type: opdracht.opbouw_hoogwerkers_type || '',
      opbouw_hoogwerkers_amount: opdracht.opbouw_hoogwerkers_amount || '',
      afbouw_hoogwerkers_type: opdracht.afbouw_hoogwerkers_type || '',
      afbouw_hoogwerkers_amount: opdracht.afbouw_hoogwerkers_amount || '',
      magazijnbon_link: opdracht.magazijnbon_link || '',
      project_map_opbouw_link: opdracht.project_map_opbouw_link || '',
      project_map_afbouw_link: opdracht.project_map_afbouw_link || '',
      storageplace_adres: opdracht.storageplace_adres || '',
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = async () => {
    if (!editModal) return;
    setEditLoading(true);
    try {
      const res = await fetch('/api/opdracht/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editModal.id,
          ...editFormData
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fout bij bijwerken opdracht');
      
      // Refresh opdrachten list
      const fetchOpdrachten = async () => {
        try {
          const res = await fetch(`/api/opdracht/mijn-opdrachten?userId=${user.id}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Fout bij ophalen mijn opdrachten');
          setOpdrachten(data.opdrachten);
          // Update selectedOpdracht if it's still selected
          const updatedOpdracht = data.opdrachten.find(op => op.id === editModal.id);
          if (updatedOpdracht) {
            setSelectedOpdracht(updatedOpdracht);
          }
        } catch (err) {
          console.error(err.message);
        }
      };
      fetchOpdrachten();
      setEditModal(null);
      alert('Opdracht succesvol bijgewerkt!');
    } catch (err) {
      alert(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleCompleteOpdracht = async () => {
    if (!editModal && !selectedOpdracht) return;
    const opdrachtId = editModal ? editModal.id : selectedOpdracht.id;
    setCompleteLoading(true);
    try {
      const res = await fetch('/api/opdracht/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: opdrachtId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fout bij voltooien opdracht');
      
      // Refresh opdrachten list
      const fetchOpdrachten = async () => {
        try {
          const res = await fetch(`/api/opdracht/mijn-opdrachten?userId=${user.id}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Fout bij ophalen mijn opdrachten');
          setOpdrachten(data.opdrachten);
        } catch (err) {
          console.error(err.message);
        }
      };
      fetchOpdrachten();
      setEditModal(null);
      setSelectedOpdracht(null);
      alert('Opdracht is voltooid!');
    } catch (err) {
      alert(err.message);
    } finally {
      setCompleteLoading(false);
    }
  };

  return (
    <div className="theme-l5" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ flex: 1, padding: '2rem', marginTop: '80px' }}>
        <h1>Mijn Geplaatste Opdrachten</h1>
        {loading && <p>Laden...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          {opdrachten.map((opdracht) => (
            <div
              key={opdracht.id}
              className="card round white"
              style={{ padding: '1rem', cursor: 'pointer', position: 'relative' }}
              onClick={() => openModal(opdracht)}
            >
              <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(opdracht);
                  }}
                  style={{
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  Bewerken
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteModal(opdracht);
                  }}
                  style={{
                    background: 'red',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  Verwijderen
                </button>
              </div>
              <h3>{opdracht.title}</h3>
              <p>{opdracht.description.substring(0, 80)}...</p>
              <p>Deadline: {new Date(opdracht.deadline).toLocaleDateString()}</p>
              <p>Status: <span style={{ color: opdracht.status === 'aangenomen' ? 'green' : 'inherit' }}>{opdracht.status}</span></p>
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
                <p><strong>Status:</strong> <span style={{ color: selectedOpdracht.status === 'aangenomen' ? 'green' : 'inherit' }}>{selectedOpdracht.status}</span></p>
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

            <div style={{ marginTop: '1rem' }}>
              <h4>Biedingen</h4>
              {(selectedOpdracht.status === 'aangenomen' || selectedOpdracht.status === 'voltooid') && (
                <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f0f8f0', border: '1px solid #4CAF50', borderRadius: '4px' }}>
                  <p style={{ color: 'green', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
                    {selectedOpdracht.status === 'voltooid' ? 'Deze opdracht is voltooid' : 'Deze opdracht heeft een toegewezen gebruiker'}
                  </p>
                  {selectedOpdracht.status !== 'voltooid' && (
                    <button
                      onClick={() => handleBidAction('remove', null)}
                      style={{ background: 'red', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Ontkoppel aannemer van bod
                    </button>
                  )}
                </div>
              )}
              {bids.length === 0 ? (
                <p>Nog geen biedingen</p>
              ) : (
                <div>
                  {bids.map((bid) => (
                    <div key={bid.id} style={{ marginBottom: '0.5rem', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}>
                      <p>€{bid.amount} door {bid.user_name} ({new Date(bid.created_at).toLocaleDateString()}){bid.comment && ` - ${bid.comment}`}</p>
                      {selectedOpdracht.status !== 'aangenomen' && selectedOpdracht.status !== 'voltooid' && (
                        <>
                          <button
                            onClick={() => handleBidAction('accept', bid.id)}
                            style={{ marginRight: '0.5rem', background: 'green', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Accepteer bod
                          </button>
                          <button
                            onClick={() => handleBidAction('ignore', bid.id)}
                            style={{ background: 'red', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Verwijder bod
                          </button>
                        </>
                      )}
                      {(selectedOpdracht.status === 'aangenomen' || selectedOpdracht.status === 'voltooid') && selectedOpdracht.accepted_bid_user_id == bid.user_id && (
                        <p style={{ color: 'green', fontWeight: 'bold' }}>Dit bod is geaccepteerd</p>
                      )}
                      {selectedOpdracht.status === 'aangenomen' && selectedOpdracht.accepted_bid_user_id != bid.user_id && (
                        <p style={{ color: 'gray' }}>Er is al een bod geaccepteerd voor deze opdracht</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                onClick={() => setSelectedOpdracht(null)}
                style={{
                  flex: 1,
                  background: 'gray',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Sluiten
              </button>
              <button
                onClick={() => {
                  openEditModal(selectedOpdracht);
                  setSelectedOpdracht(null);
                }}
                style={{
                  flex: 1,
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Bewerken
              </button>
              {selectedOpdracht.status !== 'voltooid' && (
                <button
                  onClick={handleCompleteOpdracht}
                  disabled={completeLoading}
                  style={{
                    flex: 1,
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: completeLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {completeLoading ? 'Voltooiing...' : 'Voltooien'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {editModal && (
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
          onClick={() => setEditModal(null)}
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
              onClick={() => setEditModal(null)}
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

            <h2>Opdracht Bewerken</h2>

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Basis Informatie</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Titel *</label>
                  <input
                    type="text"
                    name="title"
                    value={editFormData.title || ''}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Beschrijving *</label>
                  <textarea
                    name="description"
                    value={editFormData.description || ''}
                    onChange={handleEditChange}
                    rows="3"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Categorie</label>
                    <input
                      type="text"
                      name="category"
                      value={editFormData.category || ''}
                      onChange={handleEditChange}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Deadline *</label>
                    <input
                      type="date"
                      name="deadline"
                      value={editFormData.deadline || ''}
                      onChange={handleEditChange}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Locatie</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Straat en Huisnummer</label>
                  <input
                    type="text"
                    name="location_address"
                    value={editFormData.location_address || ''}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Stad</label>
                    <input
                      type="text"
                      name="location_city"
                      value={editFormData.location_city || ''}
                      onChange={handleEditChange}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Postcode</label>
                    <input
                      type="text"
                      name="location_postcode"
                      value={editFormData.location_postcode || ''}
                      onChange={handleEditChange}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Opbouw Tijd</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Datum</label>
                  <input
                    type="date"
                    name="opbouw_date"
                    value={editFormData.opbouw_date || ''}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Tijd</label>
                  <input
                    type="time"
                    name="opbouw_time"
                    value={editFormData.opbouw_time || ''}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Opbouw Details</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Hard Opbouw</label>
                  <input
                    type="text"
                    name="hard_opbouw"
                    value={editFormData.hard_opbouw || ''}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Dagen Aantal</label>
                  <input
                    type="text"
                    name="opbouw_dagen_amount"
                    value={editFormData.opbouw_dagen_amount || ''}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Mannen Nodig</label>
                  <input
                    type="text"
                    name="opbouw_men_needed"
                    value={editFormData.opbouw_men_needed || ''}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Afbouw Details</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Datum</label>
                  <input
                    type="date"
                    name="planning_afbouw_date"
                    value={editFormData.planning_afbouw_date || ''}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Tijd</label>
                  <input
                    type="time"
                    name="planning_afbouw_time"
                    value={editFormData.planning_afbouw_time || ''}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Hard Afbouw</label>
                  <input
                    type="text"
                    name="hard_afbouw"
                    value={editFormData.hard_afbouw || ''}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Dagen Aantal</label>
                  <input
                    type="text"
                    name="afbouw_dagen_amount"
                    value={editFormData.afbouw_dagen_amount || ''}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Mannen Nodig</label>
                  <input
                    type="text"
                    name="afbouw_men_needed"
                    value={editFormData.afbouw_men_needed || ''}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Transport</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Opbouw Type</label>
                  <input
                    type="text"
                    name="opbouw_transport_type"
                    value={editFormData.opbouw_transport_type || ''}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Opbouw Aantal</label>
                  <input
                    type="text"
                    name="opbouw_transport_amount"
                    value={editFormData.opbouw_transport_amount || ''}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Afbouw Type</label>
                  <input
                    type="text"
                    name="afbouw_transport_type"
                    value={editFormData.afbouw_transport_type || ''}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Afbouw Aantal</label>
                  <input
                    type="text"
                    name="afbouw_transport_amount"
                    value={editFormData.afbouw_transport_amount || ''}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Hoogwerkers</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Opbouw Type</label>
                  <input
                    type="text"
                    name="opbouw_hoogwerkers_type"
                    value={editFormData.opbouw_hoogwerkers_type || ''}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Opbouw Aantal</label>
                  <input
                    type="text"
                    name="opbouw_hoogwerkers_amount"
                    value={editFormData.opbouw_hoogwerkers_amount || ''}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Afbouw Type</label>
                  <input
                    type="text"
                    name="afbouw_hoogwerkers_type"
                    value={editFormData.afbouw_hoogwerkers_type || ''}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Afbouw Aantal</label>
                  <input
                    type="text"
                    name="afbouw_hoogwerkers_amount"
                    value={editFormData.afbouw_hoogwerkers_amount || ''}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Links en Opslag</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Magazijnbon Link</label>
                  <input
                    type="text"
                    name="magazijnbon_link"
                    value={editFormData.magazijnbon_link || ''}
                    onChange={handleEditChange}
                    placeholder="https://..."
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Project Map Opbouw Link</label>
                  <input
                    type="text"
                    name="project_map_opbouw_link"
                    value={editFormData.project_map_opbouw_link || ''}
                    onChange={handleEditChange}
                    placeholder="https://..."
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Project Map Afbouw Link</label>
                  <input
                    type="text"
                    name="project_map_afbouw_link"
                    value={editFormData.project_map_afbouw_link || ''}
                    onChange={handleEditChange}
                    placeholder="https://..."
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Storageplace Adres</label>
                  <input
                    type="text"
                    name="storageplace_adres"
                    value={editFormData.storageplace_adres || ''}
                    onChange={handleEditChange}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                onClick={() => setEditModal(null)}
                style={{
                  flex: 1,
                  background: 'gray',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Annuleren
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={editLoading || completeLoading}
                style={{
                  flex: 1,
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: editLoading || completeLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {editLoading ? 'Opslaan...' : 'Opslaan'}
              </button>
              {editFormData.status !== 'voltooid' && (
                <button
                  onClick={handleCompleteOpdracht}
                  disabled={completeLoading || editLoading}
                  style={{
                    flex: 1,
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: completeLoading || editLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {completeLoading ? 'Voltooiing...' : 'Voltooien'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {deleteModal && (
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
          onClick={() => setDeleteModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              maxWidth: '400px',
              width: '90%',
              padding: '2rem',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setDeleteModal(null)}
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

            <h2>Opdracht Verwijderen</h2>
            <p>Weet je zeker dat je deze opdracht wilt verwijderen?</p>
            <p><strong>{deleteModal.title}</strong></p>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                onClick={() => setDeleteModal(null)}
                style={{
                  background: 'gray',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Annuleren
              </button>
              <button
                onClick={handleDeleteOpdracht}
                disabled={deleteLoading}
                style={{
                  background: 'red',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: deleteLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {deleteLoading ? 'Verwijderen...' : 'Verwijderen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
