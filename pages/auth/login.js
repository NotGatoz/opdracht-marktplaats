import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AuthHeader } from '../../components/auth-header';
import { Footer } from '../../components/template';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/');
    } catch (err) {
      alert(err.message || 'Login failed');
    }
    setLoading(false);
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
          <p style={{fontSize: '1.1rem', color: '#666', margin: 0}}>Log in op je account om door te gaan</p>
        </div>

        {/* Login Card */}
        <div className="card round white" style={{width: '100%', maxWidth: '450px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'}}>
          <div className="container" style={{padding: '2.5rem'}}>
            <h2 className="center" style={{marginTop: 0, marginBottom: '1.5rem'}}>Inloggen</h2>
            <form onSubmit={handleLogin}>
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
              <button type="submit" className="button block theme-l1" disabled={loading} style={{marginTop: '1.5rem', padding: '0.75rem', fontSize: '1rem', fontWeight: 'bold'}}>
                {loading ? 'Bezig met inloggen...' : 'Inloggen'}
              </button>
            </form>
            
            {/* Divider */}
            <div style={{textAlign: 'center', margin: '1.5rem 0', color: '#999'}}>of</div>

            <p style={{textAlign: 'center', fontSize: '0.9rem', color: '#666', marginTop: '1rem', marginBottom: 0}}>
              Nog geen account? <Link href="/auth/register" style={{color: '#0066cc', textDecoration: 'none', fontWeight: 'bold'}}>Registreer hier</Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
