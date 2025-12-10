 import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export function Navbar() {
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatrooms, setChatrooms] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedChatroom, setSelectedChatroom] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (err) {
        console.error('Error parsing user:', err);
      }
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      try {
        const res = await fetch(`/api/messages/unread-count?userId=${user.id}`);
        const data = await res.json();
        if (res.ok) {
          setUnreadCount(data.unreadCount);
        }
      } catch (err) {
        console.error('Error fetching unread count:', err);
      }
    };

    const fetchChatrooms = async () => {
      try {
        const res = await fetch(`/api/messages/recent?userId=${user.id}`);
        const data = await res.json();
        if (res.ok) {
          setChatrooms(data.chatrooms);
        }
      } catch (err) {
        console.error('Error fetching chatrooms:', err);
      }
    };

    fetchUnreadCount();
    fetchChatrooms();

    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchChatrooms();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  const showMijnOpdrachten = user && (user.is_admin || user.is_poster);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  const handleNotificationClick = () => {
    setShowNotifications(true);
    setSelectedChatroom(null);
    setChatMessages([]);
  };

  const handleNotificationClose = () => {
    setShowNotifications(false);
    setSelectedChatroom(null);
    setChatMessages([]);
  };

  const handleChatroomClick = async (chatroom) => {
    setSelectedChatroom(chatroom);
    // Fetch messages for this chatroom
    try {
      const res = await fetch(`/api/messages/get?opdrachtId=${chatroom.opdracht_id}`);
      const data = await res.json();
      if (res.ok) {
        setChatMessages(data.messages);
      }
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    }
    // Mark messages as read
    fetch('/api/messages/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        opdrachtId: chatroom.opdracht_id,
      }),
    }).catch(err => console.error('Error marking messages as read:', err));
  };

  const handleSendChatMessage = async () => {
    if (!newChatMessage.trim() || !user || !selectedChatroom) return;
    setChatLoading(true);
    try {
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opdrachtId: selectedChatroom.opdracht_id,
          userId: user.id,
          message: newChatMessage.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fout bij verzenden bericht');
      setNewChatMessage('');
      // Refresh messages
      const msgRes = await fetch(`/api/messages/get?opdrachtId=${selectedChatroom.opdracht_id}`);
      const msgData = await msgRes.json();
      if (msgRes.ok) {
        setChatMessages(msgData.messages);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="top">
      <div
        className="bar theme-d2"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 2rem',
          gap: '2rem',
          boxShadow: 'var(--shadow-md)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* LEFT SIDE */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '8px', color: 'white', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500, transition: 'var(--transition)', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}>
            <i className="fa fa-home"></i>Startpagina
          </Link>

          {showMijnOpdrachten && (
            <Link
              href="/opdracht/mijn-opdrachten"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '8px', color: 'white', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500, transition: 'var(--transition)', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
            >
              <i className="fa fa-list-alt"></i>Mijn Opdrachten
            </Link>
          )}

          <Link
            href="/opdracht/post"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '8px', color: 'white', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500, transition: 'var(--transition)', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
          >
            <i className="fa fa-plus"></i>Plaatsen
          </Link>

          <Link
            href="/opdracht/opdrachten"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '8px', color: 'white', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500, transition: 'var(--transition)', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
          >
            <i className="fa fa-list"></i>Opdrachten
          </Link>

          {user?.is_admin && (
            <Link
              href="/admin/panel"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '8px', color: 'white', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500, transition: 'var(--transition)', backgroundColor: 'rgba(255, 100, 0, 0.3)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 100, 0, 0.5)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 100, 0, 0.3)'}
            >
              <i className="fa fa-cog"></i>Beheer
            </Link>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginLeft: 'auto' }}>
          {user && (
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <button
                onClick={handleNotificationClick}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  transition: 'var(--transition)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
              >
                <i className="fa fa-envelope"></i>
              </button>
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  backgroundColor: 'var(--danger)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {unreadCount}
                </span>
              )}
            </div>
          )}
          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '40px',
                right: '20px',
                height: '500px',
                width: '350px',
                backgroundColor: 'white',
                borderRadius: '10px',
                padding: '20px',
                boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
                zIndex: '1000',
              }}
            >
              {!selectedChatroom ? (
                <>
                  <h5>Chatrooms</h5>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {chatrooms.length === 0 ? (
                      <p>Geen chatrooms.</p>
                    ) : (
                      chatrooms.map((chatroom) => (
                        <div
                          key={chatroom.opdracht_id}
                          onClick={() => handleChatroomClick(chatroom)}
                          style={{
                            padding: '10px',
                            border: '1px solid black',
                            cursor: 'pointer',
                            backgroundColor: 'white',
                            color: 'black',
                            borderRadius: '4px',
                            marginBottom: '5px'
                          }}
                        >
                          <strong>{chatroom.opdracht_title}</strong>
                          {chatroom.unread_count > 0 && (
                            <span style={{
                              backgroundColor: 'red',
                              color: 'white',
                              borderRadius: '50%',
                              padding: '2px 6px',
                              fontSize: '10px',
                              marginLeft: '5px'
                            }}>
                              {chatroom.unread_count}
                            </span>
                          )}
                          <br />
                          <small>{chatroom.name} {chatroom.last_name}: {chatroom.latest_message}</small><br />
                          <small>{new Date(chatroom.latest_message_time).toLocaleString()}</small>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h5>{selectedChatroom.opdracht_title}</h5>
                    <button
                      onClick={() => setSelectedChatroom(null)}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                    >
                      ← Terug
                    </button>
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '10px', border: '1px solid #00897b', padding: '10px', borderRadius: '4px' }}>
                    {chatMessages.length === 0 ? (
                      <p>Geen berichten nog.</p>
                    ) : (
                      chatMessages.map((msg) => (
                        <div key={msg.id} style={{
                          marginBottom: '5px',
                          padding: '5px',
                          backgroundColor: msg.user_id === user?.id ? 'green' : '#00897b',
                          color: msg.user_id === user?.id ? 'white' : '',
                          borderRadius: '4px'
                        }}>
                          <strong>{msg.name} {msg.last_name}:</strong> {msg.message}
                          <br />
                          <small>{new Date(msg.created_at).toLocaleString()}</small>
                        </div>
                      ))
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <input
                      type="text"
                      value={newChatMessage}
                      onChange={(e) => setNewChatMessage(e.target.value)}
                      placeholder="Typ je bericht..."
                      style={{ flex: 1, padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendChatMessage()}
                    />
                    <button
                      onClick={handleSendChatMessage}
                      disabled={chatLoading}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      {chatLoading ? '...' : 'Verzenden'}
                    </button>
                  </div>
                </>
              )}
              <button
                onClick={handleNotificationClose}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <i className="fa fa-close"></i>
              </button>
            </div>
          )}
          <button
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: 500,
              transition: 'var(--transition)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
          >
            <i className="fa fa-user"></i>{user?.name}
          </button>

          {user && (
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: 'rgba(255, 100, 100, 0.3)',
                border: 'none',
                color: 'white',
                padding: '0.6rem 1rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: 500,
                transition: 'var(--transition)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 100, 100, 0.5)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 100, 100, 0.3)'}
            >
              <i className="fa fa-sign-out"></i>Uitloggen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', color: 'white', padding: '3rem 2rem', marginTop: 'auto', boxShadow: 'var(--shadow-lg)', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <h4 style={{ marginTop: 0, fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>🚀 Avontuur</h4>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem', lineHeight: 1.6 }}>Een moderne marktplaats voor het plaatsen en vinden van opdrachten.</p>
          </div>
          <div>
            <h5 style={{ marginTop: 0, fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Links</h5>
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
              <li style={{ marginBottom: '0.5rem' }}><a href="/" style={{ color: 'white', opacity: 0.9, textDecoration: 'none', transition: 'var(--transition)' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}>Home</a></li>
              <li style={{ marginBottom: '0.5rem' }}><a href="/opdracht/opdrachten" style={{ color: 'white', opacity: 0.9, textDecoration: 'none', transition: 'var(--transition)' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}>Opdrachten</a></li>
              <li style={{ marginBottom: '0.5rem' }}><a href="/opdracht/post" style={{ color: 'white', opacity: 0.9, textDecoration: 'none', transition: 'var(--transition)' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}>Plaatsen</a></li>
            </ul>
          </div>

        </div>
        <hr style={{ borderColor: 'rgba(255, 255, 255, 0.2)', margin: '2rem 0' }} />
        <div style={{ textAlign: 'center', opacity: 0.85, fontSize: '0.9rem' }}>
          <p style={{ margin: 0 }}>© {new Date().getFullYear()} Avontuur. Alle rechten voorbehouden.</p>
        </div>
      </div>
    </footer>
  );
}

