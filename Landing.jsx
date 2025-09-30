import React, { useState } from 'react';

export default function Landing(){
  const [email, setEmail] = useState(localStorage.getItem('lk_email') || '');

  const startCheckout = async () => {
    if (!email) return alert('Enter your email before checkout');
    // create checkout session
    const res = await fetch(`${import.meta.env.VITE_API_URL}/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (data.url) {
      // store email for dashboard identification
      localStorage.setItem('lk_email', email);
      window.location = data.url;
    } else {
      alert('Checkout creation failed');
    }
  };

  return (
    <div className="container">
      <header className="hero">
        <h1>Join the Challenge — Just $7</h1>
        <p>Pay $7 → Ticket credited → Upload → Show on leaderboard</p>
      </header>

      <div className="card">
        <input
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={startCheckout}>Join Now</button>
      </div>

      <footer className="trust">Secure Stripe checkout • Winners announced publicly</footer>
      <div style={{marginTop:12}}>
        <a href="/dashboard">Go to Dashboard</a>
      </div>
    </div>
  );
}
