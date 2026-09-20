import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  CheckCircle, 
  Users, 
  Sparkles, 
  X, 
  BarChart2, 
  ChevronLeft,
  ChevronRight,
  Shield,
  DollarSign
} from 'lucide-react';
import { AUCTION_SETS } from '../data/auctionData';
import { sounds } from '../utils/soundEffects';
import bgImage from '../assets/eloquence_auction_bg.jpg';

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
  // activeModal: null (default hero screen with bg img & big text) | 'teams' | 'players' | 'recap'
  const [activeModal, setActiveModal] = useState(null);
  const [currentSelectedSet, setCurrentSelectedSet] = useState(
    nextCategory || completedCategory || AUCTION_SETS[0].name
  );

  useEffect(() => {
    sounds.playCategorySound();
    return () => {
      sounds.stopAllAudio();
    };
  }, []);

  // Update selected set if nextCategory prop changes
  useEffect(() => {
    if (nextCategory) {
      setCurrentSelectedSet(nextCategory);
    }
  }, [nextCategory]);

  // Parse set string into Number and Title: e.g. "SET 1 — MARQUEE PLAYERS"
  const parseSetName = (fullSetName = '') => {
    if (fullSetName.includes('—')) {
      const parts = fullSetName.split('—').map((s) => s.trim());
      return { setNumber: parts[0], title: parts[1] };
    }
    if (fullSetName.includes('-')) {
      const parts = fullSetName.split('-').map((s) => s.trim());
      return { setNumber: parts[0], title: parts[1] };
    }
    return { setNumber: 'AUCTION SET', title: fullSetName };
  };

  const currentSetInfo = parseSetName(currentSelectedSet);

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

  // Base price range in preview set
  const minBasePrice = previewSetPlayers.length > 0
    ? Math.min(...previewSetPlayers.map((p) => p.basePrice)).toFixed(2)
    : '0.20';
  const maxBasePrice = previewSetPlayers.length > 0
    ? Math.max(...previewSetPlayers.map((p) => p.basePrice)).toFixed(2)
    : '2.00';

  // Handle starting/loading the set
  const handleStartSet = (targetSetName) => {
    sounds.stopAllAudio();
    sounds.playBidSound();

    const targetSet = targetSetName || currentSelectedSet;
    const firstPlayerIdx = players.findIndex((p) => p.set === targetSet);
    
    if (firstPlayerIdx !== -1) {
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
    <div 
      className="category-transition-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        overflow: 'hidden',
        background: `radial-gradient(circle at center, rgba(2, 12, 6, 0.72) 0%, rgba(1, 6, 3, 0.94) 85%), url(${bgImage}) center center / cover no-repeat fixed`
      }}
    >
      <div className="revibe-bg-watermark"></div>

      {/* Discreet Dismiss Button */}
      {onClose && (
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: 'rgba(2, 8, 4, 0.75)',
            border: '1.5px solid rgba(57, 255, 136, 0.35)',
            color: '#a3ffd6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 50,
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.6)',
            transition: 'all 0.2s ease'
          }}
          title="Dismiss"
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#39ff88';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(57, 255, 136, 0.35)';
            e.currentTarget.style.color = '#a3ffd6';
          }}
        >
          <X size={18} />
        </button>
      )}

      {/* ========================================================================= */}
      {/* DEFAULT CENTER VIEW: Background Image with BIG Set Typography & Buttons    */}
      {/* ========================================================================= */}
      {!activeModal && (
        <div 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            textAlign: 'center',
            maxWidth: '1000px',
            margin: 'auto',
            zIndex: 10,
            animation: 'fadeIn 0.3s ease'
          }}
        >
          {/* Subtle Doom / Trophy / Auction Badge */}
          <div style={{ marginBottom: '1rem' }}>
            <div 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'linear-gradient(135deg, rgba(0, 168, 59, 0.3) 0%, rgba(2, 8, 4, 0.8) 100%)',
                border: '1.5px solid #39ff88',
                borderRadius: '999px',
                padding: '0.35rem 1.25rem',
                boxShadow: '0 0 25px rgba(57, 255, 136, 0.4)'
              }}
            >
              <Sparkles size={16} style={{ color: '#39ff88' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.12em' }}>
                AUCTION ARENA • ELOQUENCE '26
              </span>
            </div>
          </div>

          {/* Big Text: SET NUMBER */}
          <div 
            style={{ 
              fontFamily: 'var(--font-display)', 
              fontSize: 'clamp(2.8rem, 6.5vw, 5.2rem)', 
              fontWeight: 900, 
              color: '#39ff88',
              letterSpacing: '0.08em',
              lineHeight: 1,
              textTransform: 'uppercase',
              textShadow: '0 0 45px rgba(57, 255, 136, 0.85), 0 5px 25px rgba(0,0,0,0.9)'
            }}
          >
            {currentSetInfo.setNumber}
          </div>

          {/* Big Text: SET NAME */}
          <h1 
            style={{ 
              fontFamily: 'var(--font-display)', 
              fontSize: 'clamp(1.8rem, 4vw, 3.2rem)', 
              fontWeight: 900, 
              color: '#ffffff',
              letterSpacing: '0.04em',
              margin: '0.4rem 0 0.8rem 0',
              lineHeight: 1.15,
              textShadow: '0 0 35px rgba(255, 255, 255, 0.4), 0 4px 20px rgba(0, 0, 0, 0.9)'
            }}
          >
            {currentSetInfo.title}
          </h1>

          {/* Meta Details Strip */}
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem', 
              fontFamily: 'var(--font-mono)', 
              fontSize: '0.9rem', 
              color: '#c8ffea',
              background: 'rgba(2, 8, 4, 0.65)',
              padding: '0.5rem 1.4rem',
              borderRadius: '999px',
              border: '1px solid rgba(57, 255, 136, 0.25)',
              marginBottom: '2.5rem',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}
          >
            <span>👥 <strong>{previewSetPlayers.length}</strong> Players in Set</span>
            <span>•</span>
            <span>💰 Base Prices: <strong>₹{minBasePrice} Cr - ₹{maxBasePrice} Cr</strong></span>
            {completedCategory && (
              <>
                <span>•</span>
                <span style={{ color: '#ffd700' }}>Preceding: {completedCategory} Completed</span>
              </>
            )}
          </div>

          {/* Action Buttons: Overview of Teams, Players in this Set, Proceed to Next Set */}
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '1.25rem', 
              flexWrap: 'wrap' 
            }}
          >
            {/* BUTTON 1: OVERVIEW OF EACH TEAM */}
            <button
              onClick={() => setActiveModal('teams')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                background: 'rgba(6, 18, 11, 0.92)',
                border: '1.5px solid rgba(57, 255, 136, 0.5)',
                color: '#39ff88',
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                fontWeight: 800,
                padding: '0.95rem 1.8rem',
                borderRadius: '999px',
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(0,0,0,0.7)',
                transition: 'all 0.25s ease',
                letterSpacing: '0.04em'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(57, 255, 136, 0.35)';
                e.currentTarget.style.borderColor = '#39ff88';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.7)';
                e.currentTarget.style.borderColor = 'rgba(57, 255, 136, 0.5)';
              }}
            >
              <BarChart2 size={19} />
              <span>OVERVIEW OF TEAMS</span>
            </button>

            {/* BUTTON 2: PLAYERS IN THIS SET */}
            <button
              onClick={() => setActiveModal('players')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                background: 'rgba(6, 18, 11, 0.92)',
                border: '1.5px solid rgba(57, 255, 136, 0.5)',
                color: '#a3ffd6',
                fontFamily: 'var(--font-display)',
                fontSize: '1rem',
                fontWeight: 800,
                padding: '0.95rem 1.8rem',
                borderRadius: '999px',
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(0,0,0,0.7)',
                transition: 'all 0.25s ease',
                letterSpacing: '0.04em'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(57, 255, 136, 0.35)';
                e.currentTarget.style.borderColor = '#39ff88';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.7)';
                e.currentTarget.style.borderColor = 'rgba(57, 255, 136, 0.5)';
              }}
            >
              <Users size={19} />
              <span>PLAYERS IN THIS SET ({previewSetPlayers.length})</span>
            </button>

            {/* BUTTON 3: PROCEED TO NEXT SET */}
            <button
              onClick={() => handleStartSet(currentSelectedSet)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'linear-gradient(135deg, #00a83b 0%, #063b1c 100%)',
                border: '2px solid #39ff88',
                color: '#ffffff',
                fontFamily: 'var(--font-display)',
                fontSize: '1.08rem',
                fontWeight: 900,
                padding: '1rem 2.2rem',
                borderRadius: '999px',
                cursor: 'pointer',
                boxShadow: '0 10px 35px rgba(0, 0, 0, 0.8), 0 0 35px rgba(57, 255, 136, 0.65)',
                transition: 'all 0.25s ease',
                letterSpacing: '0.06em'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.04)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.9), 0 0 45px rgba(57, 255, 136, 0.85)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 35px rgba(0, 0, 0, 0.8), 0 0 35px rgba(57, 255, 136, 0.65)';
              }}
            >
              <span>PROCEED TO {currentSetInfo.setNumber}</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: OVERVIEW OF EACH TEAM (Shown ONLY if 'Overview of Teams' is clicked)*/}
      {/* ========================================================================= */}
      {activeModal === 'teams' && (
        <div 
          className="set-transition-container"
          style={{
            width: '96%',
            maxWidth: '1240px',
            maxHeight: '84vh',
            margin: 'auto',
            background: 'linear-gradient(165deg, rgba(8, 24, 15, 0.96) 0%, rgba(2, 10, 6, 0.99) 100%)',
            backdropFilter: 'blur(25px)',
            border: '1.5px solid rgba(57, 255, 136, 0.45)',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.95), 0 0 40px rgba(57, 255, 136, 0.25)',
            borderRadius: '22px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 30,
            animation: 'fadeIn 0.25s ease'
          }}
        >
          {/* Modal Header */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.9rem 1.4rem',
              borderBottom: '1px solid rgba(57, 255, 136, 0.25)',
              background: 'rgba(2, 8, 4, 0.85)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <BarChart2 size={20} style={{ color: '#39ff88' }} />
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', margin: 0, color: '#ffffff' }}>
                  OVERVIEW OF FRANCHISES ({teams.length} TEAMS)
                </h3>
                <span style={{ fontSize: '0.7rem', color: '#9eb8a8', fontFamily: 'var(--font-mono)' }}>
                  Total Allocated: ₹{totalPurseAllocated.toFixed(2)} Cr • Remaining: ₹{totalPurseRemaining.toFixed(2)} Cr • Spent: ₹{totalPurseSpent.toFixed(2)} Cr
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => handleStartSet(currentSelectedSet)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'linear-gradient(135deg, #00a83b, #063b1c)',
                  border: '1px solid #39ff88',
                  color: '#ffffff',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.85rem',
                  fontWeight: 900,
                  padding: '0.45rem 1.1rem',
                  borderRadius: '999px',
                  cursor: 'pointer'
                }}
              >
                <span>PROCEED TO {currentSetInfo.setNumber}</span>
                <ArrowRight size={15} />
              </button>

              <button
                onClick={() => setActiveModal(null)}
                className="icon-btn"
                style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.08)', borderRadius: '10px' }}
                title="Back to Set Screen"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Teams Grid */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.4rem' }}>
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
                gap: '0.85rem'
              }}
            >
              {teams.map((team) => {
                const spent = +(80.0 - team.purseRemaining).toFixed(2);
                const pursePercent = Math.max(0, Math.min(100, (team.purseRemaining / 80.0) * 100));

                return (
                  <div
                    key={team.id}
                    style={{
                      background: 'linear-gradient(165deg, rgba(12, 32, 21, 0.92) 0%, rgba(3, 12, 7, 0.98) 100%)',
                      border: '1px solid rgba(57, 255, 136, 0.28)',
                      borderRadius: '16px',
                      padding: '0.9rem',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.7)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.6rem'
                    }}
                  >
                    {/* Team Header */}
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
                          <span style={{ fontSize: '0.66rem', color: '#9eb8a8', fontFamily: 'var(--font-mono)' }}>
                            Hotkey: [{team.hotkey}] • Key: [{team.letterKey}]
                          </span>
                        </div>
                      </div>

                      {onInspectTeam && (
                        <button
                          onClick={() => onInspectTeam(team)}
                          style={{
                            background: 'rgba(57, 255, 136, 0.15)',
                            border: '1px solid #39ff88',
                            color: '#39ff88',
                            fontFamily: 'var(--font-display)',
                            fontSize: '0.66rem',
                            fontWeight: 800,
                            padding: '0.28rem 0.6rem',
                            borderRadius: '8px',
                            cursor: 'pointer'
                          }}
                        >
                          INSPECT
                        </button>
                      )}
                    </div>

                    {/* Purse Bar */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', marginBottom: '0.2rem' }}>
                        <span style={{ color: '#9eb8a8' }}>REMAINING PURSE:</span>
                        <strong style={{ color: '#c8ffea', fontFamily: 'var(--font-display)', fontSize: '0.92rem' }}>
                          ₹ {team.purseRemaining.toFixed(2)} CR
                        </strong>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'rgba(2,8,4,0.85)', borderRadius: '999px', overflow: 'hidden', border: '1px solid rgba(57, 255, 136, 0.2)' }}>
                        <div style={{ width: `${pursePercent}%`, height: '100%', background: 'linear-gradient(90deg, #00a83b, #39ff88)', borderRadius: '999px' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#8fa89b', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>
                        <span>Spent: ₹{spent} Cr</span>
                        <span>Cap: ₹80.00 Cr</span>
                      </div>
                    </div>

                    {/* Squad Count & Overseas */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(2, 8, 4, 0.7)', border: '1px solid rgba(57, 255, 136, 0.15)', padding: '0.4rem 0.6rem', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: '#c8ffea' }}>
                        Squad: <strong style={{ color: team.squadCount >= 16 ? '#39ff88' : '#ffd700' }}>{team.squadCount || 0}/16</strong>
                      </div>
                      <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: '#c8ffea' }}>
                        Overseas: <strong style={{ color: (team.overseasCount || 0) <= 8 ? '#39ff88' : '#ef4444' }}>{team.overseasCount || 0}/8</strong> ✈️
                      </div>
                    </div>

                    {/* Role Counts */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.25rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: '#a3ffd6', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid #38bdf8', padding: '0.12rem 0.38rem', borderRadius: '6px' }}>
                        BAT: {team.squadRoleCounts?.Batsman || 0}/5
                      </span>
                      <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: '#a3ffd6', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', padding: '0.12rem 0.38rem', borderRadius: '6px' }}>
                        BOWL: {team.squadRoleCounts?.Bowler || 0}/5
                      </span>
                      <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: '#a3ffd6', background: 'rgba(57, 255, 136, 0.15)', border: '1px solid #39ff88', padding: '0.12rem 0.38rem', borderRadius: '6px' }}>
                        AR: {team.squadRoleCounts?.['All-Rounder'] || 0}/4
                      </span>
                      <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: '#a3ffd6', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #f59e0b', padding: '0.12rem 0.38rem', borderRadius: '6px' }}>
                        WK: {team.squadRoleCounts?.Wicketkeeper || 0}/2
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal Footer */}
          <div style={{ padding: '0.75rem 1.4rem', borderTop: '1px solid rgba(57, 255, 136, 0.2)', background: 'rgba(2, 8, 4, 0.85)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => setActiveModal(null)}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#ffffff',
                fontFamily: 'var(--font-display)',
                fontSize: '0.78rem',
                fontWeight: 800,
                padding: '0.45rem 1.1rem',
                borderRadius: '999px',
                cursor: 'pointer'
              }}
            >
              ← BACK TO SET SCREEN
            </button>

            <button
              onClick={() => handleStartSet(currentSelectedSet)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, #00a83b, #063b1c)',
                border: '1.5px solid #39ff88',
                color: '#ffffff',
                fontFamily: 'var(--font-display)',
                fontSize: '0.88rem',
                fontWeight: 900,
                padding: '0.5rem 1.4rem',
                borderRadius: '999px',
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(57, 255, 136, 0.4)'
              }}
            >
              <span>START {currentSetInfo.setNumber} NOW</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: PLAYERS IN THIS SET (Shown ONLY if 'Players in this Set' clicked)*/}
      {/* ========================================================================= */}
      {activeModal === 'players' && (
        <div 
          className="set-transition-container"
          style={{
            width: '96%',
            maxWidth: '1240px',
            maxHeight: '84vh',
            margin: 'auto',
            background: 'linear-gradient(165deg, rgba(8, 24, 15, 0.96) 0%, rgba(2, 10, 6, 0.99) 100%)',
            backdropFilter: 'blur(25px)',
            border: '1.5px solid rgba(57, 255, 136, 0.45)',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.95), 0 0 40px rgba(57, 255, 136, 0.25)',
            borderRadius: '22px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 30,
            animation: 'fadeIn 0.25s ease'
          }}
        >
          {/* Modal Header */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.9rem 1.4rem',
              borderBottom: '1px solid rgba(57, 255, 136, 0.25)',
              background: 'rgba(2, 8, 4, 0.85)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Users size={20} style={{ color: '#39ff88' }} />
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', margin: 0, color: '#ffffff' }}>
                  PLAYERS IN {currentSetInfo.setNumber}: {currentSetInfo.title} ({previewSetPlayers.length})
                </h3>
                <span style={{ fontSize: '0.7rem', color: '#9eb8a8', fontFamily: 'var(--font-mono)' }}>
                  Base Prices: ₹{minBasePrice} Cr - ₹{maxBasePrice} Cr
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => handleStartSet(currentSelectedSet)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'linear-gradient(135deg, #00a83b, #063b1c)',
                  border: '1px solid #39ff88',
                  color: '#ffffff',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.85rem',
                  fontWeight: 900,
                  padding: '0.45rem 1.1rem',
                  borderRadius: '999px',
                  cursor: 'pointer'
                }}
              >
                <span>PROCEED TO {currentSetInfo.setNumber}</span>
                <ArrowRight size={15} />
              </button>

              <button
                onClick={() => setActiveModal(null)}
                className="icon-btn"
                style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.08)', borderRadius: '10px' }}
                title="Back to Set Screen"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Players Grid */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.4rem' }}>
            {previewSetPlayers.length === 0 ? (
              <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#9eb8a8' }}>
                <div style={{ fontSize: '1.25rem', color: '#39ff88', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '0.6rem' }}>
                  NO PLAYERS IN THIS POOL YET
                </div>
                <div style={{ fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto', lineHeight: 1.6, color: '#c8ffea' }}>
                  Any player marked as <span style={{ color: '#ff6b6b', fontWeight: 800 }}>UNSOLD</span> during Sets 1 to 11 is automatically added into this final reserve set for the accelerated round!
                </div>
              </div>
            ) : (
              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
                  gap: '0.75rem' 
                }}
              >
                {previewSetPlayers.map((player, idx) => {
                const completedState = completedPlayersMap[player.id];
                const acqInfo = allAcquired.find((a) => a.id === player.id);

                return (
                  <div
                    key={player.id}
                    style={{
                      background: 'linear-gradient(165deg, rgba(10, 26, 17, 0.9) 0%, rgba(2, 8, 4, 0.96) 100%)',
                      border: '1px solid rgba(57, 255, 136, 0.25)',
                      borderRadius: '14px',
                      padding: '0.75rem 0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.6)'
                    }}
                  >
                    <div 
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: '10px',
                        border: '1px solid rgba(57, 255, 136, 0.4)',
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
                        <span style={{ fontSize: '0.7rem', color: '#8fa89b', fontFamily: 'var(--font-mono)' }}>
                          Base: <strong style={{ color: '#c8ffea' }}>₹{player.basePrice.toFixed(2)} Cr</strong>
                        </span>
                        <span style={{ fontSize: '0.64rem', color: '#a3ffd6', fontFamily: 'var(--font-mono)' }}>
                          #{idx + 1}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>

          {/* Modal Footer */}
          <div style={{ padding: '0.75rem 1.4rem', borderTop: '1px solid rgba(57, 255, 136, 0.2)', background: 'rgba(2, 8, 4, 0.85)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => setActiveModal(null)}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#ffffff',
                fontFamily: 'var(--font-display)',
                fontSize: '0.78rem',
                fontWeight: 800,
                padding: '0.45rem 1.1rem',
                borderRadius: '999px',
                cursor: 'pointer'
              }}
            >
              ← BACK TO SET SCREEN
            </button>

            <button
              onClick={() => handleStartSet(currentSelectedSet)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, #00a83b, #063b1c)',
                border: '1.5px solid #39ff88',
                color: '#ffffff',
                fontFamily: 'var(--font-display)',
                fontSize: '0.88rem',
                fontWeight: 900,
                padding: '0.5rem 1.4rem',
                borderRadius: '999px',
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(57, 255, 136, 0.4)'
              }}
            >
              <span>START {currentSetInfo.setNumber} NOW</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: PRECEDING SET RECAP (Shown ONLY if 'Recap' is clicked)          */}
      {/* ========================================================================= */}
      {activeModal === 'recap' && completedCategory && (
        <div 
          className="set-transition-container"
          style={{
            width: '96%',
            maxWidth: '1240px',
            maxHeight: '84vh',
            margin: 'auto',
            background: 'linear-gradient(165deg, rgba(8, 24, 15, 0.96) 0%, rgba(2, 10, 6, 0.99) 100%)',
            backdropFilter: 'blur(25px)',
            border: '1.5px solid rgba(57, 255, 136, 0.45)',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.95), 0 0 40px rgba(57, 255, 136, 0.25)',
            borderRadius: '22px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 30,
            animation: 'fadeIn 0.25s ease'
          }}
        >
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.9rem 1.4rem',
              borderBottom: '1px solid rgba(57, 255, 136, 0.25)',
              background: 'rgba(2, 8, 4, 0.85)'
            }}
          >
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', margin: 0, color: '#ffffff' }}>
                RECAP & AUDIT: {completedCategory}
              </h3>
              <span style={{ fontSize: '0.7rem', color: '#9eb8a8', fontFamily: 'var(--font-mono)' }}>
                Sold: {completedSoldPlayers.length} • Unsold: {completedUnsoldPlayers.length} • Total Spend: ₹{completedTotalSpent.toFixed(2)} Cr
              </span>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="icon-btn"
              style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.08)', borderRadius: '10px' }}
              title="Back to Set Screen"
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.4rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
              {completedSoldPlayers.map((p) => (
                <div 
                  key={p.id}
                  style={{
                    background: 'rgba(6, 18, 11, 0.9)',
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
          </div>

          <div style={{ padding: '0.75rem 1.4rem', borderTop: '1px solid rgba(57, 255, 136, 0.2)', background: 'rgba(2, 8, 4, 0.85)', display: 'flex', justifyContent: 'flex-start' }}>
            <button
              onClick={() => setActiveModal(null)}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#ffffff',
                fontFamily: 'var(--font-display)',
                fontSize: '0.78rem',
                fontWeight: 800,
                padding: '0.45rem 1.1rem',
                borderRadius: '999px',
                cursor: 'pointer'
              }}
            >
              ← BACK TO SET SCREEN
            </button>
          </div>
        </div>
      )}

      {/* Bottom Footer Watermark / Status */}
      <div 
        style={{ 
          fontSize: '0.72rem', 
          fontFamily: 'var(--font-mono)', 
          color: '#6e8f7b', 
          textAlign: 'center',
          zIndex: 10,
          opacity: 0.8
        }}
      >
        Official IPL Mega Auction • Eloquence Symposium 2026 • Live Stage Synchronization Active
      </div>
    </div>
  );
}
