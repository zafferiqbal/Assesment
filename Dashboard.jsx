import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import UploadForm from './UploadForm';
import Leaderboard from './Leaderboard';

const API_URL = import.meta.env.VITE_API_URL;

export default function Dashboard(){
  const [email, setEmail] = useState(localStorage.getItem('lk_email') || '');
  const [tickets, setTickets] = useState(0);
  const [entries, setEntries] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(()=>{
    // initial fetch entries
    fetch(`${API_URL}/api/entries`).then(r => r.json()).then(setEntries).catch(console.error);
    // socket connection
    const s = io(API_URL);
    setSocket(s);

    s.on('leaderboard:new', (entry) => {
      setEntries(prev => [entry, ...prev]);
    });
    s.on('leaderboard:ticket', (payload) => {
      // optional global broadcast, ignore here
    });
    s.on('connect', () => console.log('socket connected', s.id));

    return () => s.disconnect();
  }, []);

  useEffect(() => {
    if (!socket) return;
    if (email) {
      socket.emit('join', email);
      fetch(`${API_URL}/api/tickets?email=${encodeURIComponent(email)}`)
        .then(r => r.json())
        .then(d => setTickets(d.tickets || 0));
      socket.on('tickets:update', (data) => setTickets(data.tickets));
    }
  }, [email, socket]);

  return (
    <div style={{padding:20}}>
      <h2>Dashboard</h2>
      {!email && (
        <div>
          <input placeholder="Enter your email" onBlur={(e)=>{ localStorage.setItem('lk_email', e.target.value); setEmail(e.target.value); }} />
          <p>Enter your email then reload if needed.</p>
        </div>
      )}

      {email && <p>Signed in as: <strong>{email}</strong></p>}

      <p>Raffle Tickets: <strong>{tickets}</strong></p>

      <UploadForm email={email} />
      <Leaderboard entries={entries} />
    </div>
  );
}
