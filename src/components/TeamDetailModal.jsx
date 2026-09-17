import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function TeamDetailModal({ team, onClose }) {
  const [roleFilter, setRoleFilter] = useState('ALL');

  if (!team) return null;

  const purseSpent = team.purseTotal - team.purseRemaining;
  const avgPrice = team.acquiredPlayers.length > 0 
    ? (purseSpent / team.acquiredPlayers.length).toFixed(2)
    : '0.00';

  const filteredPlayers = roleFilter === 'ALL'
    ? team.acquiredPlayers
    : team.acquiredPlayers.filter(p => p.role === roleFilter);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '660px', padding: '1.75rem', borderRadius: '24px' }}>
        {/* Header Ribbon */}
        <div className="modal-header" style={{ borderBottom: `2px solid ${team.primaryColor}`, paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div 
              style={{
                width: 46,
                height: 46,
                borderRadius: '12px',
                backgroundColor: team.primaryColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: team.textColor || '#FFFFFF',
                fontWeight: 900,
                fontFamily: 'var(--font-display)',
                fontSize: '1.3rem',
                boxShadow: `0 0 20px ${team.primaryColor}88`
              }}
            >
              {team.code}
            </div>
            <div>
              <h3 className="modal-title" style={{ fontSize: '1.25rem', margin: 0, color: '#ffffff' }}>
                {team.name}
              </h3>
              <span style={{ fontSize: '0.74rem', color: '#9eb8a8', fontFamily: 'var(--font-mono)' }}>
                COMPLETE SQUAD & PURSE TELEMETRY
              </span>
            </div>
          </div>

          <button 
            className="icon-btn" 
            onClick={onClose}
            style={{ width: 32, height: 32 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Macro Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem', margin: '1rem 0' }}>
          <div className="stat-box" style={{ background: 'rgba(2, 8, 4, 0.85)', padding: '0.6rem 0.4rem' }}>
            <span className="stat-label">REMAINING</span>
            <div className="stat-val" style={{ color: '#39ff88', fontSize: '1.15rem' }}>
              ₹ {team.purseRemaining.toFixed(2)} Cr
            </div>
          </div>

          <div className="stat-box" style={{ background: 'rgba(2, 8, 4, 0.85)', padding: '0.6rem 0.4rem' }}>
            <span className="stat-label">SPENT PURSE</span>
            <div className="stat-val" style={{ color: '#ffd700', fontSize: '1.15rem' }}>
              ₹ {purseSpent.toFixed(2)} Cr
            </div>
          </div>

          <div className="stat-box" style={{ background: 'rgba(2, 8, 4, 0.85)', padding: '0.6rem 0.4rem' }}>
            <span className="stat-label">AVG / PLAYER</span>
            <div className="stat-val" style={{ color: '#38bdf8', fontSize: '1.15rem' }}>
              ₹ {avgPrice} Cr
            </div>
          </div>

          <div className="stat-box" style={{ background: 'rgba(2, 8, 4, 0.85)', padding: '0.6rem 0.4rem' }}>
            <span className="stat-label">SQUAD SIZE</span>
            <div className="stat-val" style={{ color: '#FFFFFF', fontSize: '1.15rem' }}>
              {team.squadCount} / {team.squadMax}
            </div>
            <span style={{ fontSize: '0.62rem', color: '#39ff88', display: 'block', marginTop: '0.1rem', fontFamily: 'var(--font-mono)' }}>
              {team.squadCount >= 15 ? '✓ Mandatory Met' : '15 Mandatory + 3 Flex'}
            </span>
          </div>
        </div>

        {/* Role Composition Progress Grid */}
        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.78rem', letterSpacing: '0.08em', marginBottom: '0.5rem', color: '#a3ffd6' }}>
          ROLE TARGETS PROGRESS (15 MANDATORY + 3 FLEX EXTRA SLOTS)
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <div style={{ background: 'rgba(4, 14, 8, 0.75)', border: '1px solid rgba(57, 255, 136, 0.15)', padding: '0.45rem', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontWeight: 700, color: '#e0e6e0' }}>
              <span>BAT</span>
              <span>{team.squadRoleCounts.Batsman || 0}/{team.squadTargets.Batsman}</span>
            </div>
            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginTop: '0.3rem' }}>
              <div style={{ width: `${Math.min(100, ((team.squadRoleCounts.Batsman || 0) / team.squadTargets.Batsman) * 100)}%`, height: '100%', background: '#38bdf8', borderRadius: '2px', boxShadow: '0 0 6px #38bdf8' }} />
            </div>
          </div>

          <div style={{ background: 'rgba(4, 14, 8, 0.75)', border: '1px solid rgba(57, 255, 136, 0.15)', padding: '0.45rem', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontWeight: 700, color: '#e0e6e0' }}>
              <span>BOWL</span>
              <span>{team.squadRoleCounts.Bowler || 0}/{team.squadTargets.Bowler}</span>
            </div>
            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginTop: '0.3rem' }}>
              <div style={{ width: `${Math.min(100, ((team.squadRoleCounts.Bowler || 0) / team.squadTargets.Bowler) * 100)}%`, height: '100%', background: '#ef4444', borderRadius: '2px', boxShadow: '0 0 6px #ef4444' }} />
            </div>
          </div>

          <div style={{ background: 'rgba(4, 14, 8, 0.75)', border: '1px solid rgba(57, 255, 136, 0.15)', padding: '0.45rem', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontWeight: 700, color: '#e0e6e0' }}>
              <span>AR</span>
              <span>{team.squadRoleCounts['All-Rounder'] || 0}/{team.squadTargets['All-Rounder']}</span>
            </div>
            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginTop: '0.3rem' }}>
              <div style={{ width: `${Math.min(100, ((team.squadRoleCounts['All-Rounder'] || 0) / team.squadTargets['All-Rounder']) * 100)}%`, height: '100%', background: '#39ff88', borderRadius: '2px', boxShadow: '0 0 6px #39ff88' }} />
            </div>
          </div>

          <div style={{ background: 'rgba(4, 14, 8, 0.75)', border: '1px solid rgba(57, 255, 136, 0.15)', padding: '0.45rem', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontWeight: 700, color: '#e0e6e0' }}>
              <span>WK</span>
              <span>{team.squadRoleCounts.Wicketkeeper || 0}/{team.squadTargets.Wicketkeeper}</span>
            </div>
            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginTop: '0.3rem' }}>
              <div style={{ width: `${Math.min(100, ((team.squadRoleCounts.Wicketkeeper || 0) / team.squadTargets.Wicketkeeper) * 100)}%`, height: '100%', background: '#f59e0b', borderRadius: '2px', boxShadow: '0 0 6px #f59e0b' }} />
            </div>
          </div>

          <div style={{ background: 'rgba(4, 14, 8, 0.75)', padding: '0.45rem', borderRadius: '10px', border: '1px solid rgba(214, 193, 154, 0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontWeight: 700, color: '#d6c19a' }}>
              <span>FLEX</span>
              <span>{Math.max(0, team.squadCount - Math.min(5, team.squadRoleCounts.Batsman || 0) - Math.min(5, team.squadRoleCounts.Bowler || 0) - Math.min(3, team.squadRoleCounts['All-Rounder'] || 0) - Math.min(2, team.squadRoleCounts.Wicketkeeper || 0))}/3</span>
            </div>
            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginTop: '0.3rem' }}>
              <div style={{ width: `${Math.min(100, (Math.max(0, team.squadCount - Math.min(5, team.squadRoleCounts.Batsman || 0) - Math.min(5, team.squadRoleCounts.Bowler || 0) - Math.min(3, team.squadRoleCounts['All-Rounder'] || 0) - Math.min(2, team.squadRoleCounts.Wicketkeeper || 0)) / 3) * 100)}%`, height: '100%', background: '#ffd700', borderRadius: '2px', boxShadow: '0 0 6px #ffd700' }} />
            </div>
          </div>
        </div>

        {/* Filter Pills & Acquired Players Roster */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.82rem', letterSpacing: '0.08em', margin: 0, color: '#ffffff' }}>
            ACQUIRED PLAYERS ROSTER ({filteredPlayers.length})
          </h4>

          {/* Role Filter Selector */}
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            {['ALL', 'Batsman', 'Wicketkeeper', 'All-Rounder', 'Bowler'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                style={{
                  padding: '0.25rem 0.6rem',
                  borderRadius: '999px',
                  border: roleFilter === role ? '1px solid #39ff88' : '1px solid rgba(57, 255, 136, 0.25)',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  cursor: 'pointer',
                  background: roleFilter === role ? 'linear-gradient(135deg, #00a83b, #063b1c)' : 'rgba(255, 255, 255, 0.05)',
                  color: roleFilter === role ? '#FFFFFF' : '#c8c8c8',
                  boxShadow: roleFilter === role ? '0 0 12px rgba(57, 255, 136, 0.4)' : 'none'
                }}
              >
                {role === 'Wicketkeeper' ? 'WK' : role === 'All-Rounder' ? 'AR' : role}
              </button>
            ))}
          </div>
        </div>

        {/* Players Roster Table */}
        <div style={{ maxHeight: '240px', overflowY: 'auto', borderRadius: '12px', border: '1px solid rgba(57, 255, 136, 0.2)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: 'rgba(2, 8, 4, 0.9)', color: '#39ff88', textAlign: 'left', fontFamily: 'var(--font-display)', fontSize: '0.72rem' }}>
                <th style={{ padding: '0.55rem 0.85rem' }}>PLAYER</th>
                <th style={{ padding: '0.55rem 0.85rem' }}>ROLE</th>
                <th style={{ padding: '0.55rem 0.85rem', textAlign: 'right' }}>PRICE</th>
                <th style={{ padding: '0.55rem 0.85rem', textAlign: 'right' }}>% PURSE</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((player, idx) => {
                const playerPurseShare = ((player.price / team.purseTotal) * 100).toFixed(1);

                return (
                  <tr 
                    key={idx} 
                    style={{ 
                      borderBottom: '1px solid rgba(57, 255, 136, 0.1)',
                      background: idx % 2 === 0 ? 'rgba(8, 24, 15, 0.5)' : 'rgba(4, 14, 8, 0.7)' 
                    }}
                  >
                    <td style={{ padding: '0.5rem 0.85rem', fontWeight: 700, color: '#ffffff' }}>{player.name}</td>
                    <td style={{ padding: '0.5rem 0.85rem' }}>
                      <span className={`role-tag ${player.role}`}>{player.role}</span>
                    </td>
                    <td style={{ padding: '0.5rem 0.85rem', textAlign: 'right', fontWeight: 800, color: '#39ff88', fontFamily: 'var(--font-display)' }}>
                      ₹ {player.price.toFixed(2)} Cr
                    </td>
                    <td style={{ padding: '0.5rem 0.85rem', textAlign: 'right', color: '#9eb8a8', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                      {playerPurseShare}%
                    </td>
                  </tr>
                );
              })}
              {filteredPlayers.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '1.5rem', textAlign: 'center', color: '#9eb8a8', fontFamily: 'var(--font-mono)' }}>
                    No players matching filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
