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
    deadline: '',
    location_city: '',
    location_address: '',
    location_postcode: '',
    hard_opbouw: '',
    opbouw_date: '',
    opbouw_time: '',
    opbouw_dagen_amount: '',
    opbouw_men_needed: '',
    planning_afbouw_date: '',
    planning_afbouw_time: '',
    hard_afbouw: '',
    afbouw_dagen_amount: '',
    afbouw_men_needed: '',
    opbouw_transport_type: '',
    opbouw_transport_amount: '',
    afbouw_transport_type: '',
    afbouw_transport_amount: '',
    opbouw_hoogwerkers_type: '',
    opbouw_hoogwerkers_amount: '',
    afbouw_hoogwerkers_type: '',
    afbouw_hoogwerkers_amount: '',
    magazijnbon_link: '',
    project_map_opbouw_link: '',
    project_map_afbouw_link: '',
    storageplace_adres: '',
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [pdfFiles, setPdfFiles] = useState([]);

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
    const files = Array.from(e.target.files);
    setImageFiles(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const handlePdfChange = (e) => {
    const files = Array.from(e.target.files);
    setPdfFiles(files);
  };

  const removePdf = (index) => {
    const newFiles = pdfFiles.filter((_, i) => i !== index);
    setPdfFiles(newFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!formData.title || !formData.description || !formData.deadline) {
      setMessage('Vul alle verplichte velden in');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Add form data
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add user ID
      formDataToSend.append('userId', user.id);

      // Add images
      imageFiles.forEach((file, index) => {
        formDataToSend.append(`images`, file);
      });

      // Add PDFs
      pdfFiles.forEach((file, index) => {
        formDataToSend.append(`pdfs`, file);
      });

      const response = await fetch('/api/opdracht/post', {
        method: 'POST',
        body: formDataToSend,
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
        deadline: '',
        location_city: '',
        location_address: '',
        location_postcode: '',
        hard_opbouw: '',
        opbouw_date: '',
        opbouw_time: '',
        opbouw_dagen_amount: '',
        opbouw_men_needed: '',
        planning_afbouw_date: '',
        planning_afbouw_time: '',
        hard_afbouw: '',
        afbouw_dagen_amount: '',
        afbouw_men_needed: '',
        opbouw_transport_type: '',
        opbouw_transport_amount: '',
        afbouw_transport_type: '',
        afbouw_transport_amount: '',
        opbouw_hoogwerkers_type: '',
        opbouw_hoogwerkers_amount: '',
        afbouw_hoogwerkers_type: '',
        afbouw_hoogwerkers_amount: '',
        magazijnbon_link: '',
        project_map_opbouw_link: '',
        project_map_afbouw_link: '',
        storageplace_adres: '',
      });
      setImageFiles([]);
      setImagePreviews([]);
      setPdfFiles([]);
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

      <div style={{ flex: 1, padding: '2rem', marginTop: '80px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', color: '#333', marginBottom: '2rem' }}>Opdracht Plaatsen</h1>

          <div className="card round white" style={{ padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <form onSubmit={handleSubmit}>
              {/* Basisinformatie and Locatie side by side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                  <h3 style={{ marginBottom: '1rem', color: '#333' }}>Basisinformatie</h3>
                  <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="title"><b>Titel *</b></label>
                    <input
                      type="text"
                      placeholder="Titel van de opdracht"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label htmlFor="category"><b>Categorie</b></label>
                      <input
                        type="text"
                        placeholder="Categorie"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="deadline"><b>Deadline *</b></label>
                      <input
                        type="date"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 style={{ marginBottom: '1rem', color: '#333' }}>Locatie</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label htmlFor="location_city"><b>Stad</b></label>
                      <input
                        type="text"
                        placeholder="Stad"
                        name="location_city"
                        value={formData.location_city}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="location_address"><b>Adres</b></label>
                      <input
                        type="text"
                        placeholder="Adres"
                        name="location_address"
                        value={formData.location_address}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="location_postcode"><b>Postcode</b></label>
                      <input
                        type="text"
                        placeholder="Postcode"
                        name="location_postcode"
                        value={formData.location_postcode}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Opbouw en Afbouw */}
              <h3 style={{ marginBottom: '1rem', color: '#333' }}>Opbouw en Afbouw</h3>

              {/* Opbouw and Afbouw side by side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                  <h4 style={{ marginBottom: '1rem', color: '#555' }}>Opbouw</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label htmlFor="hard_opbouw"><b>Hard Opbouw (Ja/Nee)</b></label>
                      <select
                        name="hard_opbouw"
                        value={formData.hard_opbouw}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                      >
                        <option value="">Selecteer</option>
                        <option value="Ja">Ja</option>
                        <option value="Nee">Nee</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="opbouw_date"><b>Opbouw Datum</b></label>
                      <input
                        type="date"
                        name="opbouw_date"
                        value={formData.opbouw_date}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="opbouw_time"><b>Opbouw Tijd</b></label>
                      <input
                        type="time"
                        name="opbouw_time"
                        value={formData.opbouw_time}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="opbouw_dagen_amount"><b>Opbouw Dagen Aantal</b></label>
                      <input
                        type="number"
                        placeholder="Aantal dagen"
                        name="opbouw_dagen_amount"
                        value={formData.opbouw_dagen_amount}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label htmlFor="opbouw_men_needed"><b>Opbouw Mannen Nodig</b></label>
                      <input
                        type="number"
                        placeholder="Aantal mannen"
                        name="opbouw_men_needed"
                        value={formData.opbouw_men_needed}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    </div>
                  </div>

                  <h5 style={{ marginBottom: '1rem', color: '#666' }}>Transport Opbouw</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label htmlFor="opbouw_transport_type"><b>Type</b></label>
                      <input
                        type="text"
                        placeholder="Transport type"
                        name="opbouw_transport_type"
                        value={formData.opbouw_transport_type}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="opbouw_transport_amount"><b>Aantal</b></label>
                      <input
                        type="number"
                        placeholder="Aantal"
                        name="opbouw_transport_amount"
                        value={formData.opbouw_transport_amount}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    </div>
                  </div>

                  <h5 style={{ marginBottom: '1rem', color: '#666' }}>Hoogwerkers Opbouw</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label htmlFor="opbouw_hoogwerkers_type"><b>Type</b></label>
                      <input
                        type="text"
                        placeholder="Hoogwerkers type"
                        name="opbouw_hoogwerkers_type"
                        value={formData.opbouw_hoogwerkers_type}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="opbouw_hoogwerkers_amount"><b>Aantal</b></label>
                      <input
                        type="number"
                        placeholder="Aantal"
                        name="opbouw_hoogwerkers_amount"
                        value={formData.opbouw_hoogwerkers_amount}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 style={{ marginBottom: '1rem', color: '#555' }}>Afbouw</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label htmlFor="hard_afbouw"><b>Hard Afbouw (Ja/Nee)</b></label>
                      <select
                        name="hard_afbouw"
                        value={formData.hard_afbouw}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                      >
                        <option value="">Selecteer</option>
                        <option value="Ja">Ja</option>
                        <option value="Nee">Nee</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="planning_afbouw_date"><b>Afbouw Datum</b></label>
                      <input
                        type="date"
                        name="planning_afbouw_date"
                        value={formData.planning_afbouw_date}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="planning_afbouw_time"><b>Afbouw Tijd</b></label>
                      <input
                        type="time"
                        name="planning_afbouw_time"
                        value={formData.planning_afbouw_time}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="afbouw_dagen_amount"><b>Afbouw Dagen Aantal</b></label>
                      <input
                        type="number"
                        placeholder="Aantal dagen"
                        name="afbouw_dagen_amount"
                        value={formData.afbouw_dagen_amount}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label htmlFor="afbouw_men_needed"><b>Afbouw Mannen Nodig</b></label>
                      <input
                        type="number"
                        placeholder="Aantal mannen"
                        name="afbouw_men_needed"
                        value={formData.afbouw_men_needed}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    </div>
                  </div>

                  <h5 style={{ marginBottom: '1rem', color: '#666' }}>Transport Afbouw</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label htmlFor="afbouw_transport_type"><b>Type</b></label>
                      <input
                        type="text"
                        placeholder="Transport type"
                        name="afbouw_transport_type"
                        value={formData.afbouw_transport_type}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="afbouw_transport_amount"><b>Aantal</b></label>
                      <input
                        type="number"
                        placeholder="Aantal"
                        name="afbouw_transport_amount"
                        value={formData.afbouw_transport_amount}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    </div>
                  </div>

                  <h5 style={{ marginBottom: '1rem', color: '#666' }}>Hoogwerkers Afbouw</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label htmlFor="afbouw_hoogwerkers_type"><b>Type</b></label>
                      <input
                        type="text"
                        placeholder="Hoogwerkers type"
                        name="afbouw_hoogwerkers_type"
                        value={formData.afbouw_hoogwerkers_type}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="afbouw_hoogwerkers_amount"><b>Aantal</b></label>
                      <input
                        type="number"
                        placeholder="Aantal"
                        name="afbouw_hoogwerkers_amount"
                        value={formData.afbouw_hoogwerkers_amount}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Links en Opslag */}
              <h3 style={{ marginBottom: '1rem', color: '#333' }}>Links en Opslag</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label htmlFor="magazijnbon_link"><b>Magazijnbon Link</b></label>
                  <input
                    type="url"
                    placeholder="Link naar magazijnbon"
                    name="magazijnbon_link"
                    value={formData.magazijnbon_link}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label htmlFor="project_map_opbouw_link"><b>Project Map Opbouw Link</b></label>
                  <input
                    type="url"
                    placeholder="Link naar project map opbouw"
                    name="project_map_opbouw_link"
                    value={formData.project_map_opbouw_link}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label htmlFor="project_map_afbouw_link"><b>Project Map Afbouw Link</b></label>
                  <input
                    type="url"
                    placeholder="Link naar project map afbouw"
                    name="project_map_afbouw_link"
                    value={formData.project_map_afbouw_link}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label htmlFor="storageplace_adres"><b>Opslagplaats Adres</b></label>
                  <input
                    type="text"
                    placeholder="Adres van opslagplaats"
                    name="storageplace_adres"
                    value={formData.storageplace_adres}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                </div>
              </div>

              {/* Beschrijving */}
              <h3 style={{ marginBottom: '1rem', color: '#333' }}>Beschrijving</h3>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="description"><b>Beschrijving *</b></label>
                <textarea
                  placeholder="Beschrijving van de opdracht"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', minHeight: '100px' }}
                />
              </div>

              {/* Afbeeldingen */}
              <h3 style={{ marginBottom: '1rem', color: '#333' }}>Afbeeldingen</h3>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="images"><b>Afbeeldingen Uploaden (Meerdere mogelijk)</b></label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                />
                {imagePreviews.length > 0 && (
                  <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                    {imagePreviews.map((preview, index) => (
                      <div key={index} style={{ textAlign: 'center' }}>
                        <img src={preview} alt={`Preview ${index + 1}`} style={{ maxWidth: '200px', maxHeight: '200px', border: '1px solid #ccc' }} />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="button theme-l1"
                          style={{ marginTop: '0.5rem', padding: '0.5rem 1rem' }}
                        >
                          Verwijder
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PDF's */}
              <h3 style={{ marginBottom: '1rem', color: '#333' }}>PDF's</h3>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="pdfs"><b>PDF's Uploaden (Meerdere mogelijk)</b></label>
                <input
                  type="file"
                  name="pdfs"
                  accept="application/pdf"
                  multiple
                  onChange={handlePdfChange}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                />
                {pdfFiles.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <ul>
                      {pdfFiles.map((file, index) => (
                        <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span>{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removePdf(index)}
                            className="button theme-l1"
                            style={{ padding: '0.25rem 0.5rem' }}
                          >
                            Verwijder
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
