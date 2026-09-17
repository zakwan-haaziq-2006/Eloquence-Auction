import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle, UserCheck, Shield, X, BarChart2 } from 'lucide-react';
import SidebarTeams from './SidebarTeams';
import { sounds } from '../utils/soundEffects';

export default function CategoryTransitionModal({ 
  completedCategory, 
  nextCategory, 
  nextPlayerCount, 
  teams = [],
  onInspectTeam,
  onProceed 
}) {
  const [showOverview, setShowOverview] = useState(false);

  useEffect(() => {
    sounds.playCategorySound();
    return () => {
      sounds.stopAllAudio();
    };
  }, []);

  const handleProceedClick = () => {
    sounds.stopAllAudio();
    sounds.playBidSound();
    onProceed();
  };

  return (
    <div className="category-transition-overlay">
      <div className="revibe-bg-watermark"></div>

      {!showOverview ? (
        /* --- DOOMSDAY CATEGORY TRANSITION SCREEN --- */
        <div className="intro-fullscreen-content">
          <div className="brand-header-group" style={{ marginBottom: '0.2rem' }}>
            <span className="brand-script" style={{ fontSize: '2.2rem' }}>
              ELOQUENCE <span style={{ color: '#39ff88' }}>'26</span>
            </span>
          </div>

          <div className="completed-badge">
            <CheckCircle size={18} /> CATEGORY COMPLETED
          </div>

          <h2 className="completed-title">
            {completedCategory || 'BATSMEN'} <span className="crimson-gold-text">FINISHED</span>
          </h2>

          <div className="next-category-minimal">
            <span className="next-tag">UPCOMING CATEGORY</span>
            <h1 className="next-category-title">{nextCategory || 'WICKETKEEPERS'}</h1>
            <p className="next-category-desc" style={{ color: '#a3ffd6', fontFamily: 'var(--font-mono)' }}>
              <UserCheck size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle', color: '#39ff88' }} />
              {nextPlayerCount ? `${nextPlayerCount} Players` : 'Next Set'} Ready for Auction Arena
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '380px', marginTop: '1.2rem' }}>
            <button 
              className="view-overview-btn" 
              onClick={() => setShowOverview(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                background: 'rgba(6, 18, 11, 0.85)',
                border: '1.5px solid rgba(57, 255, 136, 0.35)',
                color: '#39ff88',
                fontFamily: 'var(--font-display)',
                fontSize: '0.85rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                padding: '0.75rem 1.5rem',
                borderRadius: '999px',
                cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(0,0,0,0.6)',
                transition: 'all 0.2s ease'
              }}
            >
              <BarChart2 size={18} />
              <span>LIVE TEAM OVERVIEW</span>
            </button>

            <button className="proceed-category-btn" onClick={handleProceedClick}>
              <span>PROCEED TO {nextCategory || 'NEXT CATEGORY'}</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      ) : (
        /* --- LIVE TEAM OVERVIEW MODAL FULLSCREEN --- */
        <div 
          className="transition-overview-modal-fullscreen"
          style={{
            position: 'relative',
            zIndex: 10,
            width: '95%',
            maxWidth: '1200px',
            height: '90vh',
            maxHeight: '90vh',
            background: 'linear-gradient(170deg, rgba(8, 24, 15, 0.96), rgba(3, 10, 6, 0.98))',
            backdropFilter: 'blur(20px)',
            border: '1.5px solid rgba(57, 255, 136, 0.4)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.95), 0 0 35px rgba(57, 255, 136, 0.25)',
            borderRadius: '24px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <div className="transition-overview-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(57, 255, 136, 0.25)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'linear-gradient(135deg, #00a83b, #063b1c)', border: '1.5px solid #39ff88', color: '#FFF', padding: '0.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', boxShadow: '0 0 12px rgba(57, 255, 136, 0.4)' }}>
                <Shield size={22} />
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', margin: 0, color: '#ffffff' }}>
                  FRANCHISE TEAM OVERVIEW ({completedCategory} FINISHED)
                </h3>
                <span style={{ fontSize: '0.72rem', color: '#9eb8a8', fontFamily: 'var(--font-mono)' }}>
                  Complete Squad Breakdown & Purse Analysis for All 10 Teams
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button className="proceed-category-btn" onClick={handleProceedClick} style={{ padding: '0.5rem 1.4rem', fontSize: '0.85rem', width: 'auto' }}>
                <span>PROCEED TO {nextCategory || 'NEXT CATEGORY'}</span>
                <ArrowRight size={16} />
              </button>

              <button className="icon-btn" onClick={() => setShowOverview(false)} style={{ width: 36, height: 36 }}>
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Render Full SidebarTeams Component */}
          <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.3rem' }}>
            <SidebarTeams teams={teams} onInspectTeam={onInspectTeam} />
          </div>
        </div>
      )}
    </div>
  );
}
