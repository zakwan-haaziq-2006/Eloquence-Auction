import React, { useState, useEffect } from 'react';
import { Play, Trophy } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function IntroScreen({ onStartAuction, onClose }) {
  const [countdown, setCountdown] = useState(null); // null = intro screen, number = countdown state

  const handleStartClick = () => {
    sounds.playCountdownMusic();
    setCountdown(10);
  };

  useEffect(() => {
    return () => {
      sounds.stopAllAudio();
    };
  }, []);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      sounds.stopAllAudio();
      sounds.playBidSound();
      onStartAuction();
    }
  }, [countdown, onStartAuction]);

  return (
    <div className="intro-screen-overlay">
      <div className="revibe-bg-watermark"></div>

      {onClose && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.5rem',
            background: 'rgba(4, 12, 7, 0.75)',
            border: '1.5px solid rgba(57, 255, 136, 0.35)',
            color: '#c8ffea',
            padding: '0.45rem 1rem',
            borderRadius: '999px',
            fontFamily: 'var(--font-display)',
            fontSize: '0.76rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            cursor: 'pointer',
            zIndex: 100,
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 18px rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.2s ease'
          }}
          title="Dismiss Intro and Return to Stage"
        >
          <span>✕ SKIP INTRO</span>
        </button>
      )}

      {countdown === null ? (
        /* --- FULL SCREEN DOOM DAYS INTRO --- */
        <div className="intro-fullscreen-content">
          {/* Doctor Doom Character Sticker Badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.2rem' }}>
            <div 
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(57, 255, 136, 0.25) 0%, rgba(0, 168, 59, 0.05) 70%, transparent 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid rgba(57, 255, 136, 0.45)',
                boxShadow: '0 0 35px rgba(57, 255, 136, 0.35)',
                padding: '6px'
              }}
            >
              <img 
                src="/sticker_bidding_doctordoom.png" 
                alt="Doctor Doom - Doomsday Auction" 
                style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 0 10px rgba(57, 255, 136, 0.6))' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          </div>

          <div className="brand-header-group">
            <span className="brand-script" style={{ fontSize: '2.4rem', letterSpacing: '0.1em' }}>
              ELOQUENCE <span style={{ color: '#39ff88' }}>'26</span>
            </span>
          </div>

          <div className="intro-badge">
            <Trophy size={16} /> THE COUNTDOWN BEGINS • DOOMSDAY AUCTION
          </div>

          <h1 className="intro-minimal-heading">
            SURVIVE THE <span className="crimson-gold-text">BIDDING WAR</span>
          </h1>

          <p className="intro-minimal-subtext">
            Where ideas collide, skills survive, and legends emerge.<br/>
            <span style={{ color: '#ffffff', fontWeight: 700 }}>Up to 12 Franchises • ₹80 Crore Purse • Minimum 16 Squad Cap</span>
          </p>

          <button className="intro-start-btn" onClick={handleStartClick} style={{ marginTop: '1.2rem' }}>
            <Play size={20} fill="currentColor" />
            <span>START AUCTION</span>
          </button>
        </div>
      ) : (
        /* --- FULL SCREEN 10-SECOND DOOMSDAY COUNTDOWN --- */
        <div className="intro-fullscreen-content">
          <div className="brand-header-group" style={{ marginBottom: '0.2rem' }}>
            <span className="brand-script" style={{ fontSize: '2.2rem' }}>
              ELOQUENCE <span style={{ color: '#39ff88' }}>'26</span>
            </span>
          </div>

          <span className="countdown-category-label">GET READY FOR</span>
          <h2 className="countdown-category-title">BATSMEN CATEGORY</h2>

          <div className="countdown-timer-circle">
            <svg className="countdown-svg" viewBox="0 0 100 100">
              <circle className="circle-bg" cx="50" cy="50" r="44"></circle>
              <circle 
                className="circle-progress" 
                cx="50" 
                cy="50" 
                r="44"
                style={{ strokeDashoffset: `${(44 * 2 * Math.PI) * (1 - countdown / 10)}px` }}
              ></circle>
            </svg>
            <span className="countdown-number-display">
              {countdown > 0 ? countdown : 'GO!'}
            </span>
          </div>

          <p className="countdown-footer-text">
            {countdown > 0 ? 'Prepare your bids. Doomsday begins in...' : 'Launching Auction Arena!'}
          </p>
        </div>
      )}
    </div>
  );
}
