import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  CheckCircle, 
  UserCheck, 
  Shield, 
  X, 
  BarChart2, 
  Users, 
  Sparkles, 
  Award, 
  DollarSign, 
  ChevronRight,
  ListOrdered
} from 'lucide-react';
import { AUCTION_SETS } from '../data/auctionData';
import { sounds } from '../utils/soundEffects';

export default function CategoryTransitionModal({ 
  completedCategory, 
  nextCategory, 
  nextPlayerCount, 
  nextIdx,
  players = [],
  teams = [],
  completedPlayersMap = {},
  onInspectTeam,
  onProceed,
  onClose,
  onSelectSet
}) {
  // Available views: 'intro' | 'analysis' | 'results'
  const [activeView, setActiveView] = useState('intro');
  const [currentSelectedSet, setCurrentSelectedSet] = useState(
    nextCategory || completedCategory || AUCTION_SETS[0].name
  );

  useEffect(() => {
    sounds.playCategorySound();
    return () => {
      sounds.stopAllAudio();
    };
  }, []);

  // Update selected set if props change
  useEffect(() => {
    if (nextCategory) {
      setCurrentSelectedSet(nextCategory);
    }
  }, [nextCategory]);

  // Players in the selected upcoming/previewed set
  const previewSetPlayers = players.filter((p) => p.set === currentSelectedSet);

  // Players in the completed set (if any)
  const completedSetPlayers = completedCategory 
    ? players.filter((p) => p.set === completedCategory)
    : [];

  // All acquired players mapped with their buyer franchise
  const allAcquired = teams.flatMap((t) => 
    (t.acquiredPlayers || []).map((ap) => ({ ...ap, team: t }))
  );

  // Completed set sold & unsold players
  const completedSoldPlayers = completedSetPlayers
    .filter((p) => completedPlayersMap[p.id] === 'SOLD')
    .map((p) => {
      const acq = allAcquired.find((a) => a.id === p.id);
      return {
        ...p,
        soldPrice: acq?.price || p.basePrice,
        buyerTeam: acq?.team || null
      };
    });

  const completedUnsoldPlayers = completedSetPlayers.filter(
    (p) => completedPlayersMap[p.id] === 'UNSOLD'
  );

  const completedTotalSpent = completedSoldPlayers.reduce(
    (sum, p) => sum + (p.soldPrice || 0), 
    0
  );

  // Overall financial summary across all 10 teams
  const totalPurseAllocated = teams.length * 80.0;
  const totalPurseRemaining = teams.reduce((sum, t) => sum + (t.purseRemaining || 0), 0);
  const totalPurseSpent = +(totalPurseAllocated - totalPurseRemaining).toFixed(2);
  const totalPlayersAcquired = teams.reduce((sum, t) => sum + (t.squadCount || 0), 0);

  // Handle starting/loading the set
  const handleStartSet = (targetSetName) => {
    sounds.stopAllAudio();
    sounds.playBidSound();

    const targetSet = targetSetName || currentSelectedSet;
    const firstPlayerIdx = players.findIndex((p) => p.set === targetSet);
    
    if (firstPlayerIdx !== -1) {
      // Find the first unsold/unauctioned player in this set if possible
      const unauctionedIdx = players.findIndex(
        (p, idx) => idx >= firstPlayerIdx && p.set === targetSet && !completedPlayersMap[p.id]
      );
      const targetIdxToLoad = unauctionedIdx !== -1 ? unauctionedIdx : firstPlayerIdx;
      onProceed(targetIdxToLoad);
    } else {
      onProceed(nextIdx ?? 0);
    }
  };

  return (
    <div className="category-transition-overlay" style={{ zIndex: 99999, overflowY: 'auto' }}>
      <div className="revibe-bg-watermark"></div>

      <div 
        className="set-transition-container"
        style={{
          width: '95%',
          maxWidth: '1240px',
          minHeight: '85vh',
          maxHeight: '92vh',
          margin: 'auto',
          background: 'linear-gradient(170deg, rgba(8, 24, 15, 0.98) 0%, rgba(2, 10, 6, 0.99) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1.5px solid rgba(57, 255, 136, 0.45)',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.95), 0 0 50px rgba(57, 255, 136, 0.3)',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* Modal Top Header Bar */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            borderBottom: '1px solid rgba(57, 255, 136, 0.25)',
            background: 'rgba(2, 8, 4, 0.8)',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          {/* Brand & Mode Label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div 
              style={{ 
                width: 38, 
                height: 38, 
                borderRadius: '10px', 
                background: 'linear-gradient(135deg, #00a83b 0%, #063b1c 100%)', 
                border: '1.5px solid #39ff88',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 14px rgba(57, 255, 136, 0.5)'
              }}
            >
              <Sparkles size={20} style={{ color: '#ffffff' }} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.08em' }}>
                  ELOQUENCE <span style={{ color: '#39ff88' }}>'26</span>
                </span>
                <span style={{ background: 'rgba(57, 255, 136, 0.2)', border: '1px solid #39ff88', color: '#39ff88', fontSize: '0.62rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '999px', fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}>
                  SET VERIFICATION ARENA
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#9eb8a8', fontFamily: 'var(--font-mono)' }}>
                SGC Symposium Official IPL Mega Auction • 200 Players Across 12 Sets
              </span>
            </div>
          </div>

          {/* Center Navigation Tabs: Intro vs Analysis vs Completed Recap */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(2, 8, 4, 0.9)', padding: '0.25rem', borderRadius: '14px', border: '1px solid rgba(57, 255, 136, 0.25)' }}>
            <button
              onClick={() => setActiveView('intro')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.9rem',
                borderRadius: '10px',
                border: activeView === 'intro' ? '1px solid #39ff88' : '1px solid transparent',
                background: activeView === 'intro' ? 'linear-gradient(135deg, #00a83b, #063b1c)' : 'transparent',
                color: activeView === 'intro' ? '#ffffff' : '#a3ffd6',
                fontFamily: 'var(--font-display)',
                fontSize: '0.76rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: activeView === 'intro' ? '0 0 12px rgba(57, 255, 136, 0.4)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Users size={14} />
              <span>SET INTRO & ROSTER</span>
            </button>

            <button
              onClick={() => setActiveView('analysis')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.9rem',
                borderRadius: '10px',
                border: activeView === 'analysis' ? '1px solid #39ff88' : '1px solid transparent',
                background: activeView === 'analysis' ? 'linear-gradient(135deg, #00a83b, #063b1c)' : 'transparent',
                color: activeView === 'analysis' ? '#ffffff' : '#a3ffd6',
                fontFamily: 'var(--font-display)',
                fontSize: '0.76rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: activeView === 'analysis' ? '0 0 12px rgba(57, 255, 136, 0.4)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <BarChart2 size={14} />
              <span>VIEW ANALYSIS & PURSES</span>
            </button>

            {completedCategory && (
              <button
                onClick={() => setActiveView('results')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.9rem',
                  borderRadius: '10px',
                  border: activeView === 'results' ? '1px solid #39ff88' : '1px solid transparent',
                  background: activeView === 'results' ? 'linear-gradient(135deg, #00a83b, #063b1c)' : 'transparent',
                  color: activeView === 'results' ? '#ffffff' : '#a3ffd6',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: activeView === 'results' ? '0 0 12px rgba(57, 255, 136, 0.4)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <CheckCircle size={14} />
                <span>PREVIOUS SET RECAP</span>
              </button>
            )}
          </div>

          {/* Right Action: Set Selector Switcher + Close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <select
              value={currentSelectedSet}
              onChange={(e) => {
                setCurrentSelectedSet(e.target.value);
                if (onSelectSet) onSelectSet(e.target.value);
              }}
              style={{
                background: 'rgba(2, 8, 4, 0.9)',
                border: '1px solid rgba(57, 255, 136, 0.4)',
                borderRadius: '10px',
                color: '#39ff88',
                fontFamily: 'var(--font-display)',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '0.45rem 0.8rem',
                outline: 'none',
                cursor: 'pointer',
                boxShadow: '0 0 10px rgba(57, 255, 136, 0.2)'
              }}
              title="Jump to or preview any of the 12 Sets"
            >
              {AUCTION_SETS.map((s) => (
                <option key={s.id} value={s.name} style={{ background: '#0a1a11', color: '#ffffff' }}>
                  {s.name} ({s.count} Players)
                </option>
              ))}
            </select>

            {onClose && (
              <button 
                onClick={onClose}
                className="icon-btn"
                style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.06)', borderRadius: '10px' }}
                title="Dismiss and return to stage"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Modal Main Body Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          {/* ============================================================ */}
          {/* VIEW 1: SET INTRO & SQUAD ROSTER PREVIEW                     */}
          {/* ============================================================ */}
          {activeView === 'intro' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', animation: 'fadeIn 0.25s ease' }}>
              
              {/* Optional Completed Set Banner if coming directly from a finished set */}
              {completedCategory && (
                <div 
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 168, 59, 0.15) 0%, rgba(2, 8, 4, 0.85) 100%)',
                    border: '1px solid rgba(57, 255, 136, 0.35)',
                    borderRadius: '16px',
                    padding: '0.85rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.8rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: 'rgba(0, 168, 59, 0.3)', border: '1px solid #39ff88', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#39ff88' }}>
                      <CheckCircle size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: '#39ff88', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                        PRECEDING SET FINISHED
                      </div>
                      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', margin: 0, color: '#ffffff' }}>
                        {completedCategory}
                      </h4>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.76rem' }}>
                    <span style={{ color: '#c8ffea' }}>
                      Sold: <strong style={{ color: '#39ff88' }}>{completedSoldPlayers.length}</strong>
                    </span>
                    <span style={{ color: '#c8ffea' }}>
                      Unsold: <strong style={{ color: '#f87171' }}>{completedUnsoldPlayers.length}</strong>
                    </span>
                    <span style={{ color: '#c8ffea' }}>
                      Set Spend: <strong style={{ color: '#ffd700' }}>₹ {completedTotalSpent.toFixed(2)} CR</strong>
                    </span>
                    <button
                      onClick={() => setActiveView('results')}
                      style={{
                        background: 'rgba(57, 255, 136, 0.15)',
                        border: '1px solid #39ff88',
                        color: '#39ff88',
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      VIEW RECAP →
                    </button>
                  </div>
                </div>
              )}

              {/* Hero Upcoming Set Banner */}
              <div 
                style={{
                  background: 'linear-gradient(165deg, rgba(14, 38, 24, 0.95) 0%, rgba(4, 16, 9, 0.98) 100%)',
                  border: '1.5px solid rgba(57, 255, 136, 0.5)',
                  borderRadius: '20px',
                  padding: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(57, 255, 136, 0.25)',
                  flexWrap: 'wrap',
                  gap: '1.2rem'
                }}
              >
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                    <span style={{ background: 'linear-gradient(135deg, #00a83b, #063b1c)', border: '1px solid #39ff88', color: '#ffffff', fontSize: '0.68rem', fontWeight: 900, padding: '0.2rem 0.65rem', borderRadius: '999px', fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}>
                      READY TO AUCTION
                    </span>
                    <span style={{ color: '#a3ffd6', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                      • {previewSetPlayers.length} Elite Players in Pool
                    </span>
                  </div>

                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', margin: 0, color: '#ffffff', letterSpacing: '0.04em', textShadow: '0 0 20px rgba(57, 255, 136, 0.4)' }}>
                    {currentSelectedSet}
                  </h2>

                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#b2d9c4', margin: '0.5rem 0 0 0', lineHeight: 1.4 }}>
                    Franchises can prepare their bidding strategies. Base prices range from ₹{previewSetPlayers.length > 0 ? Math.min(...previewSetPlayers.map(p => p.basePrice)).toFixed(2) : '0.20'} Cr to ₹{previewSetPlayers.length > 0 ? Math.max(...previewSetPlayers.map(p => p.basePrice)).toFixed(2) : '2.00'} Cr.
                  </p>
                </div>

                {/* Primary Dual Actions: View Analysis / Start Set */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setActiveView('analysis')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: 'rgba(6, 18, 11, 0.9)',
                      border: '1.5px solid rgba(57, 255, 136, 0.4)',
                      color: '#39ff88',
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      padding: '0.75rem 1.4rem',
                      borderRadius: '999px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <BarChart2 size={16} />
                    <span>VIEW ANALYSIS & PURSES</span>
                  </button>

                  <button
                    onClick={() => handleStartSet(currentSelectedSet)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      background: 'linear-gradient(135deg, #00a83b 0%, #063b1c 100%)',
                      border: '1.5px solid #39ff88',
                      color: '#ffffff',
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.95rem',
                      fontWeight: 900,
                      padding: '0.8rem 1.8rem',
                      borderRadius: '999px',
                      cursor: 'pointer',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.8), 0 0 25px rgba(57, 255, 136, 0.6)',
                      transition: 'all 0.2s ease',
                      letterSpacing: '0.06em'
                    }}
                  >
                    <span>LOAD & START THIS SET</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>

              {/* Player Roster Grid for this Set */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 800, color: '#39ff88', letterSpacing: '0.08em' }}>
                    PLAYERS IN THIS SET ({previewSetPlayers.length})
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#9eb8a8' }}>
                    Click "LOAD & START THIS SET" above to begin live bidding
                  </span>
                </div>

                <div 
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: '0.75rem',
                    maxHeight: '44vh',
                    overflowY: 'auto',
                    paddingRight: '0.4rem'
                  }}
                >
                  {previewSetPlayers.map((player, idx) => {
                    const completedState = completedPlayersMap[player.id];
                    const acqInfo = allAcquired.find((a) => a.id === player.id);

                    return (
                      <div
                        key={player.id}
                        style={{
                          background: 'linear-gradient(165deg, rgba(10, 26, 17, 0.85) 0%, rgba(2, 8, 4, 0.95) 100%)',
                          border: '1px solid rgba(57, 255, 136, 0.2)',
                          borderRadius: '14px',
                          padding: '0.75rem 0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                          position: 'relative'
                        }}
                      >
                        {/* Avatar */}
                        <div 
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: '10px',
                            border: '1px solid rgba(57, 255, 136, 0.35)',
                            overflow: 'hidden',
                            flexShrink: 0,
                            background: 'rgba(2, 8, 4, 0.9)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {player.photoUrl ? (
                            <img src={player.photoUrl} alt={player.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Users size={22} style={{ color: '#39ff88' }} />
                          )}
                        </div>

                        {/* Player Meta */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.3rem' }}>
                            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', margin: 0, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {player.name}
                            </h4>

                            {completedState === 'SOLD' && (
                              <span style={{ background: 'rgba(0, 168, 59, 0.3)', border: '1px solid #39ff88', color: '#39ff88', fontSize: '0.58rem', fontWeight: 800, padding: '0.1rem 0.4rem', borderRadius: '999px', fontFamily: 'var(--font-display)' }}>
                                {acqInfo?.team?.code ? `SOLD (${acqInfo.team.code})` : 'SOLD'}
                              </span>
                            )}

                            {completedState === 'UNSOLD' && (
                              <span style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#f87171', fontSize: '0.58rem', fontWeight: 800, padding: '0.1rem 0.4rem', borderRadius: '999px', fontFamily: 'var(--font-display)' }}>
                                UNSOLD
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                            <span className={`role-tag ${player.role}`} style={{ fontSize: '0.62rem', padding: '0.1rem 0.4rem' }}>
                              {player.subRole || player.role}
                            </span>
                            <span style={{ fontSize: '0.68rem', color: '#9eb8a8', fontFamily: 'var(--font-mono)' }}>
                              • {player.flag} {player.country}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.3rem' }}>
                            <span style={{ fontSize: '0.68rem', color: '#8fa89b', fontFamily: 'var(--font-mono)' }}>
                              Base: <strong style={{ color: '#c8ffea' }}>₹{player.basePrice.toFixed(2)} Cr</strong>
                            </span>
                            <span style={{ fontSize: '0.62rem', color: '#a3ffd6', fontFamily: 'var(--font-mono)' }}>
                              #{idx + 1}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW 2: FRANCHISE PURSES & SET ANALYSIS                      */}
          {/* ============================================================ */}
          {activeView === 'analysis' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', animation: 'fadeIn 0.25s ease' }}>
              
              {/* Financial Health Summary Metric Bar */}
              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.85rem'
                }}
              >
                <div style={{ background: 'rgba(6, 18, 11, 0.85)', border: '1px solid rgba(57, 255, 136, 0.3)', borderRadius: '16px', padding: '0.9rem 1.1rem' }}>
                  <div style={{ fontSize: '0.68rem', color: '#39ff88', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>TOTAL REMAINING PURSE</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: '#c8ffea', fontWeight: 900, marginTop: '0.2rem' }}>
                    ₹ {totalPurseRemaining.toFixed(2)} <span style={{ fontSize: '0.9rem', color: '#8fa89b' }}>CR</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#9eb8a8', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                    Out of ₹{totalPurseAllocated.toFixed(2)} Cr (₹{totalPurseSpent.toFixed(2)} Cr Spent)
                  </div>
                </div>

                <div style={{ background: 'rgba(6, 18, 11, 0.85)', border: '1px solid rgba(57, 255, 136, 0.3)', borderRadius: '16px', padding: '0.9rem 1.1rem' }}>
                  <div style={{ fontSize: '0.68rem', color: '#39ff88', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>PLAYERS ACQUIRED SO FAR</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: '#c8ffea', fontWeight: 900, marginTop: '0.2rem' }}>
                    {totalPlayersAcquired} <span style={{ fontSize: '0.9rem', color: '#8fa89b' }}>/ 160 SLOTS</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#9eb8a8', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                    Across all 10 franchises (Min 16 / team)
                  </div>
                </div>

                <div style={{ background: 'rgba(6, 18, 11, 0.85)', border: '1px solid rgba(57, 255, 136, 0.3)', borderRadius: '16px', padding: '0.9rem 1.1rem' }}>
                  <div style={{ fontSize: '0.68rem', color: '#39ff88', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>ACTIVE UPCOMING SET</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#ffd700', fontWeight: 900, marginTop: '0.35rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentSelectedSet}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#9eb8a8', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                    {previewSetPlayers.length} Players ready for auction
                  </div>
                </div>
              </div>

              {/* 10 Team Verification Cards Grid */}
              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                  gap: '0.85rem',
                  maxHeight: '52vh',
                  overflowY: 'auto',
                  paddingRight: '0.4rem'
                }}
              >
                {teams.map((team) => {
                  const spent = +(80.0 - team.purseRemaining).toFixed(2);
                  const pursePercent = Math.max(0, Math.min(100, (team.purseRemaining / 80.0) * 100));
                  const squadPercent = Math.max(0, Math.min(100, (team.squadCount / 16) * 100));

                  return (
                    <div
                      key={team.id}
                      style={{
                        background: 'linear-gradient(165deg, rgba(12, 32, 21, 0.9) 0%, rgba(3, 12, 7, 0.98) 100%)',
                        border: '1px solid rgba(57, 255, 136, 0.28)',
                        borderRadius: '16px',
                        padding: '1rem',
                        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.65rem'
                      }}
                    >
                      {/* Team Header Strip */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div 
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: '10px',
                              background: team.primaryColor || '#00a83b',
                              color: team.textColor || '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontFamily: 'var(--font-display)',
                              fontWeight: 900,
                              fontSize: '0.85rem',
                              border: '1.5px solid rgba(255,255,255,0.4)',
                              boxShadow: '0 0 10px rgba(0,0,0,0.5)'
                            }}
                          >
                            {team.code}
                          </div>
                          <div>
                            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.98rem', margin: 0, color: '#ffffff' }}>
                              {team.name}
                            </h4>
                            <span style={{ fontSize: '0.68rem', color: '#9eb8a8', fontFamily: 'var(--font-mono)' }}>
                              Hotkey: [{team.hotkey}] • Key: [{team.letterKey}]
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => onInspectTeam && onInspectTeam(team)}
                          style={{
                            background: 'rgba(57, 255, 136, 0.15)',
                            border: '1px solid #39ff88',
                            color: '#39ff88',
                            fontFamily: 'var(--font-display)',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '0.3rem 0.65rem',
                            borderRadius: '8px',
                            cursor: 'pointer'
                          }}
                        >
                          INSPECT
                        </button>
                      </div>

                      {/* Purse Progress Bar */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', marginBottom: '0.2rem' }}>
                          <span style={{ color: '#9eb8a8' }}>REMAINING PURSE:</span>
                          <strong style={{ color: '#c8ffea', fontFamily: 'var(--font-display)', fontSize: '0.9rem' }}>
                            ₹ {team.purseRemaining.toFixed(2)} CR
                          </strong>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'rgba(2,8,4,0.8)', borderRadius: '999px', overflow: 'hidden', border: '1px solid rgba(57, 255, 136, 0.2)' }}>
                          <div style={{ width: `${pursePercent}%`, height: '100%', background: 'linear-gradient(90deg, #00a83b, #39ff88)', borderRadius: '999px' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#8fa89b', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
                          <span>Spent: ₹{spent} Cr</span>
                          <span>Cap: ₹80.00 Cr</span>
                        </div>
                      </div>

                      {/* Squad Size & Overseas */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(2, 8, 4, 0.7)', border: '1px solid rgba(57, 255, 136, 0.15)', padding: '0.45rem 0.65rem', borderRadius: '10px' }}>
                        <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#c8ffea' }}>
                          Squad: <strong style={{ color: team.squadCount >= 16 ? '#39ff88' : '#ffd700' }}>{team.squadCount || 0}/16</strong>
                        </div>
                        <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: '#c8ffea' }}>
                          Overseas: <strong style={{ color: (team.overseasCount || 0) <= 8 ? '#39ff88' : '#ef4444' }}>{team.overseasCount || 0}/8</strong> ✈️
                        </div>
                      </div>

                      {/* Role Breakdown Pills */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.3rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.64rem', fontFamily: 'var(--font-mono)', color: '#a3ffd6', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid #38bdf8', padding: '0.15rem 0.4rem', borderRadius: '6px' }}>
                          BAT: {team.squadRoleCounts?.Batsman || 0}/5
                        </span>
                        <span style={{ fontSize: '0.64rem', fontFamily: 'var(--font-mono)', color: '#a3ffd6', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', padding: '0.15rem 0.4rem', borderRadius: '6px' }}>
                          BOWL: {team.squadRoleCounts?.Bowler || 0}/5
                        </span>
                        <span style={{ fontSize: '0.64rem', fontFamily: 'var(--font-mono)', color: '#a3ffd6', background: 'rgba(57, 255, 136, 0.15)', border: '1px solid #39ff88', padding: '0.15rem 0.4rem', borderRadius: '6px' }}>
                          AR: {team.squadRoleCounts?.['All-Rounder'] || 0}/4
                        </span>
                        <span style={{ fontSize: '0.64rem', fontFamily: 'var(--font-mono)', color: '#a3ffd6', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #f59e0b', padding: '0.15rem 0.4rem', borderRadius: '6px' }}>
                          WK: {team.squadRoleCounts?.Wicketkeeper || 0}/2
                        </span>
                      </div>

                      {/* Recent Acquisitions Preview */}
                      {team.acquiredPlayers && team.acquiredPlayers.length > 0 && (
                        <div style={{ marginTop: '0.2rem', fontSize: '0.64rem', fontFamily: 'var(--font-mono)', color: '#8fa89b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          Purchases: {team.acquiredPlayers.map(p => `${p.name} (₹${p.price}Cr)`).join(', ')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom Navigation */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <button
                  onClick={() => setActiveView('intro')}
                  style={{
                    background: 'rgba(6, 18, 11, 0.8)',
                    border: '1px solid rgba(57, 255, 136, 0.35)',
                    color: '#39ff88',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    padding: '0.6rem 1.2rem',
                    borderRadius: '999px',
                    cursor: 'pointer'
                  }}
                >
                  ← BACK TO SET INTRO
                </button>

                <button
                  onClick={() => handleStartSet(currentSelectedSet)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    background: 'linear-gradient(135deg, #00a83b 0%, #063b1c 100%)',
                    border: '1.5px solid #39ff88',
                    color: '#ffffff',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.9rem',
                    fontWeight: 900,
                    padding: '0.65rem 1.6rem',
                    borderRadius: '999px',
                    cursor: 'pointer',
                    boxShadow: '0 0 25px rgba(57, 255, 136, 0.5)'
                  }}
                >
                  <span>LOAD & START {currentSelectedSet}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW 3: PREVIOUS SET RECAP & AUDIT                           */}
          {/* ============================================================ */}
          {activeView === 'results' && completedCategory && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', animation: 'fadeIn 0.25s ease' }}>
              
              <div style={{ background: 'linear-gradient(165deg, rgba(14, 38, 24, 0.9) 0%, rgba(4, 16, 9, 0.95) 100%)', border: '1.5px solid rgba(57, 255, 136, 0.4)', borderRadius: '18px', padding: '1.25rem' }}>
                <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: '#39ff88', letterSpacing: '0.12em' }}>
                  SET AUDIT & PURCHASES VERIFICATION
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', margin: '0.2rem 0', color: '#ffffff' }}>
                  {completedCategory} Results
                </h3>
                <div style={{ display: 'flex', gap: '1.2rem', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: '#b2d9c4', marginTop: '0.35rem' }}>
                  <span>Sold: <strong style={{ color: '#39ff88' }}>{completedSoldPlayers.length}</strong></span>
                  <span>Unsold: <strong style={{ color: '#f87171' }}>{completedUnsoldPlayers.length}</strong></span>
                  <span>Total Capital Spent: <strong style={{ color: '#ffd700' }}>₹ {completedTotalSpent.toFixed(2)} Cr</strong></span>
                </div>
              </div>

              {/* Sold Players Table / Grid */}
              <div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: '#39ff88', margin: '0 0 0.5rem 0' }}>
                  PLAYERS SOLD IN THIS SET ({completedSoldPlayers.length})
                </h4>

                {completedSoldPlayers.length === 0 ? (
                  <div style={{ padding: '1rem', background: 'rgba(2, 8, 4, 0.7)', borderRadius: '12px', border: '1px solid rgba(57, 255, 136, 0.15)', color: '#9eb8a8', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                    No players were sold in this set.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem', maxHeight: '35vh', overflowY: 'auto' }}>
                    {completedSoldPlayers.map((p) => (
                      <div 
                        key={p.id}
                        style={{
                          background: 'rgba(6, 18, 11, 0.85)',
                          border: '1px solid rgba(57, 255, 136, 0.25)',
                          borderRadius: '12px',
                          padding: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.92rem', color: '#ffffff' }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: '#9eb8a8', marginTop: '0.15rem' }}>
                            {p.role} • Base: ₹{p.basePrice.toFixed(2)}Cr
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span 
                            style={{
                              background: p.buyerTeam?.primaryColor || '#00a83b',
                              color: p.buyerTeam?.textColor || '#ffffff',
                              fontFamily: 'var(--font-display)',
                              fontWeight: 900,
                              fontSize: '0.72rem',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '6px',
                              display: 'inline-block'
                            }}
                          >
                            {p.buyerTeam?.code || 'SOLD'}
                          </span>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.88rem', fontWeight: 800, color: '#ffd700', marginTop: '0.2rem' }}>
                            ₹ {p.soldPrice.toFixed(2)} CR
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Unsold Players List */}
              {completedUnsoldPlayers.length > 0 && (
                <div>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: '#f87171', margin: '0 0 0.5rem 0' }}>
                    PLAYERS UNSOLD IN THIS SET ({completedUnsoldPlayers.length}) — ELIGIBLE FOR SET 12 RESERVE POOL
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {completedUnsoldPlayers.map((p) => (
                      <span 
                        key={p.id}
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.35)',
                          color: '#f87171',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '8px',
                          fontSize: '0.72rem',
                          fontFamily: 'var(--font-display)'
                        }}
                      >
                        {p.name} (₹{p.basePrice.toFixed(2)}Cr)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom Navigation */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <button
                  onClick={() => setActiveView('intro')}
                  style={{
                    background: 'rgba(6, 18, 11, 0.8)',
                    border: '1px solid rgba(57, 255, 136, 0.35)',
                    color: '#39ff88',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    padding: '0.6rem 1.2rem',
                    borderRadius: '999px',
                    cursor: 'pointer'
                  }}
                >
                  ← BACK TO SET INTRO
                </button>

                <button
                  onClick={() => handleStartSet(currentSelectedSet)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    background: 'linear-gradient(135deg, #00a83b 0%, #063b1c 100%)',
                    border: '1.5px solid #39ff88',
                    color: '#ffffff',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.9rem',
                    fontWeight: 900,
                    padding: '0.65rem 1.6rem',
                    borderRadius: '999px',
                    cursor: 'pointer',
                    boxShadow: '0 0 25px rgba(57, 255, 136, 0.5)'
                  }}
                >
                  <span>LOAD & START {currentSelectedSet}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
