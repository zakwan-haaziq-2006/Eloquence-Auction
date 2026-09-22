import React, { useState } from 'react';
import { Users, Check, X, Play } from 'lucide-react';

export default function UpcomingQueue({ 
  players, 
  currentPlayerId, 
  onSelectPlayer, 
  completedPlayersMap,
  onLoadSet
}) {
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [setFilter, setSetFilter] = useState('ALL');

  const availableSets = Array.from(new Set(players.map((p) => p.set).filter(Boolean)));

  const filteredPlayers = players.filter((p) => {
    const matchesRole = roleFilter === 'ALL' || p.role === roleFilter;
    const matchesSet = setFilter === 'ALL' || p.set === setFilter;
    return matchesRole && matchesSet;
  });

  const soldCount = Object.values(completedPlayersMap).filter(s => s === 'SOLD').length;
  const unsoldCount = Object.values(completedPlayersMap).filter(s => s === 'UNSOLD').length;
  const remainingCount = players.length - soldCount - unsoldCount;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem', width: '100%', overflowY: 'auto', height: '100%' }}>
      {/* Top Header Summary & Role Filter Bar */}
      <div 
        style={{ 
          background: 'linear-gradient(165deg, rgba(14, 34, 22, 0.92) 0%, rgba(4, 14, 8, 0.96) 100%)', 
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '16px', 
          border: '1px solid rgba(57, 255, 136, 0.28)', 
          padding: '0.85rem 1.2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.75)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #00a83b, #063b1c)', border: '1.5px solid #39ff88', color: '#FFFFFF', padding: '0.5rem', borderRadius: '10px', display: 'flex', boxShadow: '0 0 12px rgba(57, 255, 136, 0.4)' }}>
            <Users size={20} />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', margin: 0, color: '#ffffff' }}>
              AUCTION ROSTER & QUEUE ({filteredPlayers.length} / {players.length})
            </h3>
            <span style={{ fontSize: '0.74rem', color: '#9eb8a8', fontFamily: 'var(--font-mono)' }}>
              Total: {players.length} • Remaining: {remainingCount} • Sold: {soldCount} • Unsold: {unsoldCount}
            </span>
          </div>
        </div>

        {/* Filter Controls: Set Select + Role Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {/* Set Selector */}
          <select
            value={setFilter}
            onChange={(e) => setSetFilter(e.target.value)}
            style={{
              background: 'rgba(2, 8, 4, 0.9)',
              border: '1px solid rgba(57, 255, 136, 0.35)',
              borderRadius: '8px',
              color: '#39ff88',
              fontFamily: 'var(--font-display)',
              fontSize: '0.74rem',
              fontWeight: 700,
              padding: '0.35rem 0.6rem',
              outline: 'none',
              cursor: 'pointer',
              boxShadow: '0 0 8px rgba(57, 255, 136, 0.2)'
            }}
          >
            <option value="ALL" style={{ background: '#0a1a11', color: '#ffffff' }}>ALL SETS (1–11)</option>
            {availableSets.map((setName) => (
              <option key={setName} value={setName} style={{ background: '#0a1a11', color: '#ffffff' }}>
                {setName}
              </option>
            ))}
          </select>

          {setFilter !== 'ALL' && onLoadSet && (
            <button
              onClick={() => onLoadSet(setFilter)}
              style={{
                background: 'linear-gradient(135deg, #00a83b, #063b1c)',
                border: '1px solid #39ff88',
                color: '#ffffff',
                fontFamily: 'var(--font-display)',
                fontSize: '0.74rem',
                fontWeight: 800,
                padding: '0.35rem 0.8rem',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 0 10px rgba(57, 255, 136, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
              title={`Load ${setFilter} onto live stage with Intro & Verification`}
            >
              <span>LOAD THIS SET →</span>
            </button>
          )}

          {/* Role Filter Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(2, 8, 4, 0.8)', padding: '0.25rem', borderRadius: '12px', border: '1px solid rgba(57, 255, 136, 0.2)', flexWrap: 'wrap' }}>
            {['ALL', 'Batsman', 'Wicketkeeper', 'All-Rounder', 'Bowler'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: '8px',
                  border: roleFilter === role ? '1px solid #39ff88' : '1px solid transparent',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-display)',
                  cursor: 'pointer',
                  background: roleFilter === role ? 'linear-gradient(135deg, #00a83b, #063b1c)' : 'transparent',
                  color: roleFilter === role ? '#FFFFFF' : '#c8c8c8',
                  boxShadow: roleFilter === role ? '0 0 10px rgba(57, 255, 136, 0.4)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {role === 'Wicketkeeper' ? 'WK' : role === 'All-Rounder' ? 'AR' : role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Player Queue Cards Grid */}
      <div className="queue-grid">
        {filteredPlayers.map((player, idx) => {
          const isCurrent = player.id === currentPlayerId;
          const completedState = completedPlayersMap[player.id];

          return (
            <div
              key={player.id}
              onClick={() => onSelectPlayer(player)}
              style={{
                background: isCurrent 
                  ? 'linear-gradient(165deg, rgba(16, 42, 28, 0.95) 0%, rgba(4, 16, 9, 0.98) 100%)' 
                  : 'linear-gradient(165deg, rgba(10, 26, 17, 0.88) 0%, rgba(2, 8, 4, 0.95) 100%)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: '16px',
                border: isCurrent 
                  ? '2px solid #39ff88' 
                  : '1px solid rgba(57, 255, 136, 0.22)',
                padding: '1rem',
                boxShadow: isCurrent 
                  ? '0 10px 30px rgba(0, 0, 0, 0.9), 0 0 20px rgba(57, 255, 136, 0.35)' 
                  : '0 6px 20px rgba(0, 0, 0, 0.6)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                position: 'relative'
              }}
            >
              {/* Card Header: Set Name & Status Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#39ff88', letterSpacing: '0.08em' }}>
                  #{idx + 1} • {player.set || 'SET 1'}
                </span>

                {isCurrent && (
                  <span style={{ background: 'linear-gradient(135deg, #00a83b, #063b1c)', border: '1px solid #39ff88', color: '#FFFFFF', fontSize: '0.62rem', fontWeight: 800, padding: '0.2rem 0.55rem', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: 'var(--font-display)', boxShadow: '0 0 8px rgba(57, 255, 136, 0.5)' }}>
                    <Play size={9} fill="#FFFFFF" /> ON STAGE
                  </span>
                )}

                {completedState === 'SOLD' && (
                  <span style={{ background: 'rgba(0, 168, 59, 0.25)', border: '1px solid #39ff88', color: '#39ff88', fontSize: '0.62rem', fontWeight: 800, padding: '0.2rem 0.55rem', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '0.2rem', fontFamily: 'var(--font-display)' }}>
                    <Check size={11} /> SOLD
                  </span>
                )}

                {completedState === 'UNSOLD' && (
                  <span style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#f87171', fontSize: '0.62rem', fontWeight: 800, padding: '0.2rem 0.55rem', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '0.2rem', fontFamily: 'var(--font-display)' }}>
                    <X size={11} /> UNSOLD
                  </span>
                )}
              </div>

              {/* Player Avatar & Details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div 
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '10px',
                    border: '1.5px solid rgba(57, 255, 136, 0.4)',
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: 'rgba(2, 8, 4, 0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 10px rgba(57, 255, 136, 0.2)'
                  }}
                >
                  {(player.photoUrl || player.image) ? (
                    <img 
                      src={player.photoUrl || player.image} 
                      alt={player.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fb = e.target.parentElement.querySelector('.queue-avatar-fallback');
                        if (fb) fb.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="queue-avatar-fallback" 
                    style={{ 
                      display: (player.photoUrl || player.image) ? 'none' : 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%'
                    }}
                  >
                    <Users size={26} style={{ color: '#39ff88' }} />
                  </div>
                </div>

                <div>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', margin: 0, color: '#ffffff', lineHeight: 1.15 }}>
                    {player.name}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
                    <span className={`role-tag ${player.role}`}>{player.subRole || player.role}</span>
                    <span style={{ fontSize: '0.72rem', color: '#9eb8a8', fontFamily: 'var(--font-mono)' }}>• {player.country} {player.flag}</span>
                  </div>
                </div>
              </div>

              {/* Base Price & Stats Preview */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(2, 8, 4, 0.7)', border: '1px solid rgba(57, 255, 136, 0.15)', padding: '0.4rem 0.75rem', borderRadius: '10px', marginTop: '0.2rem' }}>
                <span style={{ fontSize: '0.7rem', color: '#9eb8a8', fontFamily: 'var(--font-mono)' }}>
                  BASE: <strong style={{ color: '#c8ffea', fontFamily: 'var(--font-display)' }}>₹ {player.basePrice.toFixed(2)} CR</strong>
                </span>

                <span style={{ fontSize: '0.68rem', color: '#39ff88', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                  CLICK TO LOAD →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
