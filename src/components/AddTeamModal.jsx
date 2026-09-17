import React, { useState } from 'react';
import { X, PlusCircle, Trash2, RotateCcw, Shield, Sparkles, AlertCircle } from 'lucide-react';

const PRESET_COLORS = [
  '#F9CD05', // CSK Yellow
  '#004BA0', // MI Blue
  '#EC1C24', // RCB Red
  '#3A225D', // KKR Purple
  '#EA1A85', // RR Pink
  '#F26522', // SRH Orange
  '#1B2133', // GT Navy
  '#0057B2', // LSG Cyan/Blue
  '#00008B', // DC Dark Blue
  '#DD1F2D', // PBKS Crimson
  '#39FF88', // Cyber Green
  '#9333EA', // Neon Purple
  '#06B6D4', // Cyan
  '#F97316'  // Sunset Orange
];

export default function AddTeamModal({ 
  onClose, 
  onAddTeam, 
  onClearAllTeams, 
  onResetDefaultTeams,
  existingTeams = [] 
}) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [purse, setPurse] = useState('80.00');
  const [primaryColor, setPrimaryColor] = useState('#39FF88');
  const [secondaryColor, setSecondaryColor] = useState('#062b18');
  const [customPassword, setCustomPassword] = useState('');
  const [error, setError] = useState('');

  // Determine next suggested hotkey
  const usedHotkeys = new Set(existingTeams.map((t) => String(t.hotkey)));
  const hotkeyCandidates = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Z', 'X', 'C', 'V', 'B', 'N', 'M'];
  const nextHotkey = hotkeyCandidates.find((k) => !usedHotkeys.has(k)) || String(existingTeams.length + 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();

    if (!cleanCode || !cleanName) {
      setError('Please provide both Team Name and Team Code.');
      return;
    }

    // Check for duplicate code or username
    const isDuplicate = existingTeams.some(
      (t) => t.code.toUpperCase() === cleanCode || t.username.toLowerCase() === cleanCode.toLowerCase()
    );
    if (isDuplicate) {
      setError(`Team with code "${cleanCode}" already exists!`);
      return;
    }

    const purseValue = parseFloat(purse) || 80.0;
    const teamUsername = cleanCode.toLowerCase();
    const teamPassword = customPassword.trim() || `${teamUsername}@eloquence`;

    const newTeam = {
      id: teamUsername,
      code: cleanCode,
      name: cleanName,
      username: teamUsername,
      password: teamPassword,
      hotkey: nextHotkey,
      letterKey: cleanCode.charAt(0),
      primaryColor: primaryColor || '#39FF88',
      secondaryColor: secondaryColor || '#020804',
      textColor: '#FFFFFF',
      purseTotal: purseValue,
      purseRemaining: purseValue,
      squadCount: 0,
      squadMax: 16,
      overseasCount: 0,
      overseasMax: 8,
      squadRoleCounts: { Batsman: 0, Bowler: 0, 'All-Rounder': 0, Wicketkeeper: 0 },
      squadTargets: { Batsman: 5, Bowler: 5, 'All-Rounder': 4, Wicketkeeper: 2 },
      acquiredPlayers: []
    };

    onAddTeam(newTeam);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '580px', padding: '1.65rem', borderRadius: '22px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Modal Header */}
        <div className="modal-header" style={{ borderBottom: '1.5px solid rgba(57, 255, 136, 0.3)', paddingBottom: '0.85rem', marginBottom: '1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #00a83b, #063b1c)', border: '1.5px solid #39ff88', color: '#FFFFFF', padding: '0.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', boxShadow: '0 0 14px rgba(57, 255, 136, 0.4)' }}>
              <PlusCircle size={22} />
            </div>
            <div>
              <h3 className="modal-title" style={{ fontSize: '1.15rem', margin: 0, color: '#ffffff' }}>
                ADMIN FRANCHISE MANAGER
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#39ff88', fontWeight: 700, letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
                REGISTER CUSTOM FRANCHISE ({existingTeams.length} TEAMS ACTIVE)
              </span>
            </div>
          </div>

          <button className="icon-btn" onClick={onClose} style={{ width: 32, height: 32 }}>
            <X size={16} />
          </button>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', padding: '0.6rem 0.85rem', borderRadius: '10px', fontSize: '0.78rem', marginBottom: '1rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Add Team Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.85rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ display: 'block', fontSize: '0.72rem', color: '#a3ffd6', fontWeight: 700, marginBottom: '0.35rem', fontFamily: 'var(--font-display)' }}>
                FRANCHISE FULL NAME *
              </label>
              <input
                type="text"
                className="login-input"
                placeholder="e.g. Pune Warriors India"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: '100%', height: '42px' }}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ display: 'block', fontSize: '0.72rem', color: '#a3ffd6', fontWeight: 700, marginBottom: '0.35rem', fontFamily: 'var(--font-display)' }}>
                SHORT CODE *
              </label>
              <input
                type="text"
                className="login-input"
                placeholder="e.g. PWI"
                maxLength={4}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                style={{ width: '100%', height: '42px', textTransform: 'uppercase', fontFamily: 'var(--font-display)', fontWeight: 800 }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ display: 'block', fontSize: '0.72rem', color: '#a3ffd6', fontWeight: 700, marginBottom: '0.35rem', fontFamily: 'var(--font-display)' }}>
                INITIAL PURSE (₹ CRORE)
              </label>
              <input
                type="number"
                step="0.5"
                className="login-input"
                placeholder="80.00"
                value={purse}
                onChange={(e) => setPurse(e.target.value)}
                required
                style={{ width: '100%', height: '42px' }}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ display: 'block', fontSize: '0.72rem', color: '#a3ffd6', fontWeight: 700, marginBottom: '0.35rem', fontFamily: 'var(--font-display)' }}>
                BIDDING HOTKEY (AUTO)
              </label>
              <input
                type="text"
                className="login-input"
                value={`[ ${nextHotkey} ] Key`}
                disabled
                style={{ width: '100%', height: '42px', opacity: 0.8, color: '#ffd700', fontFamily: 'var(--font-mono)' }}
              />
            </div>
          </div>

          {/* Color Palette Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', color: '#a3ffd6', fontWeight: 700, marginBottom: '0.45rem', fontFamily: 'var(--font-display)' }}>
              PRIMARY THEME COLOR
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setPrimaryColor(c)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: c,
                    border: primaryColor === c ? '2.5px solid #ffffff' : '1px solid rgba(0,0,0,0.4)',
                    boxShadow: primaryColor === c ? `0 0 12px ${c}` : 'none',
                    cursor: 'pointer',
                    transform: primaryColor === c ? 'scale(1.18)' : 'scale(1)',
                    transition: 'all 0.2s ease'
                  }}
                />
              ))}
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                style={{ width: 34, height: 34, borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'transparent' }}
                title="Custom Color"
              />
            </div>
          </div>

          {/* Live Badge Preview */}
          <div style={{ background: 'rgba(2, 8, 4, 0.75)', border: '1px solid rgba(57, 255, 136, 0.2)', padding: '0.75rem 1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div 
                style={{ 
                  width: 44, 
                  height: 44, 
                  borderRadius: '10px', 
                  backgroundColor: primaryColor, 
                  color: '#FFFFFF', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: '1.2rem',
                  boxShadow: `0 0 16px ${primaryColor}88`
                }}
              >
                {code || '???'}
              </div>
              <div>
                <h4 style={{ margin: 0, color: '#ffffff', fontSize: '0.95rem', fontFamily: 'var(--font-display)' }}>
                  {name || 'New Franchise Name'}
                </h4>
                <span style={{ fontSize: '0.68rem', color: '#9eb8a8', fontFamily: 'var(--font-mono)' }}>
                  Login: <strong>{code.toLowerCase() || 'code'}</strong> • Password: <strong>{code.toLowerCase() || 'code'}@eloquence</strong>
                </span>
              </div>
            </div>
            <span style={{ fontSize: '0.65rem', color: '#39ff88', border: '1px solid #39ff88', padding: '0.2rem 0.6rem', borderRadius: '999px', fontFamily: 'var(--font-mono)' }}>
              16 Squad (5B•5BW•4AR•2W)
            </span>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button 
              type="submit" 
              className="btn-sold" 
              style={{ flex: 1, height: '44px', justifyContent: 'center', fontSize: '0.95rem' }}
            >
              <PlusCircle size={18} />
              <span>Register Franchise</span>
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              style={{ padding: '0 1.25rem', height: '44px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', borderRadius: '12px', cursor: 'pointer', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.78rem' }}
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Global Team Management Actions */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.6rem' }}>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Clear ALL teams? You can build your franchise list manually from scratch.')) {
                onClearAllTeams();
                onClose();
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              padding: '0.4rem 0.85rem',
              borderRadius: '8px',
              fontFamily: 'var(--font-display)',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
            title="Delete all teams and start empty"
          >
            <Trash2 size={14} />
            <span>Clear All Teams (Start Empty)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Restore standard 10 IPL franchise teams?')) {
                onResetDefaultTeams();
                onClose();
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(57, 255, 136, 0.08)',
              border: '1px solid rgba(57, 255, 136, 0.3)',
              color: '#39ff88',
              padding: '0.4rem 0.85rem',
              borderRadius: '8px',
              fontFamily: 'var(--font-display)',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
            title="Reset to default 10 IPL franchises"
          >
            <RotateCcw size={14} />
            <span>Restore Default 10 IPL Teams</span>
          </button>
        </div>
      </div>
    </div>
  );
}
