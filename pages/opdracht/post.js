import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Navbar, Footer } from '../../components/template';

export default function PostOpdracht() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    deadline: '',
    location: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('/images/placeholder.png');

  // Check if logged in
useEffect(() => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const userData = JSON.parse(storedUser);
      setUser(userData);

      // Only allow users with is_poster or is_admin
      if (!userData.is_poster && !userData.is_admin) {
        router.replace('/'); // redirect to homepage
        return;
      }

      setCheckingAuth(false);
    } catch (err) {
      console.error('Error parsing user:', err);
      router.replace('/auth/login');
    }
  } else {
    router.replace('/auth/login');
  }
}, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('/images/placeholder.png');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!formData.title || !formData.description || !formData.price || !formData.deadline) {
      setMessage('Vul alle verplichte velden in');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/opdracht/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Opdracht plaatsen mislukt');
      }

      setMessage('Opdracht succesvol geplaatst!');
      setFormData({
        title: '',
        description: '',
        category: '',
        price: '',
        deadline: '',
        location: '',
      });
      setImageFile(null);
      setImagePreview('/images/placeholder.png');
      setTimeout(() => router.push('/'), 2000);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="theme-l5" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <p style={{ fontSize: '1.2rem' }}>Bezig met laden...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="theme-l5" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <div style={{ flex: 1, padding: '2rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: '2rem' }}>Opdracht Plaatsen</h1>

          <div className="card round white" style={{ padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <form onSubmit={handleSubmit}>
              {/* Titel */}
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="title"><b>Titel *</b></label>
                <input
                  type="text"
                  placeholder="Titel van de opdracht"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #e0e0e0' }}
                />
              </div>

              {/* Image uploader (optional) */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ flex: '0 0 320px' }}>
                  <label><b>Optionele afbeelding</b></label>
                  <div style={{ marginTop: '0.5rem', border: '1px solid #eee', borderRadius: '6px', overflow: 'hidden' }}>
                    <img src={imagePreview} alt="preview" style={{ width: '100%', height: 'auto', display: 'block' }} />
                  </div>
                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                    {imageFile && (
                      <button type="button" onClick={removeImage} className="button" style={{ background: '#ff6b6b', color: 'white', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>Verwijder</button>
                    )}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>Aanbevolen grootte: 600x400px</p>
                </div>

                {/* The rest of the fields in the right column */}
                <div style={{ flex: 1 }}>
                  {/* Beschrijving */}
                  <div className="section" style={{ marginBottom: '1rem' }}>
                    <label htmlFor="description"><b>Beschrijving *</b></label>
                    <textarea
                      placeholder="Gedetailleerde beschrijving van de opdracht"
                      name="description"
                      required
                      value={formData.description}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box', minHeight: '150px', fontFamily: 'Arial', borderRadius: '6px', border: '1px solid #e0e0e0' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {/* Categorie */}
                    <div>
                      <label htmlFor="category"><b>Categorie</b></label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #e0e0e0' }}
                      >
                        <option value="">Selecteer een categorie</option>
                        <option value="design">Design</option>
                        <option value="programming">Programmeren</option>
                        <option value="writing">Schrijven</option>
                        <option value="marketing">Marketing</option>
                        <option value="other">Overig</option>
                      </select>
                    </div>

                    {/* Prijs */}
                    <div>
                      <label htmlFor="price"><b>Prijs (€) *</b></label>
                      <input
                        type="number"
                        placeholder="0.00"
                        name="price"
                        required
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #e0e0e0' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                    {/* Deadline */}
                    <div>
                      <label htmlFor="deadline"><b>Deadline *</b></label>
                      <input
                        type="date"
                        name="deadline"
                        required
                        value={formData.deadline}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #e0e0e0' }}
                      />
                    </div>

                    {/* Locatie */}
                    <div>
                      <label htmlFor="location"><b>Locatie</b></label>
                      <input
                        type="text"
                        placeholder="Locatie (optioneel)"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.75rem', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #e0e0e0' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Message */}
              {message && (
                <p style={{
                  textAlign: 'center',
                  color: message.includes('succesvol') ? 'green' : 'red',
                  marginTop: '1rem',
                  fontWeight: 'bold'
                }}>
                  {message}
                </p>
              )}

              {/* Submit Button */}
              <div style={{ textAlign: 'right' }}>
                <button
                  type="submit"
                  className="button block theme-l1"
                  disabled={loading}
                  style={{ marginTop: '1.5rem', padding: '0.75rem 1rem', fontSize: '1rem', fontWeight: 'bold' }}
                >
                  {loading ? 'Bezig met plaatsen...' : 'Opdracht Plaatsen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
