import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Maximize, Minimize, HelpCircle, RefreshCw, Gavel, Users, Shield, Menu, X, BookOpen, LogOut, Play, PlusCircle, ChevronDown, BarChart2 } from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import { AUCTION_SETS } from '../data/auctionData';

export default function Header({ 
  currentSet, 
  soundEnabled, 
  setSoundEnabled, 
  activeTab,
  setActiveTab,
  onOpenHelp, 
  onOpenRules,
  onOpenIntro,
  onOpenAddTeam,
  onResetData,
  onLogout,
  onOpenSetTransition,
  onOpenSetOverview,
  players = [],
  completedPlayersMap = {}
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [setDropdownOpen, setSetDropdownOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const menuButtonRef = useRef(null);
  const menuDropdownRef = useRef(null);
  const setDropdownRef = useRef(null);

  // Sync fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Instant outside click detection using mousedown
  useEffect(() => {
    if (!menuOpen && !setDropdownOpen) return;
    const handleOutsidePointer = (e) => {
      if (
        menuOpen &&
        menuDropdownRef.current && 
        !menuDropdownRef.current.contains(e.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
      if (
        setDropdownOpen &&
        setDropdownRef.current &&
        !setDropdownRef.current.contains(e.target)
      ) {
        setSetDropdownOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setSetDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsidePointer);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsidePointer);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen, setDropdownOpen]);

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
        document.exitFullscreen().catch((err) => {
          console.warn('Error attempting to exit fullscreen:', err);
        });
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

      {/* Set Management Hub in center: Active Set Switcher + Overview Analysis Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', position: 'relative' }} ref={setDropdownRef}>
        <div
          onClick={() => setSetDropdownOpen(prev => !prev)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: 'linear-gradient(135deg, rgba(4, 18, 10, 0.92) 0%, rgba(2, 8, 4, 0.98) 100%)',
            border: '1.5px solid #39ff88',
            borderRadius: '999px',
            padding: '0.35rem 0.85rem',
            boxShadow: '0 0 16px rgba(57, 255, 136, 0.35)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            userSelect: 'none'
          }}
          title="Click to Switch or Load any of the 12 Sets"
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#39ff88', boxShadow: '0 0 8px #39ff88', display: 'inline-block' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.78rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
            {currentSet || 'SET 1 — MARQUEE PLAYERS'}
          </span>
          <ChevronDown size={14} style={{ color: '#39ff88', transform: setDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
        </div>

        {/* Dedicated "VIEW ANALYSIS" Button right next to Set Tag */}
        {onOpenSetOverview && (
          <button
            onClick={onOpenSetOverview}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'linear-gradient(135deg, rgba(0, 168, 59, 0.25) 0%, rgba(4, 14, 8, 0.85) 100%)',
              border: '1px solid rgba(57, 255, 136, 0.45)',
              borderRadius: '999px',
              padding: '0.35rem 0.75rem',
              color: '#39ff88',
              fontFamily: 'var(--font-display)',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
              letterSpacing: '0.06em',
              boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
            title="View Franchise Purse Analysis & Verify Squads"
          >
            <BarChart2 size={13} />
            <span>ANALYSIS</span>
          </button>
        )}

        {/* Dropdown Menu listing all 12 Sets */}
        {setDropdownOpen && (
          <div
            style={{
              position: 'absolute',
              top: '120%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '320px',
              maxHeight: '380px',
              overflowY: 'auto',
              background: 'linear-gradient(170deg, rgba(8, 24, 15, 0.98) 0%, rgba(2, 10, 6, 0.99) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1.5px solid rgba(57, 255, 136, 0.45)',
              borderRadius: '16px',
              boxShadow: '0 15px 45px rgba(0, 0, 0, 0.95), 0 0 25px rgba(57, 255, 136, 0.3)',
              padding: '0.5rem',
              zIndex: 10001,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3rem'
            }}
          >
            <div style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid rgba(57, 255, 136, 0.2)', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: '#39ff88', letterSpacing: '0.1em' }}>
              SELECT SET TO LOAD & VERIFY:
            </div>

            {AUCTION_SETS.map((s) => {
              const isActive = s.name === currentSet;
              const setPlayers = players.filter(p => p.set === s.name);
              const completedCount = setPlayers.filter(p => completedPlayersMap[p.id]).length;

              return (
                <div
                  key={s.id}
                  onClick={() => {
                    setSetDropdownOpen(false);
                    if (onOpenSetTransition) {
                      onOpenSetTransition(s.name);
                    }
                  }}
                  style={{
                    padding: '0.5rem 0.65rem',
                    borderRadius: '10px',
                    background: isActive ? 'linear-gradient(135deg, rgba(0, 168, 59, 0.35) 0%, rgba(6, 18, 11, 0.8) 100%)' : 'rgba(2, 8, 4, 0.6)',
                    border: isActive ? '1px solid #39ff88' : '1px solid rgba(57, 255, 136, 0.15)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.82rem', fontWeight: 800, color: isActive ? '#39ff88' : '#ffffff' }}>
                      {s.name}
                    </div>
                    <div style={{ fontSize: '0.64rem', fontFamily: 'var(--font-mono)', color: '#9eb8a8', marginTop: '0.1rem' }}>
                      {s.id === 12
                        ? (setPlayers.length > 0 ? `${setPlayers.length} Unsold Players • ${completedCount}/${setPlayers.length} Done` : '0 Unsold Players (Reserve Pool)')
                        : `${s.count} Players ${setPlayers.length > 0 ? `• ${completedCount}/${setPlayers.length} Done` : ''}`
                      }
                    </div>
                  </div>

                  <span style={{ fontSize: '0.68rem', color: '#39ff88', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                    LOAD →
                  </span>
                </div>
              );
            })}
          </div>
        )}
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
          className="icon-btn header-sound-btn" 
          onClick={toggleSound} 
          title={soundEnabled ? "Mute Audio FX" : "Enable Audio FX"}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        <button 
          className="icon-btn header-fullscreen-btn" 
          onClick={toggleFullscreen} 
          title={isFullscreen ? "Exit Fullscreen (Minimize)" : "Enter Fullscreen Mode"}
        >
          {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
        </button>

        {/* Right Side Expandable Toggle Menu Button */}
        <button 
          ref={menuButtonRef}
          type="button"
          className="icon-btn header-menu-toggle-btn"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((prev) => !prev);
          }}
          style={{
            background: menuOpen ? 'linear-gradient(135deg, #00a83b, #063b1c)' : 'rgba(8, 24, 15, 0.85)',
            color: menuOpen ? '#FFFFFF' : '#39ff88',
            borderColor: '#39ff88',
            boxShadow: menuOpen ? '0 0 16px rgba(57, 255, 136, 0.6)' : 'none',
            width: 36,
            height: 36,
            borderRadius: '10px',
            cursor: 'pointer'
          }}
          title="Expand Navigation Menu"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Floating Expandable Dropdown Drawer (Fast Instant Render) */}
        {menuOpen && (
          <div 
            ref={menuDropdownRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: '46px',
              right: 0,
              background: '#040e08',
              borderRadius: '16px',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.98), 0 0 25px rgba(0, 168, 59, 0.3)',
              border: '1.5px solid rgba(57, 255, 136, 0.45)',
              padding: '0.65rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              zIndex: 9999,
              minWidth: '235px',
              willChange: 'transform, opacity',
              transform: 'translateZ(0)'
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

            {onOpenAddTeam && (
              <button
                onClick={() => {
                  onOpenAddTeam();
                  setMenuOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.6rem 0.95rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'rgba(56, 189, 248, 0.1)',
                  color: '#38bdf8',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <PlusCircle size={15} />
                <span>+ ADD / MANAGE TEAMS</span>
              </button>
            )}

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
