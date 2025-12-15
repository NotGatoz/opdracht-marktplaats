import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Navbar, Footer } from '../components/template';

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setPhoneNumber(userData.phone || '');
        // Load profile photo if exists
        if (userData.id) {
          fetch(`/api/get-profile-photo?userId=${userData.id}`)
            .then(res => {
              if (res.ok) {
                return res.blob();
              }
            })
            .then(blob => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                setProfilePhoto(url);
              }
            })
            .catch(err => console.error('Error loading profile photo:', err));
        }
      } catch (err) {
        console.error('Error parsing user:', err);
      }
    }
    setLoading(false);
  }, []);

  const handleProfilePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);
      formData.append('userId', user.id);

      const res = await fetch('/api/upload-profile-photo', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fout bij uploaden profielfoto');

      // Update user in localStorage
      const updatedUser = { ...user, profile_photo: data.user.profile_photo };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      // Update preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePhoto(event.target?.result);
      };
      reader.readAsDataURL(file);

      alert('Profielfoto succesvol geüpload!');
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSavePhoneNumber = async () => {
    if (!user) return;

    setSavingPhone(true);
    try {
      const res = await fetch('/api/update-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          phone: phoneNumber,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fout bij opslaan telefoonnummer');

      // Update user in localStorage
      const updatedUser = { ...user, phone: phoneNumber };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setEditingPhone(false);

      alert('Telefoonnummer succesvol opgeslagen!');
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingPhone(false);
    }
  };

  if (loading) {
    return <div>Laden...</div>;
  }

  if (!user) {
    return (
      <div className="theme-l5" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ flex: 1, padding: '2rem', marginTop: '80px', textAlign: 'center' }}>
          <h1>Je bent niet ingelogd</h1>
          <p>Ga naar <a href="/auth/login">Login</a> om in te loggen.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="theme-l5" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ flex: 1, padding: '2rem', marginTop: '80px' }}>
        <h1>Mijn Account</h1>

        <div className="card round white" style={{ padding: '2rem', maxWidth: '600px' }}>
          <h2>Profielfoto</h2>

          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Profielfoto"
                style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #ddd',
                  marginBottom: '1rem',
                }}
              />
            ) : (
              <div
                style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  backgroundColor: '#ddd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '3rem',
                  color: '#999',
                }}
              >
                <i className="fa fa-user"></i>
              </div>
            )}
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePhotoUpload}
                disabled={uploading}
                style={{ display: 'none' }}
                id="profilePhotoInput"
              />
              <label
                htmlFor="profilePhotoInput"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#007bff',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  opacity: uploading ? 0.6 : 1,
                }}
              >
                {uploading ? 'Uploaden...' : 'Foto Uploaden'}
              </label>
            </div>
          </div>

          <h2>Accountgegevens</h2>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Voornaam</label>
            <div style={{ padding: '0.75rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              {user.name}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Achternaam</label>
            <div style={{ padding: '0.75rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              {user.last_name}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Email</label>
            <div style={{ padding: '0.75rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              {user.email}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Rollen</label>
            <div style={{ padding: '0.75rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              {user.is_admin && <span style={{ display: 'block', color: '#ff6b00', fontWeight: 'bold' }}>👤 Administrator</span>}
              {user.is_poster && <span style={{ display: 'block', color: '#007bff', fontWeight: 'bold' }}>📋 Opdrachtgever</span>}
              {!user.is_admin && !user.is_poster && <span>Gebruiker</span>}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Telefoon</label>
            {!editingPhone ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ flex: 1, padding: '0.75rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                  {phoneNumber || 'Niet ingesteld'}
                </div>
                <button
                  onClick={() => setEditingPhone(true)}
                  style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  Bewerken
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Voer telefoonnummer in"
                  style={{
                    padding: '0.75rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                  }}
                />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={handleSavePhoneNumber}
                    disabled={savingPhone}
                    style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1rem',
                      borderRadius: '4px',
                      cursor: savingPhone ? 'not-allowed' : 'pointer',
                      opacity: savingPhone ? 0.6 : 1,
                      flex: 1,
                    }}
                  >
                    {savingPhone ? 'Opslaan...' : 'Opslaan'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingPhone(false);
                      setPhoneNumber(user.phone || '');
                    }}
                    disabled={savingPhone}
                    style={{
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1rem',
                      borderRadius: '4px',
                      cursor: savingPhone ? 'not-allowed' : 'pointer',
                      opacity: savingPhone ? 0.6 : 1,
                      flex: 1,
                    }}
                  >
                    Annuleren
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Account Status</label>
            <div style={{ padding: '0.75rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <span style={{ color: 'green', fontWeight: 'bold' }}>✓ Actief</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #ddd', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
            <h3>Instellingen</h3>
            <button
              onClick={() => {
                localStorage.removeItem('user');
                fetch('/api/logout', { method: 'POST' });
                router.push('/auth/login');
              }}
              style={{
                background: 'red',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              Uitloggen
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
