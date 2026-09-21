import React, { useState } from 'react';
import { Shield, Users, Lock, User, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { ADMIN_CREDENTIALS, INITIAL_TEAMS } from '../data/auctionData';
import bgImage from '../assets/eloquence_auction_bg.jpg';

export default function LoginScreen({ teams = INITIAL_TEAMS, onLoginSuccess, onRefresh, isRefreshing = false }) {
  const [loginMode, setLoginMode] = useState('bidder'); // 'admin' | 'bidder'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const activeTeams = teams && teams.length > 0 ? teams : INITIAL_TEAMS;

  const handleModeSwitch = (mode) => {
    setLoginMode(mode);
    setUsername('');
    setPassword('');
    setErrorMsg('');
  };

  const handleQuickFillTeam = (team) => {
    setLoginMode('bidder');
    setUsername(team.username || team.code?.toLowerCase());
    setPassword('');
    setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUser = username.trim().toLowerCase();

    if (loginMode === 'admin') {
      if (
        (cleanUser === ADMIN_CREDENTIALS.username.toLowerCase() || cleanUser === 'admin' || cleanUser === 'eloquence@admin') &&
        (password === ADMIN_CREDENTIALS.password || password === 'eloquence@auction' || password === 'admin')
      ) {
        onLoginSuccess({ role: 'admin', user: 'Auction Admin' });
      } else {
        setErrorMsg('Invalid Admin credentials!');
      }
    } else {
      // Bidder login: find team by username, code, id, or aliases
      const matchedTeam = activeTeams.find(
        (t) =>
          (t.username && t.username.toLowerCase() === cleanUser) ||
          (t.id && t.id.toLowerCase() === cleanUser) ||
          (t.code && t.code.toLowerCase() === cleanUser) ||
          (t.aliases && Array.isArray(t.aliases) && t.aliases.some((a) => a.toLowerCase() === cleanUser))
      );

      if (matchedTeam) {
        const isPasswordValid =
          password === matchedTeam.password ||
          password === `${matchedTeam.username}@eloquence` ||
          password === `${matchedTeam.username}@revibe` ||
          password === `${matchedTeam.code.toLowerCase()}@eloquence` ||
          password === `${matchedTeam.code.toLowerCase()}@revibe` ||
          (matchedTeam.aliases && Array.isArray(matchedTeam.aliases) && matchedTeam.aliases.some(
            (a) => password === `${a.toLowerCase()}@eloquence` || password === `${a.toLowerCase()}@revibe`
          ));

        if (isPasswordValid) {
          onLoginSuccess({
            role: 'bidder',
            teamId: matchedTeam.id,
            teamName: matchedTeam.name,
            teamCode: matchedTeam.code
          });
        } else {
          setErrorMsg(`Incorrect password for ${matchedTeam.name}! Try '${matchedTeam.username || matchedTeam.code.toLowerCase()}@eloquence'`);
        }
      } else {
        setErrorMsg('Team username not found! Use team code (e.g. rps, dc, csk) or username.');
      }
    }
  };

  return (
    <div
      className="login-screen-overlay"
      style={{ backgroundImage: `linear-gradient(180deg, rgba(2, 8, 4, 0.2) 0%, rgba(2, 8, 4, 0.48) 100%), url(${bgImage})` }}
    >
      <div className="revibe-bg-watermark"></div>

      <div className="login-card-container">
        {/* Brand Header with Doctor Doom Motif */}
        <div className="login-brand-header">
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(57, 255, 136, 0.3) 0%, rgba(0, 168, 59, 0.1) 70%, transparent 100%)',
              border: '1.5px solid #39ff88',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(57, 255, 136, 0.45)',
              overflow: 'hidden'
            }}
          >
            <img
              src="/sticker_bidding_doctordoom.png"
              alt="Doctor Doom Emblem"
              style={{ width: '85%', height: '85%', objectFit: 'contain' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          <div className="brand-text">
            <span className="brand-script" style={{ fontSize: '1.45rem' }}>
              ELOQUENCE <span style={{ color: '#39ff88' }}>'26</span>
            </span>
          </div>
        </div>

        <h2 className="login-title">DOOMSDAY AUCTION PORTAL</h2>
        <p className="login-subtitle">Authenticate to access tactical command center</p>

        {/* Role Selector Tabs */}
        <div className="login-role-tabs">
          <button
            type="button"
            className={`role-tab-btn ${loginMode === 'bidder' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('bidder')}
          >
            <Users size={16} />
            <span>Franchise Bidder</span>
          </button>
          <button
            type="button"
            className={`role-tab-btn ${loginMode === 'admin' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('admin')}
          >
            <Shield size={16} />
            <span>Auction Admin</span>
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {errorMsg && (
            <div className="login-error-banner">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="login-username">
              <User size={14} />
              <span>{loginMode === 'admin' ? 'Admin Username' : 'Franchise Code (e.g. rps, dc, csk, mi)'}</span>
            </label>
            <input
              id="login-username"
              type="text"
              className="login-input"
              placeholder={loginMode === 'admin' ? '' : 'rps / dc / csk'}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">
              <Lock size={14} />
              <span>Password</span>
            </label>
            <input
              id="login-password"
              type="password"
              className="login-input"
              placeholder={loginMode === 'admin' ? '' : 'csk@eloquence'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-submit-btn">
            <span>Enter {loginMode === 'admin' ? 'Auction Management' : 'Bidder Console'}</span>
            <ArrowRight size={17} />
          </button>
        </form>

        {/* Franchise Team Selectors - Only shown for Bidder mode */}
        {loginMode === 'bidder' && activeTeams.length > 0 && (
          <div className="quick-credentials-section">
            <div className="quick-cred-title">
              <Sparkles size={13} /> Quick Select Franchise Team
            </div>
            <div className="quick-cred-buttons" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', maxHeight: '160px', overflowY: 'auto', padding: '0.2rem 0.1rem' }}>
              {activeTeams.map((team) => (
                <button
                  key={team.id}
                  type="button"
                  className="quick-cred-chip"
                  style={{
                    borderColor: team.primaryColor || '#39ff88',
                    color: '#FFF',
                    background: 'rgba(8, 28, 18, 0.75)',
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.78rem',
                    borderRadius: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                  onClick={() => handleQuickFillTeam(team)}
                  title={`Login as ${team.name}`}
                >
                  <span style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: team.primaryColor || '#39ff88',
                    display: 'inline-block'
                  }} />
                  {team.code}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.7rem', color: '#9eb8a8', marginTop: '0.35rem', fontFamily: 'var(--font-mono)' }}>
              Tip: Click any franchise team to auto-fill username!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
