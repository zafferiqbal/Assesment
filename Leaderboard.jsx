import React from 'react';

export default function Leaderboard({ entries }) {
  return (
    <div style={{marginTop:20}}>
      <h3>Leaderboard / Submissions</h3>
      <ul>
        {entries.map(e => (
          <li key={e._id}>
            <a href={e.url} target="_blank" rel="noreferrer">{e.title}</a>
            {' '}— <small>{e.authorEmail || 'unknown'}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
