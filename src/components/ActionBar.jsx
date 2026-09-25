import React from 'react';
import { Gavel, XCircle, ArrowRight, ArrowLeft, RotateCcw, RotateCw } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function ActionBar({ 
  onSold, 
  onUnsold, 
  onNextPlayer, 
  onPreviousPlayer,
  onUndoBid, 
  onRedoBid,
  onUndoSale,
  onReopenPlayer,
  canUndo = true,
  canRedo = false,
  onManualIncrement,
  canSold,
  status 
}) {
  const handleSoldClick = () => {
    sounds.playSoldGavelSound();
    onSold();
  };

  const handleUnsoldClick = () => {
    sounds.playUnsoldBuzzerSound();
    onUnsold();
  };

  const handleNextClick = () => {
    sounds.playNextSound();
    onNextPlayer();
  };

  const handlePrevClick = () => {
    if (onPreviousPlayer) {
      sounds.playNextSound();
      onPreviousPlayer();
    }
  };

  return (
    <div className="action-bar-container">
      {/* Bid Bumps & Increments + Undo / Redo */}
      <div className="bidding-increments">
        <div className="increments-grid">
          <button 
            className="increment-btn" 
            onClick={() => onManualIncrement(0.20)} 
            title="Bump Bid by ₹ 20 Lakh"
            disabled={status !== 'LIVE'}
            style={{ opacity: status !== 'LIVE' ? 0.35 : 1, cursor: status !== 'LIVE' ? 'not-allowed' : 'pointer' }}
          >
            +20L
          </button>
          <button 
            className="increment-btn" 
            onClick={() => onManualIncrement(0.50)} 
            title="Bump Bid by ₹ 50 Lakh"
            disabled={status !== 'LIVE'}
            style={{ opacity: status !== 'LIVE' ? 0.35 : 1, cursor: status !== 'LIVE' ? 'not-allowed' : 'pointer' }}
          >
            +50L
          </button>
          <button 
            className="increment-btn" 
            onClick={() => onManualIncrement(1.00)} 
            title="Bump Bid by ₹ 1.00 Crore"
            disabled={status !== 'LIVE'}
            style={{ opacity: status !== 'LIVE' ? 0.35 : 1, cursor: status !== 'LIVE' ? 'not-allowed' : 'pointer' }}
          >
            +1.00 Cr
          </button>
          <button 
            className="increment-btn" 
            onClick={() => onManualIncrement(2.00)} 
            title="Bump Bid by ₹ 2.00 Crore"
            disabled={status !== 'LIVE'}
            style={{ opacity: status !== 'LIVE' ? 0.35 : 1, cursor: status !== 'LIVE' ? 'not-allowed' : 'pointer' }}
          >
            +2.00 Cr
          </button>
        </div>

        <div className="history-actions">
          {/* Dedicated Undo Button */}
          <button 
            className="action-undo-btn" 
            onClick={status === 'SOLD' && onUndoSale ? onUndoSale : onUndoBid}
            disabled={status !== 'SOLD' && !canUndo}
            title={status === 'SOLD' ? "Undo Sale: Refund purse & reopen bidding (Z Key)" : "Undo Last Action / Mistaken Bid (Z Key)"}
            style={{ 
              opacity: (status === 'SOLD' || canUndo) ? 1 : 0.35,
              borderColor: status === 'SOLD' ? '#f87171' : undefined,
              color: status === 'SOLD' ? '#fca5a5' : undefined 
            }}
          >
            <RotateCcw size={13} />
            <span>{status === 'SOLD' ? 'UNDO SALE' : 'UNDO'}</span>
          </button>

          {/* Dedicated Redo Button */}
          <button 
            className="action-undo-btn" 
            onClick={onRedoBid}
            disabled={!canRedo}
            title="Redo Undone Bid (Y Key)"
            style={{ opacity: canRedo ? 1 : 0.35 }}
          >
            <RotateCw size={13} />
            <span>REDO</span>
          </button>
        </div>
      </div>

      {/* Primary Action Buttons (Prev, SOLD / UNDO SALE, UNSOLD / REOPEN, Next) */}
      <div className="primary-actions">
        {/* PREVIOUS PLAYER (Arrow Left) */}
        <button 
          className="btn-nav btn-prev" 
          onClick={handlePrevClick}
          title="Previous Player (Left Arrow [←] or P Key)"
        >
          <ArrowLeft size={16} />
          <span>PREV</span>
        </button>

        {/* SOLD / UNDO SALE Button */}
        {status === 'SOLD' ? (
          <button 
            className="btn-undo-sale" 
            onClick={onUndoSale}
            title="Undo Sale: Refund purse to franchise and reopen bidding (Z Key)"
          >
            <RotateCcw size={20} />
            <span>UNDO SALE</span>
          </button>
        ) : (
          <button 
            className="btn-sold" 
            onClick={handleSoldClick}
            disabled={!canSold}
            style={{
              opacity: !canSold ? 0.35 : 1,
              cursor: !canSold ? 'not-allowed' : 'pointer'
            }}
            title="Mark Player as SOLD (Spacebar)"
          >
            <Gavel size={20} />
            <span>SOLD</span>
          </button>
        )}

        {/* UNSOLD / REOPEN Button */}
        {status === 'UNSOLD' ? (
          <button 
            className="btn-unsold" 
            onClick={onReopenPlayer}
            style={{
              background: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)',
              borderColor: '#f59e0b',
              color: '#ffffff',
              boxShadow: '0 0 16px rgba(245, 158, 11, 0.45)'
            }}
            title="Reopen bidding for this unsold player"
          >
            <RotateCcw size={16} />
            <span>REOPEN</span>
          </button>
        ) : (
          <button 
            className="btn-unsold" 
            onClick={handleUnsoldClick}
            disabled={status !== 'LIVE'}
            style={{
              opacity: status !== 'LIVE' ? 0.35 : 1,
              cursor: status !== 'LIVE' ? 'not-allowed' : 'pointer'
            }}
            title="Mark Player as UNSOLD (U Key)"
          >
            <XCircle size={16} />
            <span>UNSOLD</span>
          </button>
        )}

        {/* NEXT PLAYER Control (Arrow Right) */}
        <button 
          className="btn-nav btn-next" 
          onClick={handleNextClick}
          title="Advance to Next Player (Right Arrow [→] or N Key)"
        >
          <span>NEXT</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
