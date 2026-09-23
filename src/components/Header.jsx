import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Maximize, Minimize, HelpCircle, RefreshCw, Gavel, Users, Shield, Menu, X, BookOpen, LogOut, Play, PlusCircle, ChevronDown, BarChart2, FileDown, Loader2 } from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import { AUCTION_SETS } from '../data/auctionData';
import { generateAuctionReportPdf } from '../utils/pdfExport';

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
  onExportPdf,
  teams = [],
  players = [],
  completedPlayersMap = {}
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [setDropdownOpen, setSetDropdownOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const menuButtonRef = useRef(null);
  const menuDropdownRef = useRef(null);
  const setDropdownRef = useRef(null);

  const handleExportPdfClick = async () => {
    try {
      setIsExporting(true);
      if (soundEnabled) sounds.playBidSound();
      if (onExportPdf) {
        await onExportPdf();
      } else {
        generateAuctionReportPdf({ teams, players, completedPlayersMap });
      }
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('Failed to generate PDF: ' + (err.message || 'Unknown error'));
    } finally {
      setIsExporting(false);
      setMenuOpen(false);
    }
  };

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

  const currentSetObj = AUCTION_SETS.find(s => s.name === currentSet);
  const shortSetName = currentSetObj ? currentSetObj.shortName : (currentSet?.split('—')?.[0]?.trim() || currentSet || 'SET 1');
  const miniSetName = currentSet?.match(/SET\s*\d+/i)?.[0] || 'SET 1';

  return (
    <header className="header-bar">
      {/* Brand & Admin Indicator */}
      <div className="header-brand-section">
        <div className="header-brand-clickable" onClick={() => handleTabSelect('bidding')}>
          <div className="header-brand-avatar">
            <img
              src="/sticker_bidding_doctordoom.png"
              alt="Eloquence 26"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          <div className="header-brand-text">
            <span className="header-brand-title">
              ELOQUENCE <span style={{ color: '#39ff88' }}>'26</span>
            </span>
            <span className="header-brand-subtitle">
              DOOMSDAY AUCTION
            </span>
          </div>
        </div>

        {onLogout && (
          <button
            className="header-logout-btn"
            onClick={onLogout}
            title="Log out of Admin console"
          >
            <LogOut size={12} />
            <span>LOGOUT</span>
          </button>
        )}
      </div>

      {/* Set Management Hub in center: Active Set Switcher + Overview Analysis Button */}
      <div className="header-set-hub" ref={setDropdownRef}>
        <div
          className="header-set-pill"
          onClick={() => setSetDropdownOpen(prev => !prev)}
          title="Click to Switch or Load any of the 12 Sets"
        >
          <span className="header-set-dot" />
          <span className="set-name-full">{currentSet || 'SET 1 — MARQUEE PLAYERS'}</span>
          <span className="set-name-compact">{shortSetName}</span>
          <span className="set-name-mini">{miniSetName}</span>
          <ChevronDown size={14} className="header-set-chevron" style={{ transform: setDropdownOpen ? 'rotate(180deg)' : 'none' }} />
        </div>

        {/* Dedicated "VIEW ANALYSIS" Button right next to Set Tag */}
        {onOpenSetOverview && (
          <button
            className="header-analysis-btn"
            onClick={onOpenSetOverview}
            title="View Franchise Purse Analysis & Verify Squads"
          >
            <BarChart2 size={13} />
            <span>ANALYSIS</span>
          </button>
        )}

        {/* Dropdown Menu listing all 12 Sets */}
        {setDropdownOpen && (
          <div className="header-set-dropdown">
            <div className="header-set-dropdown-title">
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
            className="header-menu-drawer"
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
              minWidth: '240px',
              maxWidth: '90vw',
              willChange: 'transform, opacity',
              transform: 'translateZ(0)'
            }}
          >
            {/* Quick Set Switcher banner (Mobile Only - already present on top bar in laptop view) */}
            <div
              className="menu-drawer-set-banner menu-drawer-mobile-only"
              onClick={() => {
                setMenuOpen(false);
                setSetDropdownOpen(true);
              }}
              style={{
                padding: '0.55rem 0.75rem',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(0, 168, 59, 0.25) 0%, rgba(4, 18, 10, 0.85) 100%)',
                border: '1px solid #39ff88',
                cursor: 'pointer',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem'
              }}
            >
              <div>
                <div style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: '#a3ffd6', letterSpacing: '0.08em' }}>ACTIVE AUCTION SET</div>
                <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#fff' }}>{shortSetName}</div>
              </div>
              <span style={{ fontSize: '0.68rem', color: '#39ff88', fontWeight: 800, fontFamily: 'var(--font-display)' }}>SWITCH ▾</span>
            </div>

            {onOpenSetOverview && (
              <button
                className="menu-drawer-analysis-btn menu-drawer-mobile-only"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenSetOverview();
                }}
                style={{
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.6rem 0.95rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(57, 255, 136, 0.35)',
                  background: 'linear-gradient(135deg, rgba(0, 168, 59, 0.2) 0%, rgba(6, 43, 24, 0.6) 100%)',
                  color: '#39ff88',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <BarChart2 size={15} />
                <span>PURSE & SQUAD ANALYSIS</span>
              </button>
            )}

            {/* Dedicated PDF Export Button in Admin Menu */}
            <button
              onClick={handleExportPdfClick}
              disabled={isExporting}
              title="Download comprehensive PDF report of all teams, purse spent, and auctioned players"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.95rem',
                borderRadius: '10px',
                border: '1px solid rgba(255, 215, 0, 0.45)',
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.22) 0%, rgba(16, 28, 18, 0.85) 100%)',
                color: '#ffd700',
                fontFamily: 'var(--font-display)',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                cursor: isExporting ? 'wait' : 'pointer',
                textAlign: 'left',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.55)',
                transition: 'all 0.2s ease',
                opacity: isExporting ? 0.75 : 1
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                {isExporting ? <Loader2 size={15} className="spin-animation" /> : <FileDown size={15} />}
                <div>
                  <div>{isExporting ? 'GENERATING REPORT...' : 'EXPORT AUCTION REPORT (PDF)'}</div>
                  <div style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: '#d6c19a', fontWeight: 400, marginTop: '1px' }}>
                    Team-wise Squads & Telemetry
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '0.65rem', background: 'rgba(255, 215, 0, 0.2)', padding: '2px 6px', borderRadius: '4px', color: '#fff', fontWeight: 800 }}>
                PDF
              </span>
            </button>

            <div style={{ height: '1px', background: 'rgba(57, 255, 136, 0.15)', margin: '0.1rem 0' }} />

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
