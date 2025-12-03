import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AuthHeader } from '../../components/auth-header';
import { Footer } from '../../components/template';

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  // Check if already logged in, redirect to home
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      router.push('/');
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('Wachtwoorden komen niet overeen');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registratie mislukt');
      }

      setMessage('U bent geregistreerd.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="theme-l5" style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
        <AuthHeader />
        <div style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <p style={{fontSize: '1.2rem'}}>Bezig met laden...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="theme-l5" style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
      <AuthHeader />

      <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem'}}>
        {/* Welcome Header */}
        <div style={{textAlign: 'center', marginBottom: '3rem'}}>
          <h1 style={{fontSize: '2.5rem', color: '#333', margin: '0 0 0.5rem 0'}}>Welkom op Opdracht Marktplaats</h1>
          <p style={{fontSize: '1.1rem', color: '#666', margin: 0}}>Maak een nieuw account aan om aan de slag te gaan</p>
        </div>

        {/* Register Card */}
        <div className="card round white" style={{width: '100%', maxWidth: '450px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'}}>
          <div className="container" style={{padding: '2.5rem'}}>
            <h2 className="center" style={{marginTop: 0, marginBottom: '1.5rem'}}>Registreren</h2>
            <form onSubmit={handleRegister}>
              <div className="section">
                <label htmlFor="firstName"><b>Voornaam</b></label>
                <input
                  type="text"
                  placeholder="Voer voornaam in"
                  name="firstName"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={{width: '100%', padding: '0.75rem', boxSizing: 'border-box'}}
                />
              </div>
              <div className="section">
                <label htmlFor="lastName"><b>Achternaam</b></label>
                <input
                  type="text"
                  placeholder="Voer achternaam in"
                  name="lastName"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={{width: '100%', padding: '0.75rem', boxSizing: 'border-box'}}
                />
              </div>
              <div className="section">
                <label htmlFor="email"><b>E-mail</b></label>
                <input
                  type="email"
                  placeholder="Voer e-mail in"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{width: '100%', padding: '0.75rem', boxSizing: 'border-box'}}
                />
              </div>
              <div className="section">
                <label htmlFor="password"><b>Wachtwoord</b></label>
                <input
                  type="password"
                  placeholder="Voer wachtwoord in"
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{width: '100%', padding: '0.75rem', boxSizing: 'border-box'}}
                />
              </div>
              <div className="section">
                <label htmlFor="confirmPassword"><b>Bevestig Wachtwoord</b></label>
                <input
                  type="password"
                  placeholder="Bevestig wachtwoord"
                  name="confirmPassword"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{width: '100%', padding: '0.75rem', boxSizing: 'border-box'}}
                />
              </div>
              <button type="submit" className="button block theme-l1" disabled={loading} style={{marginTop: '1.5rem', padding: '0.75rem', fontSize: '1rem', fontWeight: 'bold'}}>
                {loading ? 'Bezig met registreren...' : 'Registreren'}
              </button>
            </form>
            
            {message && <p style={{textAlign: 'center', color: message.includes('succesvol') ? 'green' : 'red', marginTop: '1rem', fontWeight: 'bold'}}>{message}</p>}
            
            {/* Divider */}
            <div style={{textAlign: 'center', margin: '1.5rem 0', color: '#999'}}>of</div>

            {/* Login Button */}
            <Link href="/auth/login">
              <button className="button block theme-d2" style={{padding: '0.75rem', fontSize: '1rem', fontWeight: 'bold', marginTop: '1rem'}}>
                Inloggen op bestaand account
              </button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
