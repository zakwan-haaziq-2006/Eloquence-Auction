import React from 'react';
import { X, BookOpen, ShieldAlert, CheckCircle } from 'lucide-react';
import { SGC_AUCTION_RULES } from '../data/auctionData';

export default function RulesModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '680px', padding: '1.75rem', borderRadius: '24px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ borderBottom: '1.5px solid rgba(57, 255, 136, 0.3)', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #00a83b, #063b1c)', border: '1.5px solid #39ff88', color: '#FFFFFF', padding: '0.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', boxShadow: '0 0 14px rgba(57, 255, 136, 0.4)' }}>
              <BookOpen size={22} />
            </div>
            <div>
              <h3 className="modal-title" style={{ fontSize: '1.15rem', margin: 0, color: '#ffffff' }}>
                ELOQUENCE '26 — DOOMSDAY AUCTION RULES
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#39ff88', fontWeight: 700, letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
                OFFICIAL GUIDELINES & SQUAD CONSTRAINTS (₹80 CR PURSE • EXACT 18 PLAYERS)
              </span>
            </div>
          </div>

          <button className="icon-btn" onClick={onClose} style={{ width: 32, height: 32 }}>
            <X size={16} />
          </button>
        </div>

        {/* Rules Highlights Banner */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', marginBottom: '1rem' }}>
          <div className="stat-box" style={{ background: 'rgba(2, 8, 4, 0.85)', padding: '0.6rem' }}>
            <span className="stat-label">TOTAL PURSE</span>
            <div className="stat-val" style={{ color: '#39ff88', fontSize: '1.2rem' }}>₹ 80.00 Cr</div>
          </div>
          <div className="stat-box" style={{ background: 'rgba(2, 8, 4, 0.85)', padding: '0.6rem' }}>
            <span className="stat-label">EXACT SQUAD</span>
            <div className="stat-val" style={{ color: '#FFFFFF', fontSize: '1.2rem' }}>18 Players</div>
          </div>
          <div className="stat-box" style={{ background: 'rgba(2, 8, 4, 0.85)', padding: '0.6rem' }}>
            <span className="stat-label">MANDATORY ROLES</span>
            <div className="stat-val" style={{ color: '#ffd700', fontSize: '0.85rem', marginTop: '0.2rem' }}>5 Bat • 5 Bowl • 3 AR • 2 WK</div>
          </div>
        </div>

        {/* 14 Official Rules Scroll List */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {SGC_AUCTION_RULES.map((rule) => (
            <div 
              key={rule.id}
              style={{
                background: 'rgba(4, 16, 9, 0.75)',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                borderLeft: '4px solid #39ff88',
                borderTop: '1px solid rgba(57, 255, 136, 0.15)',
                borderRight: '1px solid rgba(57, 255, 136, 0.15)',
                borderBottom: '1px solid rgba(57, 255, 136, 0.15)',
                display: 'flex',
                gap: '0.85rem',
                alignItems: 'flex-start'
              }}
            >
              <div 
                style={{
                  background: 'linear-gradient(135deg, #00a83b, #063b1c)',
                  border: '1px solid #39ff88',
                  color: '#ffffff',
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-display)',
                  flexShrink: 0,
                  marginTop: '0.1rem',
                  boxShadow: '0 0 8px rgba(57, 255, 136, 0.4)'
                }}
              >
                {rule.id}
              </div>
              <div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.88rem', margin: '0 0 0.25rem 0', color: '#ffffff', letterSpacing: '0.04em' }}>
                  {rule.title}
                </h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#c8c8c8', lineHeight: 1.45 }}>
                  {rule.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
