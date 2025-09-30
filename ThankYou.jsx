import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function ThankYou(){
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');

  useEffect(()=> {
    // toast
    alert('✅ Payment received.');
    // redirect to dashboard
    setTimeout(()=> window.location = '/dashboard', 800);
  }, []);

  return (
    <div style={{padding:40}}>
      <h2>Thank you — payment received</h2>
      <p>Session: {sessionId}</p>
    </div>
  );
}
