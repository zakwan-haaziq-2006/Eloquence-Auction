import React, { useState, useRef } from 'react';
import { X, ChevronUp, ChevronDown, RotateCcw } from 'lucide-react';
import { INITIAL_PLAYERS } from '../data/auctionData';

export default function TeamDetailModal({ team, onClose, onUndoSale }) {
  const [roleFilter, setRoleFilter] = useState('ALL');
  const scrollBodyRef = useRef(null);
  const tableContainerRef = useRef(null);

  if (!team) return null;

  const purseSpent = team.purseTotal - team.purseRemaining;
  const avgPrice = team.acquiredPlayers.length > 0 
    ? (purseSpent / team.acquiredPlayers.length).toFixed(2)
    : '0.00';

  const filteredPlayers = roleFilter === 'ALL'
    ? team.acquiredPlayers
    : team.acquiredPlayers.filter(p => p.role === roleFilter);

  const handleScrollUp = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollBy({ top: -140, behavior: 'smooth' });
    } else if (scrollBodyRef.current) {
      scrollBodyRef.current.scrollBy({ top: -140, behavior: 'smooth' });
    }
  };

  const handleScrollDown = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollBy({ top: 140, behavior: 'smooth' });
    } else if (scrollBodyRef.current) {
      scrollBodyRef.current.scrollBy({ top: 140, behavior: 'smooth' });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card team-detail-modal-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '720px', 
          maxHeight: '88vh', 
          display: 'flex', 
          flexDirection: 'column', 
          padding: '1.5rem', 
          borderRadius: '24px', 
          overflow: 'hidden' 
        }}
      >
        {/* Header Ribbon */}
        <div className="modal-header" style={{ borderBottom: `2px solid ${team.primaryColor}`, paddingBottom: '0.85rem', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div 
              style={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                backgroundColor: team.primaryColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: team.textColor || '#FFFFFF',
                fontWeight: 900,
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem',
                boxShadow: `0 0 20px ${team.primaryColor}88`
              }}
            >
              {team.code}
            </div>
            <div>
              <h3 className="modal-title" style={{ fontSize: '1.2rem', margin: 0, color: '#ffffff' }}>
                {team.name}
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#9eb8a8', fontFamily: 'var(--font-mono)' }}>
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

        {/* Scrollable Modal Content Body */}
        <div 
          ref={scrollBodyRef}
          className="modal-scrollable-body"
          style={{ 
            flex: 1, 
            minHeight: 0, 
            overflowY: 'auto', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.85rem', 
            paddingRight: '0.45rem', 
            marginTop: '0.5rem',
            overscrollBehavior: 'contain'
          }}
        >
          {/* Macro Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.6rem' }}>
            <div className="stat-box" style={{ background: 'rgba(2, 8, 4, 0.85)', padding: '0.6rem 0.5rem' }}>
              <span className="stat-label">REMAINING</span>
              <div className="stat-val" style={{ color: '#39ff88', fontSize: '1.15rem' }}>
                ₹ {team.purseRemaining.toFixed(2)} Cr
              </div>
            </div>

            <div className="stat-box" style={{ background: 'rgba(2, 8, 4, 0.85)', padding: '0.6rem 0.5rem' }}>
              <span className="stat-label">SPENT PURSE</span>
              <div className="stat-val" style={{ color: '#ffd700', fontSize: '1.15rem' }}>
                ₹ {purseSpent.toFixed(2)} Cr
              </div>
            </div>

            <div className="stat-box" style={{ background: 'rgba(2, 8, 4, 0.85)', padding: '0.6rem 0.5rem' }}>
              <span className="stat-label">AVG / PLAYER</span>
              <div className="stat-val" style={{ color: '#38bdf8', fontSize: '1.15rem' }}>
                ₹ {avgPrice} Cr
              </div>
            </div>

            <div className="stat-box" style={{ background: 'rgba(2, 8, 4, 0.85)', padding: '0.6rem 0.5rem' }}>
              <span className="stat-label">SQUAD SIZE</span>
              <div className="stat-val" style={{ color: '#FFFFFF', fontSize: '1.15rem' }}>
                {team.squadCount} / {team.squadMax}
              </div>
              <span style={{ fontSize: '0.62rem', color: '#39ff88', display: 'block', marginTop: '0.1rem', fontFamily: 'var(--font-mono)' }}>
                {team.squadCount >= (team.squadMax || 16) ? '✓ 16 Squad Complete' : `${16 - team.squadCount} Slots Needed`}
              </span>
            </div>
          </div>

          {/* Role Composition Progress Grid */}
          <div>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.76rem', letterSpacing: '0.08em', marginBottom: '0.45rem', color: '#a3ffd6' }}>
              ROLE TARGETS PROGRESS (5 BAT • 5 BOWL • 4 AR • 2 WK)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              <div style={{ background: 'rgba(4, 14, 8, 0.75)', border: '1px solid rgba(57, 255, 136, 0.15)', padding: '0.45rem', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontWeight: 700, color: '#e0e6e0' }}>
                  <span>BAT</span>
                  <span>{team.squadRoleCounts?.Batsman || 0}/{team.squadTargets?.Batsman || 5}</span>
                </div>
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginTop: '0.3rem' }}>
                  <div style={{ width: `${Math.min(100, ((team.squadRoleCounts?.Batsman || 0) / (team.squadTargets?.Batsman || 5)) * 100)}%`, height: '100%', background: '#38bdf8', borderRadius: '2px', boxShadow: '0 0 6px #38bdf8' }} />
                </div>
              </div>

              <div style={{ background: 'rgba(4, 14, 8, 0.75)', border: '1px solid rgba(57, 255, 136, 0.15)', padding: '0.45rem', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontWeight: 700, color: '#e0e6e0' }}>
                  <span>BOWL</span>
                  <span>{team.squadRoleCounts?.Bowler || 0}/{team.squadTargets?.Bowler || 5}</span>
                </div>
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginTop: '0.3rem' }}>
                  <div style={{ width: `${Math.min(100, ((team.squadRoleCounts?.Bowler || 0) / (team.squadTargets?.Bowler || 5)) * 100)}%`, height: '100%', background: '#ef4444', borderRadius: '2px', boxShadow: '0 0 6px #ef4444' }} />
                </div>
              </div>

              <div style={{ background: 'rgba(4, 14, 8, 0.75)', border: '1px solid rgba(57, 255, 136, 0.15)', padding: '0.45rem', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontWeight: 700, color: '#e0e6e0' }}>
                  <span>AR</span>
                  <span>{team.squadRoleCounts?.['All-Rounder'] || 0}/{team.squadTargets?.['All-Rounder'] || 4}</span>
                </div>
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginTop: '0.3rem' }}>
                  <div style={{ width: `${Math.min(100, ((team.squadRoleCounts?.['All-Rounder'] || 0) / (team.squadTargets?.['All-Rounder'] || 4)) * 100)}%`, height: '100%', background: '#39ff88', borderRadius: '2px', boxShadow: '0 0 6px #39ff88' }} />
                </div>
              </div>

              <div style={{ background: 'rgba(4, 14, 8, 0.75)', border: '1px solid rgba(57, 255, 136, 0.15)', padding: '0.45rem', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontWeight: 700, color: '#e0e6e0' }}>
                  <span>WK</span>
                  <span>{team.squadRoleCounts?.Wicketkeeper || 0}/{team.squadTargets?.Wicketkeeper || 2}</span>
                </div>
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginTop: '0.3rem' }}>
                  <div style={{ width: `${Math.min(100, ((team.squadRoleCounts?.Wicketkeeper || 0) / (team.squadTargets?.Wicketkeeper || 2)) * 100)}%`, height: '100%', background: '#f59e0b', borderRadius: '2px', boxShadow: '0 0 6px #f59e0b' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Filter Pills & Acquired Players Roster with Quick Scroll Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.2rem' }}>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', letterSpacing: '0.08em', margin: 0, color: '#ffffff' }}>
              ACQUIRED PLAYERS ROSTER ({filteredPlayers.length})
            </h4>

            {/* Role Filter Selector & Scroll Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
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

              {/* Quick Scroll Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', borderLeft: '1px solid rgba(57, 255, 136, 0.25)', paddingLeft: '0.45rem' }}>
                <button
                  type="button"
                  onClick={handleScrollUp}
                  className="roster-scroll-btn"
                  title="Scroll roster up"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '26px',
                    height: '26px',
                    borderRadius: '8px',
                    border: '1px solid rgba(57, 255, 136, 0.35)',
                    background: 'rgba(2, 12, 6, 0.85)',
                    color: '#39ff88',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <ChevronUp size={15} />
                </button>
                <button
                  type="button"
                  onClick={handleScrollDown}
                  className="roster-scroll-btn"
                  title="Scroll roster down"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '26px',
                    height: '26px',
                    borderRadius: '8px',
                    border: '1px solid rgba(57, 255, 136, 0.35)',
                    background: 'rgba(2, 12, 6, 0.85)',
                    color: '#39ff88',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <ChevronDown size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Players Roster Table with Dedicated Scroll & Sticky Headers */}
          <div 
            ref={tableContainerRef}
            className="roster-table-scroll-container"
            style={{ 
              borderRadius: '12px', 
              border: '1px solid rgba(57, 255, 136, 0.25)', 
              maxHeight: '340px', 
              overflowY: 'auto',
              overflowX: 'auto',
              position: 'relative',
              background: 'rgba(2, 8, 4, 0.65)',
              overscrollBehavior: 'contain'
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr style={{ background: 'rgba(2, 14, 7, 0.98)', color: '#39ff88', textAlign: 'left', fontFamily: 'var(--font-display)', fontSize: '0.72rem', borderBottom: '1.5px solid rgba(57, 255, 136, 0.3)', backdropFilter: 'blur(8px)' }}>
                  <th style={{ padding: '0.65rem 0.85rem' }}>PLAYER</th>
                  <th style={{ padding: '0.65rem 0.85rem' }}>ROLE</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>PRICE</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>% PURSE</th>
                  {onUndoSale && <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>ACTION</th>}
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((player, idx) => {
                  const playerPurseShare = ((player.price / team.purseTotal) * 100).toFixed(1);
                  const matchedFull = INITIAL_PLAYERS.find(p => p.id === player.id || p.name?.toLowerCase() === player.name?.toLowerCase());
                  const playerPhoto = player.photoUrl || player.image || matchedFull?.photoUrl;
                  const initials = player.name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

                  return (
                    <tr 
                      key={idx} 
                      style={{ 
                        borderBottom: '1px solid rgba(57, 255, 136, 0.1)',
                        background: idx % 2 === 0 ? 'rgba(8, 24, 15, 0.5)' : 'rgba(4, 14, 8, 0.7)' 
                      }}
                    >
                      <td style={{ padding: '0.45rem 0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div 
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '8px',
                              border: '1.5px solid rgba(57, 255, 136, 0.35)',
                              overflow: 'hidden',
                              background: 'rgba(2, 10, 5, 0.95)',
                              flexShrink: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 0 8px rgba(57, 255, 136, 0.2)'
                            }}
                          >
                            {playerPhoto ? (
                              <img 
                                src={playerPhoto} 
                                alt={player.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <span 
                              style={{ 
                                display: playerPhoto ? 'none' : 'flex',
                                fontSize: '0.75rem', 
                                fontWeight: 800, 
                                color: '#39ff88', 
                                fontFamily: 'var(--font-display)' 
                              }}
                            >
                              {initials}
                            </span>
                          </div>
                          <div>
                            <span style={{ fontWeight: 700, color: '#ffffff', display: 'block', fontSize: '0.86rem', letterSpacing: '0.02em' }}>
                              {player.name}
                            </span>
                            <span style={{ fontSize: '0.66rem', color: '#9eb8a8', fontFamily: 'var(--font-mono)' }}>
                              {player.country || matchedFull?.country || 'India'} {player.isOverseas || matchedFull?.isOverseas ? '✈️' : ''}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.45rem 0.85rem' }}>
                        <span className={`role-tag ${player.role}`}>{player.role}</span>
                      </td>
                      <td style={{ padding: '0.45rem 0.85rem', textAlign: 'right', fontWeight: 800, color: '#39ff88', fontFamily: 'var(--font-display)' }}>
                        ₹ {player.price.toFixed(2)} Cr
                      </td>
                      <td style={{ padding: '0.45rem 0.85rem', textAlign: 'right', color: '#9eb8a8', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                        {playerPurseShare}%
                      </td>
                      {onUndoSale && (
                        <td style={{ padding: '0.45rem 0.85rem', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Undo sale of ${player.name} to ${team.name}?\n\n₹ ${player.price.toFixed(2)} Cr will be refunded to ${team.code} and ${player.name} will be returned to the live auction pool.`)) {
                                onUndoSale(player);
                              }
                            }}
                            className="roster-undo-btn"
                            title={`Undo sale of ${player.name} & refund purse`}
                          >
                            <RotateCcw size={12} />
                            <span>Undo</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
                {filteredPlayers.length === 0 && (
                  <tr>
                    <td colSpan={onUndoSale ? 5 : 4} style={{ padding: '1.5rem', textAlign: 'center', color: '#9eb8a8', fontFamily: 'var(--font-mono)' }}>
                      No players matching filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
