import React from 'react';
import { User, Gavel, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PlayerStage({ player, status, leadingTeam, currentBid }) {
  if (!player) {
    return (
      <div className="auction-stage-box">
        <div style={{ padding: '3rem', textAlign: 'center', color: '#a3ffd6', fontFamily: 'var(--font-display)' }}>
          <h3>No Player Loaded in Chamber</h3>
        </div>
      </div>
    );
  }

  // Format price into ₹ Crore / Lakh display format
  const formatPrice = (amount) => {
    if (amount >= 1.0) {
      return `₹ ${amount.toFixed(2)} CR`;
    }
    const lakhs = Math.round(amount * 100);
    return `₹ ${lakhs} LAKH`;
  };

  return (
    <div className="auction-stage-box">
      {/* Holographic Green Spotlight */}
      <div className="stage-spotlight"></div>

      {/* Sold / Unsold Notification Banner */}
      {status !== 'LIVE' && (
        <div className={`status-banner ${status}`}>
          <span className={`status-dot ${status.toLowerCase()}`}></span>
          {status === 'SOLD' && (
            <>
              <CheckCircle2 size={18} />
              SOLD TO {leadingTeam ? leadingTeam.code : 'FRANCHISE'} FOR {formatPrice(currentBid)}!
            </>
          )}
          {status === 'UNSOLD' && (
            <>
              <AlertCircle size={18} />
              PLAYER UNSOLD — PASSED TO ACCELERATED ROUND
            </>
          )}
        </div>
      )}

      {/* Centered Cyber Marquee Player Card */}
      <div className="marquee-player-card">
        <div className="marquee-card-inner">
          {/* Player Avatar / Photo Card */}
          <div className="player-avatar-wrapper">
            {/* Ambient Spotlight Halo */}
            <div className="player-avatar-halo" />

            {/* Capped / Uncapped Tag */}
            <span className="player-capped-badge">
              {player.status || 'Capped'}
            </span>

            {/* Unsold Re-Entry Badge for Set 12 */}
            {player.isReentry && (
              <span 
                className="player-capped-badge" 
                style={{ 
                  left: 'auto', 
                  right: '0.85rem', 
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.4) 0%, rgba(153, 27, 27, 0.85) 100%)', 
                  border: '1.2px solid #ef4444', 
                  color: '#ffc2c2',
                  boxShadow: '0 0 10px rgba(239, 68, 68, 0.45)'
                }}
              >
                UNSOLD RE-ENTRY
              </span>
            )}

            {/* Country Badge */}
            <span className="player-country-badge" title={player.country}>
              {player.flag ? `${player.flag} ` : ''}{player.country || 'INDIA'}
            </span>

            {(player.photoUrl || player.image) ? (
              <img 
                src={player.photoUrl || player.image} 
                alt={player.name} 
                className="player-avatar-img"
                draggable="false"
                loading="eager"
              />
            ) : (
              <User className="player-avatar-svg" />
            )}
          </div>

          {/* Player Name */}
          <h2 className="player-name-display">{player.name}</h2>

          {/* Role & Country Strip */}
          <div className="player-role-country-strip">
            <span className={`role-tag ${player.role}`}>{player.subRole || player.role}</span>
            <span style={{ opacity: 0.5 }}>|</span>
            <span>{player.country}</span>
            {player.isOverseas && <span title="Overseas Slot">✈️</span>}
          </div>
        </div>
      </div>

      {/* Bottom Console: Large Current Bid + Leading Franchise Card */}
      <div className="stage-bidding-console">
        {/* Current Bid Display Card */}
        <div className="bid-box-card">
          <span className="bid-box-label">CURRENT BID</span>
          <div className="bid-amount-value">
            {formatPrice(currentBid)}
          </div>
          <span className="base-price-tag">
            BASE PRICE: {formatPrice(player.basePrice)}
          </span>
        </div>

        {/* Leading Franchise Card */}
        <div className={`leading-team-card ${leadingTeam ? 'active-leader' : ''}`}>
          <span className="bid-box-label">
            {leadingTeam ? 'LEADING BIDDER' : 'WAITING FOR FIRST BID'}
          </span>

          {leadingTeam ? (
            <div 
              style={{ 
                backgroundColor: leadingTeam.primaryColor,
                color: leadingTeam.textColor || '#FFFFFF',
                boxShadow: `0 0 22px ${leadingTeam.primaryColor}88`,
                padding: '0.2rem 1.1rem',
                borderRadius: '12px',
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.4rem, 2.2vw, 2.05rem)',
                letterSpacing: '1px',
                marginTop: '0.15rem',
                lineHeight: 1
              }}
            >
              {leadingTeam.code}
            </div>
          ) : (
            <div style={{ color: '#9eb8a8', fontSize: 'clamp(0.68rem, 1vw, 0.76rem)', marginTop: '0.35rem', fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
              PRESS TEAM KEY TO BID
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
