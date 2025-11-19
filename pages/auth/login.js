import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../utils/supabase';
import { useRouter } from 'next/router';
import { Navbar, Footer } from '../../components/template';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      alert(error.message);
    } else {
      router.push('/');
    }
    setLoading(false);
  };

  return (
    <div className="theme-l5" style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
      <Navbar />

      <div style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <div className="card round white" style={{width: '400px'}}>
          <div className="container">
            <h2 className="center">Login</h2>
            <form onSubmit={handleLogin}>
              <div className="section">
                <label htmlFor="email"><b>Email</b></label>
                <input
                  type="email"
                  placeholder="Enter Email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="section">
                <label htmlFor="password"><b>Password</b></label>
                <input
                  type="password"
                  placeholder="Enter Password"
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="button block theme-l1" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            <p className="center">Don't have an account? <Link href="/auth/register">Register</Link></p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
