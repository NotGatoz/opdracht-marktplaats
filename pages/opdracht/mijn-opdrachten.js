
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
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedPdfs, setUploadedPdfs] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [pdfNames, setPdfNames] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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
    setUploadedImages(opdracht.images || []);
    setUploadedPdfs(opdracht.pdfs || []);
    setPdfNames(opdracht.pdf_filenames || []);
    setImagePreviews(opdracht.images || []);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const ensureDataUri = (base64Str) => {
    if (!base64Str) return base64Str;
    if (base64Str.startsWith('data:')) return base64Str;
    return `data:image/jpeg;base64,${base64Str}`;
  };

  const handleAddImages = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      try {
        const base64 = await fileToBase64(file);
        setUploadedImages(prev => [...prev, base64]);
        setImagePreviews(prev => [...prev, base64]);
      } catch (err) {
        alert('Fout bij uploaden afbeelding: ' + err.message);
      }
    }
    e.target.value = '';
  };

  const handleAddPdfs = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      try {
        const base64 = await fileToBase64(file);
        setUploadedPdfs(prev => [...prev, base64]);
        setPdfNames(prev => [...prev, file.name]);
      } catch (err) {
        alert('Fout bij uploaden PDF: ' + err.message);
      }
    }
    e.target.value = '';
  };

  const handleRemoveImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemovePdf = (index) => {
    setUploadedPdfs(prev => prev.filter((_, i) => i !== index));
    setPdfNames(prev => prev.filter((_, i) => i !== index));
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
          ...editFormData,
          images: uploadedImages,
          pdfs: uploadedPdfs,
          pdf_filenames: pdfNames
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fout bij bijwerken opdracht');
      
      const fetchOpdrachten = async () => {
        try {
          const res = await fetch(`/api/opdracht/mijn-opdrachten?userId=${user.id}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Fout bij ophalen mijn opdrachten');
          setOpdrachten(data.opdrachten);
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
      setUploadedImages([]);
      setUploadedPdfs([]);
      setImagePreviews([]);
      setPdfNames([]);
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

  const filteredOpdrachten = opdrachten.filter((opdracht) => {
    const matchesSearch = searchQuery === '' ||
      opdracht.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opdracht.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (!selectedFilter) return true;

    const bidCount = Number(opdracht.total_bid_count) || 0;

    if (selectedFilter === 'nog niet geboden') return bidCount === 0;
    if (selectedFilter === 'geboden') return bidCount > 0;
    if (selectedFilter === 'aangenomen') return opdracht.status === 'aangenomen';
    if (selectedFilter === 'voltooid') return opdracht.status === 'voltooid';

    return true;
  });

  return (
    <div className="theme-l5" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ flex: 1, display: 'flex', marginTop: '80px' }}>
        <div style={{ width: '250px', backgroundColor: '#f8f9fa', borderRight: '1px solid #e0e0e0', padding: '2rem', minHeight: '100vh', overflowY: 'auto' }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#333', fontSize: '1.1rem', fontWeight: 600 }}>Zoeken en Filteren</h3>
          
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#555', fontSize: '0.9rem' }}>Zoeken</label>
            <input
              type="text"
              placeholder="Zoek opdrachten..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                padding: '0.7rem', 
                width: '100%', 
                borderRadius: '6px', 
                border: '1px solid #ddd', 
                fontSize: '0.9rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <h4 style={{ marginBottom: '1rem', color: '#333', fontSize: '0.95rem', fontWeight: 600 }}>Filteren</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }}>
              <input
                type="radio"
                name="opdracht-filter"
                value=""
                checked={selectedFilter === ''}
                onChange={(e) => setSelectedFilter(e.target.value)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ color: '#555', fontSize: '0.9rem' }}>Alle opdrachten</span>
            </label>
            {[
              { id: 'nog niet geboden', label: 'Nog niet geboden' },
              { id: 'geboden', label: 'Geboden' },
              { id: 'aangenomen', label: 'Aangenomen' },
              { id: 'voltooid', label: 'Voltooid' },
            ].map((filter) => (
              <label key={filter.id} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }}>
                <input
                  type="radio"
                  name="opdracht-filter"
                  value={filter.id}
                  checked={selectedFilter === filter.id}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ color: '#555', fontSize: '0.9rem' }}>{filter.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>Mijn Geplaatste Opdrachten</h1>
            <p style={{ color: '#999', margin: 0 }}>
              {filteredOpdrachten.length} {filteredOpdrachten.length === 1 ? 'opdracht' : 'opdrachten'} gevonden
            </p>
          </div>

          {loading && <p style={{ color: '#666' }}>Laden...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {filteredOpdrachten.map((opdracht) => (
              <div
                key={opdracht.id}
                onClick={() => openModal(opdracht)}
                style={{
                  padding: '1.5rem',
                  cursor: 'pointer',
                  position: 'relative',
                  backgroundColor: 'white',
                  borderRadius: '10px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  border: '1px solid #f0f0f0',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#0056b3'}
                    onMouseLeave={(e) => e.target.style.background = '#007bff'}
                  >
                    Bewerken
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteModal(opdracht);
                    }}
                    style={{
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#c82333'}
                    onMouseLeave={(e) => e.target.style.background = '#dc3545'}
                  >
                    Verwijderen
                  </button>
                </div>

                <div style={{ marginBottom: '1rem', paddingRight: '120px' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#333', fontSize: '1.1rem', fontWeight: 600 }}>
                    {opdracht.title}
                  </h3>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.9rem', lineHeight: '1.4' }}>
                    {opdracht.description.substring(0, 100)}...
                  </p>
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '1rem', 
                  marginBottom: '1rem',
                  fontSize: '0.85rem'
                }}>
                  <div>
                    <span style={{ color: '#999', display: 'block', marginBottom: '0.2rem' }}>Deadline</span>
                    <span style={{ color: '#333', fontWeight: 500 }}>
                      {new Date(opdracht.deadline).toLocaleDateString('nl-NL')}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: '#999', display: 'block', marginBottom: '0.2rem' }}>Biedingen</span>
                    <span style={{ color: '#333', fontWeight: 500 }}>
                      {opdracht.total_bid_count || 0} {opdracht.total_bid_count === 1 ? 'bod' : 'boden'}
                    </span>
                  </div>
                </div>

                <div style={{ 
                  paddingTop: '1rem', 
                  borderTop: '1px solid #f0f0f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{
                    display: 'inline-block',
                    backgroundColor: opdracht.status === 'aangenomen' ? '#d4edda' : opdracht.status === 'voltooid' ? '#cce5ff' : '#fff3cd',
                    color: opdracht.status === 'aangenomen' ? '#155724' : opdracht.status === 'voltooid' ? '#004085' : '#856404',
                    padding: '0.35rem 0.65rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 500
                  }}>
                    {opdracht.status}
                  </span>
                  <span style={{ color: '#1976d2', fontSize: '0.9rem', fontWeight: 500 }}>
                    Meer info →
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredOpdrachten.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
              <p style={{ fontSize: '1.1rem' }}>Geen opdrachten gevonden</p>
            </div>
          )}
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

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: '#333' }}>Afbeeldingen en PDF's</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Afbeeldingen toevoegen</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAddImages}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                  />
                </div>
                {imagePreviews.length > 0 && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Geüploade Afbeeldingen</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem' }}>
                      {imagePreviews.map((image, index) => (
                        <div key={index} style={{ position: 'relative', borderRadius: '4px', overflow: 'hidden', border: '1px solid #ddd' }}>
                          <img
                            src={ensureDataUri(image)}
                            alt={`Preview ${index}`}
                            style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.style.backgroundColor = '#f0f0f0';
                              e.target.style.display = 'flex';
                              e.target.style.alignItems = 'center';
                              e.target.style.justifyContent = 'center';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            style={{
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              backgroundColor: 'rgba(255, 0, 0, 0.8)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              padding: '0',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>PDF's toevoegen</label>
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={handleAddPdfs}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                  />
                </div>
                {uploadedPdfs.length > 0 && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold', fontSize: '0.9rem' }}>Geüploade PDF's</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {pdfNames.map((name, index) => (
                        <div
                          key={index}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.5rem',
                            backgroundColor: '#f0f0f0',
                            borderRadius: '4px',
                            border: '1px solid #ddd'
                          }}
                        >
                          <span style={{ fontSize: '0.9rem', color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                            <i className="fa fa-file-pdf-o"></i> {name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemovePdf(index)}
                            style={{
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '0.25rem 0.5rem',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              marginLeft: '0.5rem'
                            }}
                          >
                            Verwijderen
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                disabled={editLoading}
                style={{
                  flex: 1,
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  cursor: editLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {editLoading ? 'Opslaan...' : 'Opslaan'}
              </button>
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
