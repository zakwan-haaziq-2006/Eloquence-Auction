import React from 'react';
import { X, Keyboard } from 'lucide-react';

export default function ShortcutsModal({ onClose }) {
  const shortcuts = [
    { key: 'C', description: 'Bid for Chennai Super Kings (CSK)' },
    { key: 'M', description: 'Bid for Mumbai Indians (MI)' },
    { key: 'R', description: 'Bid for Royal Challengers Bengaluru (RCB)' },
    { key: 'K', description: 'Bid for Kolkata Knight Riders (KKR)' },
    { key: 'S', description: 'Bid for Sunrisers Hyderabad (SRH)' },
    { key: 'G', description: 'Bid for Gujarat Titans (GT)' },
    { key: 'L', description: 'Bid for Lucknow Super Giants (LSG)' },
    { key: 'D', description: 'Bid for Delhi Capitals (DEL)' },
    { key: 'P', description: 'Bid for Punjab Kings (PBKS)' },
    { key: 'J', description: 'Bid for Rajasthan Royals (RR)' },
    { key: 'Q', description: 'Bid for Rising Pune Supergiant (RPS)' },
    { key: 'H', description: 'Bid for Deccan Chargers (DC)' },
    { key: 'SPACE / ENTER', description: 'Mark current player as SOLD to leading team' },
    { key: 'U', description: 'Mark current player as UNSOLD' },
    { key: '→ / N', description: 'Advance to NEXT player' },
    { key: '← / P', description: 'Return to PREVIOUS player' },
    { key: 'Z / Ctrl+Z', description: 'Undo last bid / Undo sale (if player is SOLD)' },
    { key: 'Y / Ctrl+Y', description: 'Redo last undone bid / action' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #00a83b, #063b1c)', border: '1px solid #39ff88', color: '#fff', padding: '0.4rem', borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
              <Keyboard size={18} />
            </div>
            <h3 className="modal-title">OPERATOR KEYBOARD SHORTCUTS</h3>
          </div>
          <button 
            className="icon-btn" 
            onClick={onClose}
            style={{ width: 30, height: 30 }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', maxHeight: '340px', overflowY: 'auto', paddingRight: '0.2rem' }}>
          {shortcuts.map((sc, index) => (
            <div key={index} className="shortcut-row">
              <span style={{ fontSize: '0.82rem', color: '#e0e6e0' }}>
                {sc.description}
              </span>
              <span className="kbd-badge">{sc.key}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '1.2rem', textAlign: 'right' }}>
          <button 
            className="btn-nav" 
            onClick={onClose} 
            style={{ display: 'inline-flex', padding: '0.45rem 1.4rem', justifyContent: 'center' }}
          >
            GOT IT
          </button>
        </div>
      </div>
    </div>
  );
}
