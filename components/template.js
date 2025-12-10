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
              }}
            >
        {/* LEFT SIDE */}
        <div>
          <Link href="/" className="bar-item button small padding-small theme-d4">
            <i className="fa fa-home margin-right"></i>Startpagina
          </Link>

          {showMijnOpdrachten && (
            <Link
              href="/opdracht/mijn-opdrachten"
              className="bar-item button small padding-small theme-d4"
            >
              <i className="fa fa-list-alt margin-right"></i>Mijn Geplaatste Opdrachten
            </Link>
          )}

          <Link
            href="/opdracht/post"
            className="bar-item button small padding-small theme-d4"
          >
            <i className="fa fa-plus margin-right"></i>Opdracht Plaatsen
          </Link>

          <Link
            href="/opdracht/opdrachten"
            className="bar-item button small padding-small theme-d4"
          >
            <i className="fa fa-list margin-right"></i>Opdrachten
          </Link>

          {user?.is_admin && (
            <Link
              href="/admin/panel"
              className="bar-item button small padding-small theme-d4"
            >
              <i className="fa fa-cog margin-right"></i>Beheer
            </Link>
          )}
    </div>

        {/* RIGHT SIDE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {user && (
            <div style={{ position: 'relative' }}>
              <i
                className="fa fa-envelope"
                onClick={handleNotificationClick}
                style={{ cursor: 'pointer' }}
              />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  backgroundColor: 'red',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '2px 6px',
                  fontSize: '12px',
                  fontWeight: 'bold'
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
          <a
            href="#"
            className="bar-item button small hide-small padding-small hover-white"
          >
            <i className="fa fa-user margin-right"></i> Account
          </a>

          {/* LOGOUT BUTTON */}
          {user && (
            <button
              onClick={handleLogout}
              className="bar-item button small padding-small theme-d4"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <i className="fa fa-sign-out"></i>
              Uitloggen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="container theme-d3 padding-16">
      <h5>Avontuur</h5>
    </footer>
  );
}

