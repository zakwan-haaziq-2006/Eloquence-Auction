import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Maximize, HelpCircle, RefreshCw, Gavel, Users, Shield, Menu, X, BookOpen, LogOut, Play } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function Header({ 
  currentSet, 
  soundEnabled, 
  setSoundEnabled, 
  activeTab,
  setActiveTab,
  onOpenHelp, 
  onOpenRules,
  onOpenIntro,
  onResetData,
  onLogout
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.header-controls')) {
        setMenuOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('click', handleOutsideClick);
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    sounds.setEnabled(nextState);
    if (nextState) sounds.playBidSound();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Error attempting to enable fullscreen:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleTabSelect = (tab) => {
    setActiveTab(tab);
    setMenuOpen(false);
  };

  return (
    <header className="header-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1000, position: 'relative' }}>
      {/* Brand & Admin Indicator */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => handleTabSelect('bidding')}>
          <div 
            style={{ 
              width: 32, 
              height: 32, 
              borderRadius: '8px', 
              background: 'linear-gradient(135deg, #00a83b 0%, #063b1c 100%)', 
              border: '1.5px solid #39ff88',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(57, 255, 136, 0.45)',
              overflow: 'hidden'
            }}
          >
            <img 
              src="/sticker_bidding_doctordoom.png" 
              alt="Eloquence 26" 
              style={{ width: '90%', height: '90%', objectFit: 'contain' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.92rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.08em', textShadow: '0 0 10px rgba(57, 255, 136, 0.4)' }}>
              ELOQUENCE <span style={{ color: '#39ff88' }}>'26</span>
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: '#a3ffd6', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '2px' }}>
              DOOMSDAY AUCTION
            </span>
          </div>
        </div>

        {onLogout && (
          <button
            className="header-logout-btn"
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.65rem',
              borderRadius: '999px',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#f87171',
              fontFamily: 'var(--font-display)',
              fontSize: '0.7rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              transition: 'all 0.2s ease',
              marginLeft: '0.5rem'
            }}
            title="Log out of Admin console"
          >
            <LogOut size={12} />
            <span>LOGOUT</span>
          </button>
        )}
      </div>

      {/* Set indicator tag in center */}
      <div className="header-set-tag">
        {currentSet || 'SET 1 — MARQUEE PLAYERS'}
      </div>

      {/* Right Controls + Expandable Toggle Bar Button */}
      <div className="header-controls" style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.45rem', position: 'relative' }}>
        {onOpenIntro && (
          <button
            className="header-intro-btn"
            onClick={onOpenIntro}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.8rem',
              borderRadius: '999px',
              border: '1px solid rgba(214, 193, 154, 0.45)',
              background: 'linear-gradient(135deg, rgba(214, 193, 154, 0.18) 0%, rgba(6, 18, 11, 0.7) 100%)',
              backdropFilter: 'blur(10px)',
              color: '#d6c19a',
              fontFamily: 'var(--font-display)',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer',
              letterSpacing: '0.06em',
              boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
              transition: 'all 0.2s ease'
            }}
            title="Play 10-Second Countdown & Intro Animation"
          >
            <Play size={13} fill="currentColor" />
            <span>INTRO</span>
          </button>
        )}

        <button
          className="header-rules-btn"
          onClick={onOpenRules}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.8rem',
            borderRadius: '999px',
            border: '1px solid rgba(57, 255, 136, 0.45)',
            background: 'linear-gradient(135deg, rgba(0, 168, 59, 0.25) 0%, rgba(6, 18, 11, 0.75) 100%)',
            backdropFilter: 'blur(10px)',
            color: '#39ff88',
            fontFamily: 'var(--font-display)',
            fontSize: '0.74rem',
            fontWeight: 800,
            cursor: 'pointer',
            letterSpacing: '0.06em',
            boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
            transition: 'all 0.2s ease'
          }}
          title="View Official Eloquence Auction Rules"
        >
          <BookOpen size={13} />
          <span>RULES</span>
        </button>

        <button 
          className="icon-btn header-sound-btn" 
          onClick={toggleSound} 
          title={soundEnabled ? "Mute Audio FX" : "Enable Audio FX"}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        <button 
          className="icon-btn header-fullscreen-btn" 
          onClick={toggleFullscreen} 
          title="Toggle Fullscreen Mode"
        >
          <Maximize size={16} />
        </button>

        <button 
          className="icon-btn header-help-btn" 
          onClick={onOpenHelp} 
          title="Keyboard Hotkey Guide (?)"
        >
          <HelpCircle size={16} />
        </button>

        <button 
          className="icon-btn header-reset-btn" 
          onClick={onResetData} 
          title="Reset Auction Demo Data"
        >
          <RefreshCw size={16} />
        </button>

        {/* Right Side Expandable Toggle Menu Button */}
        <button 
          className="icon-btn"
          onClick={() => setMenuOpen((prev) => !prev)}
          style={{
            background: menuOpen ? 'linear-gradient(135deg, #00a83b, #063b1c)' : 'rgba(8, 24, 15, 0.85)',
            color: menuOpen ? '#FFFFFF' : '#39ff88',
            borderColor: '#39ff88',
            boxShadow: menuOpen ? '0 0 16px rgba(57, 255, 136, 0.6)' : 'none',
            width: 36,
            height: 36,
            borderRadius: '10px'
          }}
          title="Expand Navigation Menu"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Floating Expandable Dropdown Drawer (Cyber Style) */}
        {menuOpen && (
          <div 
            style={{
              position: 'absolute',
              top: '46px',
              right: 0,
              background: 'rgba(4, 12, 7, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '18px',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.95), 0 0 25px rgba(0, 168, 59, 0.25)',
              border: '1.5px solid rgba(57, 255, 136, 0.35)',
              padding: '0.65rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              zIndex: 9999,
              minWidth: '230px'
            }}
          >
            <button
              onClick={() => handleTabSelect('bidding')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.6rem 0.95rem',
                borderRadius: '10px',
                border: activeTab === 'bidding' ? '1px solid #39ff88' : '1px solid transparent',
                background: activeTab === 'bidding' ? 'linear-gradient(135deg, rgba(0, 168, 59, 0.4) 0%, rgba(6, 43, 24, 0.7) 100%)' : 'rgba(255, 255, 255, 0.04)',
                color: activeTab === 'bidding' ? '#39ff88' : '#e0e6e0',
                fontFamily: 'var(--font-display)',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <Gavel size={15} />
              <span>BIDDING CONSOLE</span>
            </button>

            <button
              onClick={() => handleTabSelect('teams')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.6rem 0.95rem',
                borderRadius: '10px',
                border: activeTab === 'teams' ? '1px solid #39ff88' : '1px solid transparent',
                background: activeTab === 'teams' ? 'linear-gradient(135deg, rgba(0, 168, 59, 0.4) 0%, rgba(6, 43, 24, 0.7) 100%)' : 'rgba(255, 255, 255, 0.04)',
                color: activeTab === 'teams' ? '#39ff88' : '#e0e6e0',
                fontFamily: 'var(--font-display)',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <Shield size={15} />
              <span>LIVE TEAM OVERVIEW</span>
            </button>

            <button
              onClick={() => handleTabSelect('queue')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.6rem 0.95rem',
                borderRadius: '10px',
                border: activeTab === 'queue' ? '1px solid #39ff88' : '1px solid transparent',
                background: activeTab === 'queue' ? 'linear-gradient(135deg, rgba(0, 168, 59, 0.4) 0%, rgba(6, 43, 24, 0.7) 100%)' : 'rgba(255, 255, 255, 0.04)',
                color: activeTab === 'queue' ? '#39ff88' : '#e0e6e0',
                fontFamily: 'var(--font-display)',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <Users size={15} />
              <span>AUCTION QUEUE</span>
            </button>

            <div style={{ height: '1px', background: 'rgba(57, 255, 136, 0.15)', margin: '0.2rem 0' }} />

            <button
              onClick={() => {
                onOpenRules();
                setMenuOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.6rem 0.95rem',
                borderRadius: '10px',
                border: 'none',
                background: 'rgba(57, 255, 136, 0.08)',
                color: '#39ff88',
                fontFamily: 'var(--font-display)',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <BookOpen size={15} />
              <span>AUCTION RULES</span>
            </button>

            {onOpenIntro && (
              <button
                onClick={() => {
                  onOpenIntro();
                  setMenuOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.6rem 0.95rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'rgba(214, 193, 154, 0.1)',
                  color: '#d6c19a',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Play size={15} />
                <span>PLAY INTRO & COUNTDOWN</span>
              </button>
            )}

            <button
              onClick={() => {
                onOpenHelp();
                setMenuOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.6rem 0.95rem',
                borderRadius: '10px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.04)',
                color: '#c8c8c8',
                fontFamily: 'var(--font-display)',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <HelpCircle size={15} />
              <span>KEYBOARD SHORTCUTS</span>
            </button>

            <button
              onClick={() => {
                onResetData();
                setMenuOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.6rem 0.95rem',
                borderRadius: '10px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.04)',
                color: '#ffd700',
                fontFamily: 'var(--font-display)',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <RefreshCw size={15} />
              <span>RESET DEMO DATA</span>
            </button>

            {onLogout && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.6rem 0.95rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'rgba(239, 68, 68, 0.12)',
                  color: '#f87171',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <LogOut size={15} />
                <span>LOGOUT ADMIN</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
