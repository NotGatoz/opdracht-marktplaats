import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar, Footer } from '../../components/template';

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
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
        throw new Error(data.error || 'Registration failed');
      }

      setMessage('Registration successful! Please check your email for verification.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="theme-l5" style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
      <Navbar />

      <div style={{flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <div className="card round white" style={{width: '400px'}}>
          <div className="container">
            <h2 className="center">Register</h2>
            <form onSubmit={handleRegister}>
              <div className="section">
                <label htmlFor="firstName"><b>First Name</b></label>
                <input
                  type="text"
                  placeholder="Enter First Name"
                  name="firstName"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="section">
                <label htmlFor="lastName"><b>Last Name</b></label>
                <input
                  type="text"
                  placeholder="Enter Last Name"
                  name="lastName"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
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
              <div className="section">
                <label htmlFor="confirmPassword"><b>Confirm Password</b></label>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  name="confirmPassword"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <button type="submit" className="button block theme-l1" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>
            {message && <p className="center" style={{color: message.includes('successful') ? 'green' : 'red'}}>{message}</p>}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
