import React from 'react';
import { Shield, DollarSign, Users, ExternalLink, TrendingUp, PieChart } from 'lucide-react';

export default function SidebarTeams({ teams, onInspectTeam }) {
  // Aggregate overall auction stats
  const totalPurseAll = teams.reduce((acc, t) => acc + t.purseTotal, 0);
  const remainingPurseAll = teams.reduce((acc, t) => acc + t.purseRemaining, 0);
  const spentPurseAll = totalPurseAll - remainingPurseAll;
  const totalPlayersBought = teams.reduce((acc, t) => acc + t.squadCount, 0);
  const totalOverseasBought = teams.reduce((acc, t) => acc + t.overseasCount, 0);

  return (
    <div className="team-dashboard-container">
      {/* Overview Macro Summary Cards Bar */}
      <div className="teams-summary-grid">
        <div className="stat-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span className="stat-label">REMAINING PURSE</span>
            <DollarSign size={16} style={{ color: '#39ff88' }} />
          </div>
          <div className="stat-val" style={{ color: '#39ff88', fontSize: '1.5rem' }}>
            ₹ {remainingPurseAll.toFixed(2)} Cr
          </div>
          <span style={{ fontSize: '0.7rem', color: '#9eb8a8', fontFamily: 'var(--font-mono)' }}>
            Spent: ₹ {spentPurseAll.toFixed(2)} Cr ({((spentPurseAll / totalPurseAll) * 100).toFixed(1)}%)
          </span>
        </div>

        <div className="stat-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span className="stat-label">TOTAL SPENT</span>
            <TrendingUp size={16} style={{ color: '#ffd700' }} />
          </div>
          <div className="stat-val" style={{ color: '#ffd700', fontSize: '1.5rem' }}>
            ₹ {spentPurseAll.toFixed(2)} Cr
          </div>
          <span style={{ fontSize: '0.7rem', color: '#9eb8a8', fontFamily: 'var(--font-mono)' }}>
            Out of ₹ {totalPurseAll.toFixed(2)} Cr Pool
          </span>
        </div>

        <div className="stat-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span className="stat-label">PLAYERS BOUGHT</span>
            <Users size={16} style={{ color: '#39ff88' }} />
          </div>
          <div className="stat-val" style={{ color: '#ffffff', fontSize: '1.5rem' }}>
            {totalPlayersBought} <span style={{ fontSize: '0.85rem', color: '#9eb8a8' }}>/ 250</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: '#9eb8a8', fontFamily: 'var(--font-mono)' }}>
            Across 10 Franchises
          </span>
        </div>

        <div className="stat-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span className="stat-label">OVERSEAS SLOTS</span>
            <PieChart size={16} style={{ color: '#38bdf8' }} />
          </div>
          <div className="stat-val" style={{ color: '#38bdf8', fontSize: '1.5rem' }}>
            {totalOverseasBought} <span style={{ fontSize: '0.85rem', color: '#9eb8a8' }}>/ 80</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: '#9eb8a8', fontFamily: 'var(--font-mono)' }}>
            Max 8 per team
          </span>
        </div>
      </div>

      {/* 10 Team Cards Grid Header */}
      <h3 style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.08em', fontSize: '1.05rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff' }}>
        <Shield size={18} style={{ color: '#39ff88' }} />
        <span>FRANCHISE PURSE & SQUAD ANALYSIS</span>
      </h3>

      <div className="teams-cards-grid">
        {teams.map((team) => {
          const purseSpent = team.purseTotal - team.purseRemaining;
          const spentPercent = Math.min(100, (purseSpent / team.purseTotal) * 100);

          // Find top purchase player
          const topBuy = team.acquiredPlayers.length > 0
            ? [...team.acquiredPlayers].sort((a, b) => b.price - a.price)[0]
            : null;

          return (
            <div
              key={team.id}
              onClick={() => onInspectTeam(team)}
              style={{
                background: 'linear-gradient(165deg, rgba(12, 30, 20, 0.92) 0%, rgba(3, 10, 6, 0.96) 100%)',
                borderRadius: '16px',
                border: `1.5px solid ${team.primaryColor}`,
                padding: '1.1rem',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.75)',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                position: 'relative',
                overflow: 'hidden',
                color: '#ffffff'
              }}
              className="team-dashboard-card"
            >
              {/* Top Accent Ribbon */}
              <div 
                style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  height: '4px', 
                  backgroundColor: team.primaryColor,
                  boxShadow: `0 0 10px ${team.primaryColor}`
                }} 
              />

              {/* Card Header: Code Badge + Full Name + Purse */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: '10px',
                      backgroundColor: team.primaryColor,
                      color: team.textColor || '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.2rem',
                      boxShadow: `0 0 16px ${team.primaryColor}66`
                    }}
                  >
                    {team.code}
                  </div>
                  <div>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.98rem', margin: 0, color: '#ffffff' }}>
                      {team.name}
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: '#9eb8a8', fontFamily: 'var(--font-mono)' }}>
                      Squad: {team.squadCount} / {team.squadMax || 16} • OS: {team.overseasCount} / {team.overseasMax || 8}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', color: '#39ff88', lineHeight: 1, textShadow: '0 0 10px rgba(57,255,136,0.5)' }}>
                    ₹ {team.purseRemaining.toFixed(2)} Cr
                  </div>
                  <span style={{ fontSize: '0.65rem', color: '#a3ffd6', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                    REMAINING PURSE
                  </span>
                </div>
              </div>

              {/* Purse Progress Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#9eb8a8', marginBottom: '0.25rem', fontFamily: 'var(--font-mono)' }}>
                  <span>Spent: ₹ {purseSpent.toFixed(2)} Cr ({spentPercent.toFixed(1)}%)</span>
                  <span>Total: ₹ {team.purseTotal.toFixed(2)} Cr</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      width: `${spentPercent}%`, 
                      backgroundColor: team.primaryColor,
                      borderRadius: '4px',
                      boxShadow: `0 0 8px ${team.primaryColor}`,
                      transition: 'width 0.4s ease'
                    }} 
                  />
                </div>
              </div>

              {/* Squad Composition Metrics (16 Squad: 5 Bat, 5 Bowl, 4 AR, 2 WK) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
                <div className="stat-box" style={{ background: 'rgba(2, 8, 4, 0.8)', padding: '0.4rem 0.2rem' }}>
                  <span className="stat-label" style={{ color: '#a3ffd6', fontSize: '0.58rem' }}>BAT</span>
                  <div className="stat-val" style={{ color: '#ffffff', fontSize: '0.9rem' }}>
                    {team.squadRoleCounts?.Batsman || 0}/5
                  </div>
                </div>
                <div className="stat-box" style={{ background: 'rgba(2, 8, 4, 0.8)', padding: '0.4rem 0.2rem' }}>
                  <span className="stat-label" style={{ color: '#a3ffd6', fontSize: '0.58rem' }}>BOWL</span>
                  <div className="stat-val" style={{ color: '#ffffff', fontSize: '0.9rem' }}>
                    {team.squadRoleCounts?.Bowler || 0}/5
                  </div>
                </div>
                <div className="stat-box" style={{ background: 'rgba(2, 8, 4, 0.8)', padding: '0.4rem 0.2rem' }}>
                  <span className="stat-label" style={{ color: '#a3ffd6', fontSize: '0.58rem' }}>AR</span>
                  <div className="stat-val" style={{ color: '#ffffff', fontSize: '0.9rem' }}>
                    {team.squadRoleCounts?.['All-Rounder'] || 0}/4
                  </div>
                </div>
                <div className="stat-box" style={{ background: 'rgba(2, 8, 4, 0.8)', padding: '0.4rem 0.2rem' }}>
                  <span className="stat-label" style={{ color: '#a3ffd6', fontSize: '0.58rem' }}>WK</span>
                  <div className="stat-val" style={{ color: '#ffffff', fontSize: '0.9rem' }}>
                    {team.squadRoleCounts?.Wicketkeeper || 0}/2
                  </div>
                </div>
              </div>

              {/* Top Buy Highlight & Action */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(2, 8, 4, 0.65)', border: '1px solid rgba(57, 255, 136, 0.15)', padding: '0.5rem 0.75rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem' }}>
                  {topBuy ? (
                    <span>
                      🌟 <strong>Highest Buy:</strong> {topBuy.name} (<span style={{ color: '#39ff88', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>₹ {topBuy.price.toFixed(2)} Cr</span>)
                    </span>
                  ) : (
                    <span style={{ color: '#9eb8a8' }}>No players acquired yet</span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#39ff88', fontWeight: 800, fontSize: '0.72rem', fontFamily: 'var(--font-display)' }}>
                  <span>ANALYZE</span>
                  <ExternalLink size={13} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
