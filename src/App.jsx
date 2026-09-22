import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import PlayerStage from './components/PlayerStage';
import ActionBar from './components/ActionBar';
import UpcomingQueue from './components/UpcomingQueue';
import SidebarTeams from './components/SidebarTeams';
import ShortcutsModal from './components/ShortcutsModal';
import TeamDetailModal from './components/TeamDetailModal';
import RulesModal from './components/RulesModal';
import IntroScreen from './components/IntroScreen';
import CategoryTransitionModal from './components/CategoryTransitionModal';
import LoginScreen from './components/LoginScreen';
import BidderDashboard from './components/BidderDashboard';
import AddTeamModal from './components/AddTeamModal';
import { INITIAL_TEAMS, INITIAL_PLAYERS } from './data/auctionData';
import { sounds } from './utils/soundEffects';
import bgImage from './assets/eloquence_auction_bg.jpg';
import { 
  saveAuctionState, 
  loadAuctionState, 
  loadAuctionStateFromCloud,
  subscribeToAuctionState, 
  clearAuctionState 
} from './utils/auctionSync';

export default function App() {
  // Enforce mandatory Login Screen on initial load
  const [currentUser, setCurrentUser] = useState(null);

  // Clear any legacy auth keys and old test data from browser storage on mount
  useEffect(() => {
    try {
      localStorage.removeItem('revibe_auth_user');
      sessionStorage.removeItem('revibe_auth_user');
      localStorage.removeItem('revibe_auction_state_v1');
      localStorage.removeItem('revibe_auction_state_v2');
      localStorage.removeItem('revibe_auction_state_v3');
      localStorage.removeItem('revibe_auction_state_v3_clean');
    } catch (err) {
      // ignore
    }
  }, []);

  // Load initial state from persistent storage or fall back to SGC default data
  const initialSyncState = loadAuctionState();

  const getInitialPlayers = () => {
    if (!initialSyncState?.players) return INITIAL_PLAYERS;
    const basePlayers = INITIAL_PLAYERS.map((canonical) => {
      const existing = initialSyncState.players.find((p) => p.id === canonical.id);
      return existing 
        ? { 
            ...existing, 
            name: canonical.name,
            basePrice: canonical.basePrice,
            role: canonical.role,
            subRole: canonical.subRole,
            country: canonical.country,
            flag: canonical.flag,
            isOverseas: canonical.isOverseas,
            set: canonical.set,
            setNumber: canonical.setNumber
          } 
        : { ...canonical, soldPrice: null, soldTo: null, isPassed: false };
    });

    const reentryPlayers = initialSyncState.players.filter((p) => p.isReentry || p.setNumber === 12);
    return [...basePlayers, ...reentryPlayers];
  };

  const getInitialTeams = () => {
    if (!initialSyncState?.teams || !Array.isArray(initialSyncState.teams) || initialSyncState.teams.length === 0) {
      return INITIAL_TEAMS;
    }
    // Migrate legacy Delhi Capitals id if present
    const migrated = initialSyncState.teams.map((t) => {
      if (t.id === 'dc' && t.name && t.name.toLowerCase().includes('delhi')) {
        return { ...t, id: 'del', code: 'DEL', username: 'del' };
      }
      return t;
    });
    const existingIds = new Set(migrated.map((t) => t.id));
    const missing = INITIAL_TEAMS.filter((t) => !existingIds.has(t.id));
    return missing.length > 0 ? [...migrated, ...missing] : migrated;
  };

  const [teams, setTeams] = useState(getInitialTeams);
  const [players, setPlayers] = useState(getInitialPlayers);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(initialSyncState?.currentPlayerIndex ?? 0);
  const [activeTab, setActiveTab] = useState('bidding'); // 'bidding' | 'teams' | 'queue'
  
  const currentPlayer = players[currentPlayerIndex] || players[0];
  
  const [currentBid, setCurrentBid] = useState(initialSyncState?.currentBid ?? (currentPlayer?.basePrice || 2.00));
  const [leadingTeam, setLeadingTeam] = useState(initialSyncState?.leadingTeam || null);
  const [status, setStatus] = useState(initialSyncState?.status || 'LIVE'); // 'LIVE' | 'SOLD' | 'UNSOUND'
  
  const [completedPlayersMap, setCompletedPlayersMap] = useState(initialSyncState?.completedPlayersMap || {});
  const [bidHistory, setBidHistory] = useState(initialSyncState?.bidHistory || []);
  const [redoHistory, setRedoHistory] = useState([]);
  const [bidLogs, setBidLogs] = useState(initialSyncState?.bidLogs || []);
  const [lastSoldPlayer, setLastSoldPlayer] = useState(initialSyncState?.lastSoldPlayer || null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [inspectedTeam, setInspectedTeam] = useState(null);
  const [celebrationActive, setCelebrationActive] = useState(false);

  // Intro & Category Transition States
  const [showIntro, setShowIntro] = useState(initialSyncState?.showIntro ?? false);
  const [showCategoryTransition, setShowCategoryTransition] = useState(false);
  const [categoryTransitionInfo, setCategoryTransitionInfo] = useState(null);

  // Ref to prevent feedback loop when receiving remoteBroadcast state
  const isReceivingRemoteSync = useRef(false);

  // Helper to apply incoming remote sync state safely
  const applyRemoteState = useCallback((newState) => {
    if (!newState) return;
    isReceivingRemoteSync.current = true;
    if (newState.teams) {
      const migrated = newState.teams.map((t) => {
        if (t.id === 'dc' && t.name && t.name.toLowerCase().includes('delhi')) {
          return { ...t, id: 'del', code: 'DEL', username: 'del' };
        }
        return t;
      });
      const existingIds = new Set(migrated.map((t) => t.id));
      const missing = INITIAL_TEAMS.filter((t) => !existingIds.has(t.id));
      setTeams(missing.length > 0 ? [...migrated, ...missing] : migrated);
    }
    if (newState.players) {
      const basePlayers = INITIAL_PLAYERS.map((canonical) => {
        const existing = newState.players.find((p) => p.id === canonical.id);
        return existing 
          ? { 
              ...existing, 
              name: canonical.name,
              basePrice: canonical.basePrice,
              role: canonical.role,
              subRole: canonical.subRole,
              country: canonical.country,
              flag: canonical.flag,
              isOverseas: canonical.isOverseas,
              set: canonical.set,
              setNumber: canonical.setNumber
            } 
          : { ...canonical, soldPrice: null, soldTo: null, isPassed: false };
      });

      const reentryPlayers = newState.players.filter((p) => p.isReentry || p.setNumber === 12);
      setPlayers([...basePlayers, ...reentryPlayers]);
    }
    if (typeof newState.currentPlayerIndex === 'number') setCurrentPlayerIndex(newState.currentPlayerIndex);
    if (typeof newState.currentBid === 'number') setCurrentBid(newState.currentBid);
    setLeadingTeam(newState.leadingTeam || null);
    if (newState.status) setStatus(newState.status);
    if (newState.completedPlayersMap) setCompletedPlayersMap(newState.completedPlayersMap);
    if (newState.bidHistory) setBidHistory(newState.bidHistory);
    if (newState.bidLogs) setBidLogs(newState.bidLogs);
    if (newState.lastSoldPlayer !== undefined) setLastSoldPlayer(newState.lastSoldPlayer);
    if (typeof newState.showIntro === 'boolean') setShowIntro(newState.showIntro);
  }, []);

  // Real-time Cloud SSE, multi-tab BroadcastChannel & storage event subscription
  useEffect(() => {
    // 1. Initial hydration: load from local storage, then immediately check cloud for latest cross-device state
    const local = loadAuctionState();
    if (local) {
      applyRemoteState(local);
    }
    loadAuctionStateFromCloud().then((cloudState) => {
      if (cloudState) {
        applyRemoteState(cloudState);
      }
    });

    const unsubscribe = subscribeToAuctionState(
      (newState) => {
        applyRemoteState(newState);
      },
      () => {
        isReceivingRemoteSync.current = true;
        setTeams(INITIAL_TEAMS);
        setPlayers(INITIAL_PLAYERS);
        setCurrentPlayerIndex(0);
        setCurrentBid(INITIAL_PLAYERS[0]?.basePrice || 2.00);
        setLeadingTeam(null);
        setStatus('LIVE');
        setCompletedPlayersMap({});
        setBidHistory([]);
        setBidLogs([]);
        setLastSoldPlayer(null);
        setShowIntro(true);
      }
    );

    return () => unsubscribe();
  }, [applyRemoteState]);

  // Resilient fallback sync for non-admin sessions (mobile phones, bidder portals)
  useEffect(() => {
    if (currentUser && currentUser.role === 'admin') return;

    const syncState = () => {
      const latest = loadAuctionState();
      if (latest) {
        applyRemoteState(latest);
      }
    };

    // Continuous 1-second local storage poll
    const interval = setInterval(syncState, 1000);
    window.addEventListener('focus', syncState);

    // Periodic cloud poll every 2.5 seconds to guarantee phones catch up even if locked/asleep
    const cloudPollInterval = setInterval(() => {
      loadAuctionStateFromCloud().then((cloudState) => {
        if (cloudState) {
          applyRemoteState(cloudState);
        }
      });
    }, 2500);

    return () => {
      window.removeEventListener('focus', syncState);
      clearInterval(interval);
      clearInterval(cloudPollInterval);
    };
  }, [currentUser, applyRemoteState]);

  // Manual refresh handler for Bidder Dashboard and Login Screen
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(Date.now());

  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const cloudState = await loadAuctionStateFromCloud();
      if (cloudState) {
        applyRemoteState(cloudState);
        setLastSyncTime(Date.now());
        return true;
      } else {
        const local = loadAuctionState();
        if (local) {
          applyRemoteState(local);
          setLastSyncTime(Date.now());
          return true;
        }
      }
    } catch (err) {
      console.warn('Manual refresh failed:', err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
    return false;
  }, [applyRemoteState]);

  // Save to localStorage & broadcast whenever local state changes — STRICTLY ADMIN ONLY!
  useEffect(() => {
    // Only Admin can write and broadcast auction state to prevent bidder tabs from overwriting live data
    if (!currentUser || currentUser.role !== 'admin') {
      return;
    }

    if (isReceivingRemoteSync.current) {
      isReceivingRemoteSync.current = false;
      return;
    }

    saveAuctionState({
      teams,
      players,
      currentPlayerIndex,
      currentBid,
      leadingTeam,
      status,
      completedPlayersMap,
      bidHistory,
      bidLogs,
      lastSoldPlayer,
      showIntro
    });
  }, [
    currentUser,
    teams,
    players,
    currentPlayerIndex,
    currentBid,
    leadingTeam,
    status,
    completedPlayersMap,
    bidHistory,
    bidLogs,
    lastSoldPlayer,
    showIntro
  ]);

  // Dynamic IPL bid increment rule
  const calculateNextIncrement = (price) => {
    if (price < 1.0) return 0.10; // 10 Lakhs
    if (price < 2.0) return 0.10; // 10 Lakhs
    if (price < 5.0) return 0.20; // 20 Lakhs
    if (price < 10.0) return 0.50; // 50 Lakhs
    return 1.00; // 1 Crore
  };

  // Place Bid for a franchise (strictly enforces SGC rules)
  const handlePlaceBid = useCallback((team) => {
    if (status !== 'LIVE' || showIntro || showCategoryTransition) return;

    // Rule 12: 16-Player Squad Cap Check
    if (team.squadCount >= (team.squadMax || 16)) {
      alert(`RULE 12 VIOLATION: ${team.name} (${team.code}) has completed its exact 16-player squad! No further bids permitted.`);
      return;
    }

    const increment = calculateNextIncrement(currentBid);
    const nextBidAmount = +(currentBid + increment).toFixed(2);

    // Rule 6: Available Purse Check
    if (team.purseRemaining < nextBidAmount) {
      alert(`RULE 6 ALERT: ${team.name} has insufficient purse (₹ ${team.purseRemaining.toFixed(2)} Cr) for ₹ ${nextBidAmount.toFixed(2)} Cr bid! Bidding beyond available purse is disqualified.`);
      return;
    }

    setBidHistory((prev) => [
      ...prev,
      { leadingTeam, currentBid, status, teamsState: teams, completedMap: completedPlayersMap }
    ]);
    setRedoHistory([]);

    setBidLogs((prev) => [
      ...prev,
      { team, amount: nextBidAmount, time: new Date().toLocaleTimeString() }
    ]);

    setLeadingTeam(team);
    setCurrentBid(nextBidAmount);
    sounds.playBidSound();
  }, [status, showIntro, showCategoryTransition, leadingTeam, currentBid, teams, completedPlayersMap]);

  // Handle SOLD button click
  const handleSold = useCallback(() => {
    if (!leadingTeam || status !== 'LIVE' || showIntro || showCategoryTransition) return;

    setBidHistory((prev) => [
      ...prev,
      { leadingTeam, currentBid, status: 'LIVE', teamsState: teams, completedMap: completedPlayersMap, playersState: players }
    ]);
    setRedoHistory([]);

    setStatus('SOLD');
    setCompletedPlayersMap((prev) => ({ 
      ...prev, 
      [currentPlayer.id]: 'SOLD',
      ...(currentPlayer.originalId ? { [currentPlayer.originalId]: 'SOLD' } : {})
    }));
    setLastSoldPlayer({ name: currentPlayer.name, team: leadingTeam, price: currentBid });

    // Update player object sold info
    setPlayers((prevPlayers) =>
      prevPlayers.map((p) => {
        if (p.id === currentPlayer.id || (currentPlayer.originalId && p.id === currentPlayer.originalId)) {
          return {
            ...p,
            soldPrice: currentBid,
            soldTo: leadingTeam.name,
            isPassed: false
          };
        }
        return p;
      })
    );

    setCelebrationActive(true);
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: [leadingTeam.primaryColor, '#39ff88', '#00a83b', '#ffd700', '#FFFFFF']
    });

    setTeams((prevTeams) =>
      prevTeams.map((t) => {
        if (t.id === leadingTeam.id) {
          const role = currentPlayer.role || 'Batsman';
          const newRoleCounts = { 
            Batsman: t.squadRoleCounts?.Batsman || 0,
            Bowler: t.squadRoleCounts?.Bowler || 0,
            'All-Rounder': t.squadRoleCounts?.['All-Rounder'] || 0,
            Wicketkeeper: t.squadRoleCounts?.Wicketkeeper || 0
          };
          if (newRoleCounts[role] !== undefined) {
            newRoleCounts[role] += 1;
          } else if (role.toLowerCase().includes('bat')) {
            newRoleCounts.Batsman += 1;
          } else if (role.toLowerCase().includes('bowl')) {
            newRoleCounts.Bowler += 1;
          } else if (role.toLowerCase().includes('round')) {
            newRoleCounts['All-Rounder'] += 1;
          } else if (role.toLowerCase().includes('keep')) {
            newRoleCounts.Wicketkeeper += 1;
          } else {
            newRoleCounts[role] = (newRoleCounts[role] || 0) + 1;
          }

          return {
            ...t,
            purseRemaining: +(t.purseRemaining - currentBid).toFixed(2),
            squadCount: (t.squadCount || 0) + 1,
            overseasCount: currentPlayer.isOverseas ? (t.overseasCount || 0) + 1 : (t.overseasCount || 0),
            squadRoleCounts: newRoleCounts,
            acquiredPlayers: [
              ...(t.acquiredPlayers || []),
              { 
                id: currentPlayer.id,
                name: currentPlayer.name, 
                price: currentBid, 
                bidAmount: currentBid,
                role: currentPlayer.role,
                isOverseas: currentPlayer.isOverseas,
                country: currentPlayer.country || 'India',
                image: currentPlayer.image || currentPlayer.photoUrl,
                photoUrl: currentPlayer.photoUrl || currentPlayer.image
              }
            ]
          };
        }
        return t;
      })
    );

    setTimeout(() => {
      setCelebrationActive(false);
    }, 1000);
  }, [leadingTeam, status, showIntro, showCategoryTransition, currentPlayer, currentBid, teams, completedPlayersMap, players]);

  // Handle UNSOLD button click
  const handleUnsold = useCallback(() => {
    if (status !== 'LIVE' || showIntro || showCategoryTransition) return;

    let updatedPlayers = players;
    const reentryId = `${currentPlayer.id}_reentry`;
    const isAlreadyInSet12 = players.some(
      (p) => p.id === reentryId || (p.originalId === currentPlayer.id && p.setNumber === 12)
    );

    // If player is from Sets 1-11 and not already queued into Set 12, add to Set 12
    if (currentPlayer.setNumber !== 12 && !isAlreadyInSet12) {
      const reentryPlayer = {
        ...currentPlayer,
        id: reentryId,
        originalId: currentPlayer.id,
        isReentry: true,
        set: 'SET 12 — RESERVE / UNSOLD RE-ENTRY POOL',
        setNumber: 12,
        soldPrice: null,
        soldTo: null,
        isPassed: false
      };
      updatedPlayers = [...players, reentryPlayer];
      setPlayers(updatedPlayers);
    }

    setBidHistory((prev) => [
      ...prev,
      { 
        leadingTeam, 
        currentBid, 
        status: 'LIVE', 
        teamsState: teams, 
        completedMap: completedPlayersMap,
        playersState: players
      }
    ]);
    setRedoHistory([]);
    setStatus('UNSOLD');
    setCompletedPlayersMap((prev) => ({ ...prev, [currentPlayer.id]: 'UNSOLD' }));
  }, [status, showIntro, showCategoryTransition, currentPlayer, leadingTeam, currentBid, teams, completedPlayersMap, players]);

  // Handle NEXT PLAYER (Arrow Right / N Key)
  const handleNextPlayer = useCallback(() => {
    if (showIntro || showCategoryTransition) return;

    const nextIdx = (currentPlayerIndex + 1) % players.length;
    const currentSet = players[currentPlayerIndex]?.set;
    const nextSet = players[nextIdx]?.set;

    // Check if transitioning to a new Category Set
    if (currentSet && nextSet && currentSet !== nextSet) {
      const nextCategoryPlayers = players.filter((p) => p.set === nextSet);
      setCategoryTransitionInfo({
        completedCategory: currentSet,
        nextCategory: nextSet,
        nextPlayerCount: nextCategoryPlayers.length,
        nextIdx: nextIdx
      });
      setShowCategoryTransition(true);
      return;
    }

    setCurrentPlayerIndex(nextIdx);
    setCurrentBid(players[nextIdx].basePrice);
    setLeadingTeam(null);
    setStatus('LIVE');
    setBidHistory([]);
    setRedoHistory([]);
  }, [currentPlayerIndex, players, showIntro, showCategoryTransition]);

  // Handle PREVIOUS PLAYER (Arrow Left / P Key)
  const handlePreviousPlayer = useCallback(() => {
    if (showIntro || showCategoryTransition) return;

    const prevIdx = (currentPlayerIndex - 1 + players.length) % players.length;
    setCurrentPlayerIndex(prevIdx);
    setCurrentBid(players[prevIdx].basePrice);
    setLeadingTeam(null);
    setStatus('LIVE');
    setBidHistory([]);
    setRedoHistory([]);
  }, [currentPlayerIndex, players, showIntro, showCategoryTransition]);

  // Proceed to Next Category / Set handler
  const handleProceedToNextCategory = (targetIdx) => {
    const nextIdx = typeof targetIdx === 'number' 
      ? targetIdx 
      : categoryTransitionInfo?.nextIdx ?? 0;
    const nextPlayer = players[nextIdx];
    if (nextPlayer) {
      setCurrentPlayerIndex(nextIdx);
      setCurrentBid(nextPlayer.basePrice);
      setLeadingTeam(null);
      setStatus('LIVE');
      setBidHistory([]);
      setRedoHistory([]);
    }
    setActiveTab('bidding');
    setShowCategoryTransition(false);
    setCategoryTransitionInfo(null);
  };

  // Open Set Intro / Verification modal for any chosen set
  const handleOpenSetTransition = (targetSetName) => {
    const setIdx = players.findIndex((p) => p.set === targetSetName);
    if (setIdx === -1) {
      if (targetSetName.includes('SET 12') || targetSetName.includes('RESERVE')) {
        alert('No players have gone unsold yet! Any players marked as UNSOLD during Sets 1 to 11 will automatically enter this reserve pool.');
      }
      return;
    }

    const currentSet = players[currentPlayerIndex]?.set || targetSetName;
    const targetSetPlayers = players.filter((p) => p.set === targetSetName);

    setCategoryTransitionInfo({
      completedCategory: currentSet !== targetSetName ? currentSet : null,
      nextCategory: targetSetName,
      nextPlayerCount: targetSetPlayers.length,
      nextIdx: setIdx
    });
    setActiveTab('bidding');
    setShowCategoryTransition(true);
  };

  // Open Set Overview & Analysis directly
  const handleOpenSetOverview = () => {
    const currentSet = players[currentPlayerIndex]?.set || 'SET 1 — MARQUEE PLAYERS';
    const setPlayers = players.filter((p) => p.set === currentSet);

    setCategoryTransitionInfo({
      completedCategory: null,
      nextCategory: currentSet,
      nextPlayerCount: setPlayers.length,
      nextIdx: currentPlayerIndex
    });
    setShowCategoryTransition(true);
  };

  // Start Auction handler from Intro
  const handleStartAuction = () => {
    setShowIntro(false);
    setCurrentPlayerIndex(0);
    setCurrentBid(players[0]?.basePrice || 2.00);
    setLeadingTeam(null);
    setStatus('LIVE');
    setBidHistory([]);
    setRedoHistory([]);
    handleOpenSetTransition(players[0]?.set || 'SET 1 — MARQUEE PLAYERS');
  };

  // Manual Increments
  const handleManualIncrement = (amount) => {
    if (status !== 'LIVE' || showIntro || showCategoryTransition) return;
    setBidHistory((prev) => [
      ...prev,
      { leadingTeam, currentBid, status, teamsState: teams, completedMap: completedPlayersMap, playersState: players }
    ]);
    setRedoHistory([]);
    setCurrentBid((prev) => +(prev + amount).toFixed(2));
    sounds.playBidSound();
  };

  // Undo Last Action / Mistaken Bid
  const handleUndoBid = useCallback(() => {
    if (bidHistory.length === 0 || showIntro || showCategoryTransition) return;
    const lastState = bidHistory[bidHistory.length - 1];

    setRedoHistory((prev) => [
      ...prev,
      {
        leadingTeam,
        currentBid,
        status,
        teamsState: teams,
        completedMap: completedPlayersMap,
        playersState: players
      }
    ]);

    setLeadingTeam(lastState.leadingTeam);
    setCurrentBid(lastState.currentBid);
    if (lastState.status) setStatus(lastState.status);
    if (lastState.teamsState) setTeams(lastState.teamsState);
    if (lastState.completedMap) setCompletedPlayersMap(lastState.completedMap);
    if (lastState.playersState) setPlayers(lastState.playersState);

    setBidHistory((prev) => prev.slice(0, -1));
    sounds.playBidSound();
  }, [bidHistory, leadingTeam, currentBid, status, teams, completedPlayersMap, players, showIntro, showCategoryTransition]);

  // Redo Undone Action / Bid
  const handleRedoBid = useCallback(() => {
    if (redoHistory.length === 0 || showIntro || showCategoryTransition) return;
    const nextState = redoHistory[redoHistory.length - 1];

    setBidHistory((prev) => [
      ...prev,
      {
        leadingTeam,
        currentBid,
        status,
        teamsState: teams,
        completedMap: completedPlayersMap,
        playersState: players
      }
    ]);

    setLeadingTeam(nextState.leadingTeam);
    setCurrentBid(nextState.currentBid);
    if (nextState.status) setStatus(nextState.status);
    if (nextState.teamsState) setTeams(nextState.teamsState);
    if (nextState.completedMap) setCompletedPlayersMap(nextState.completedMap);
    if (nextState.playersState) setPlayers(nextState.playersState);

    setRedoHistory((prev) => prev.slice(0, -1));
    sounds.playBidSound();
  }, [redoHistory, leadingTeam, currentBid, status, teams, completedPlayersMap, players, showIntro, showCategoryTransition]);

  const handleSelectPlayerFromQueue = (player) => {
    const idx = players.findIndex((p) => p.id === player.id);
    if (idx !== -1) {
      setCurrentPlayerIndex(idx);
      setCurrentBid(player.basePrice);
      setLeadingTeam(null);
      setStatus('LIVE');
      setBidHistory([]);
      setRedoHistory([]);
      setActiveTab('bidding');
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all IPL Auction data to initial Eloquence ₹80 Cr purse state?')) {
      clearAuctionState();
      setTeams(INITIAL_TEAMS);
      setPlayers(INITIAL_PLAYERS);
      setCurrentPlayerIndex(0);
      setCurrentBid(INITIAL_PLAYERS[0].basePrice);
      setLeadingTeam(null);
      setStatus('LIVE');
      setCompletedPlayersMap({});
      setBidHistory([]);
      setBidLogs([]);
      setLastSoldPlayer(null);
      setShowIntro(true);
    }
  };

  const handleAddTeam = (newTeam) => {
    setTeams((prev) => {
      const exists = prev.some((t) => t.id === newTeam.id);
      if (exists) {
        return prev.map((t) => (t.id === newTeam.id ? newTeam : t));
      }
      return [...prev, newTeam];
    });
  };

  const handleClearTeams = () => {
    if (window.confirm("Are you sure you want to clear all teams? You can re-add your own custom teams manually.")) {
      setTeams([]);
      setLeadingTeam(null);
    }
  };

  const handleResetDefaultTeams = () => {
    if (window.confirm("Reset all teams to default Eloquence lineup?")) {
      setTeams(INITIAL_TEAMS);
    }
  };

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    // Immediately hydrate state from local storage and cloud upon login
    const latestState = loadAuctionState();
    if (latestState) {
      applyRemoteState(latestState);
    }
    loadAuctionStateFromCloud().then((cloudState) => {
      if (cloudState) {
        applyRemoteState(cloudState);
      }
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      sessionStorage.removeItem('revibe_auth_user');
      localStorage.removeItem('revibe_auth_user');
    } catch (err) {
      console.warn('Failed to clear auth user:', err);
    }
  };

  // Keyboard Event Listener (Admin Only)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!currentUser || currentUser.role !== 'admin') return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (showIntro || showCategoryTransition) return;

      const key = e.key.toUpperCase();

      // Undo (Direct 'Z' key or Ctrl+Z) and Redo (Direct 'Y' key, Ctrl+Y, or Shift+Z)
      if (key === 'Z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedoBid();
        } else {
          handleUndoBid();
        }
        return;
      } else if (key === 'Y' || (e.ctrlKey && key === 'Y')) {
        e.preventDefault();
        handleRedoBid();
        return;
      }

      // Player Navigation (ArrowRight / N, ArrowLeft / P)
      if (e.key === 'ArrowRight' || key === 'N') {
        e.preventDefault();
        handleNextPlayer();
        return;
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePreviousPlayer();
        return;
      }

      // Sold & Unsold shortcuts
      if (e.code === 'Space' || key === 'ENTER') {
        e.preventDefault();
        handleSold();
        return;
      } else if (key === 'U') {
        e.preventDefault();
        handleUnsold();
        return;
      } else if (key === '?') {
        setShowShortcutsModal((prev) => !prev);
        return;
      }

      // Check dynamic team hotkeys first (supports custom added teams!)
      const matchedTeam = teams.find(
        (t) => (t.hotkey && String(t.hotkey).toUpperCase() === key) ||
               (t.letterKey && String(t.letterKey).toUpperCase() === key) ||
               (t.code && String(t.code).toUpperCase() === key) ||
               (t.id && String(t.id).toUpperCase() === key) ||
               (t.aliases && Array.isArray(t.aliases) && t.aliases.some((a) => a.toUpperCase() === key))
      );
      if (matchedTeam) {
        e.preventDefault();
        handlePlaceBid(matchedTeam);
        return;
      }

      // Fallback number & letter key mappings for Teams
      const teamHotkeyMap = {
        'C': 'csk', '1': 'csk',
        'M': 'mi',  '2': 'mi',
        'R': 'rcb', '3': 'rcb',
        'K': 'kkr', '4': 'kkr',
        'J': 'rr',  '5': 'rr',
        'S': 'srh', '6': 'srh',
        'G': 'gt',  '7': 'gt',
        'L': 'lsg', '8': 'lsg',
        'D': 'del', '9': 'del',
        'P': 'pbks','0': 'pbks',
        'U': 'rps', 'Q': 'rps', '-': 'rps',
        'H': 'dc',  'E': 'dc',  '=': 'dc'
      };

      if (teamHotkeyMap[key]) {
        const targetTeam = teams.find((t) => t.id === teamHotkeyMap[key]);
        if (targetTeam) {
          e.preventDefault();
          handlePlaceBid(targetTeam);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentUser, teams, handlePlaceBid, handleSold, handleUnsold, handleNextPlayer, handlePreviousPlayer, handleUndoBid, handleRedoBid, showIntro, showCategoryTransition]);

  // 1. Not Authenticated Screen
  if (!currentUser) {
    return (
      <LoginScreen 
        teams={teams}
        onLoginSuccess={handleLoginSuccess} 
        onRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
      />
    );
  }

  // 2. Bidder / Franchise Dashboard View
  if (currentUser.role === 'bidder') {
    const bidderTeam = teams.find((t) => t.id === currentUser.teamId) || teams[0];
    return (
      <BidderDashboard
        team={bidderTeam}
        teams={teams}
        currentPlayer={currentPlayer}
        currentBid={currentBid}
        leadingTeam={leadingTeam}
        status={status}
        bidLogs={bidLogs}
        lastSoldPlayer={lastSoldPlayer}
        showIntro={showIntro}
        onLogout={handleLogout}
        onRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
        lastSyncTime={lastSyncTime}
      />
    );
  }

  // 3. Admin Auction Management Console
  return (
    <div 
      className="admin-app"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(2, 8, 4, 0.2) 0%, rgba(2, 8, 4, 0.48) 100%), url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="revibe-bg-watermark"></div>
      
      {/* Intro Animation & 10-Second Countdown Screen */}
      {showIntro && (
        <IntroScreen 
          onStartAuction={handleStartAuction} 
          onClose={() => setShowIntro(false)} 
        />
      )}

      {/* Category / Set Completion Transition & Verification Modal */}
      {showCategoryTransition && (
        <CategoryTransitionModal
          completedCategory={categoryTransitionInfo?.completedCategory}
          nextCategory={categoryTransitionInfo?.nextCategory}
          nextPlayerCount={categoryTransitionInfo?.nextPlayerCount}
          nextIdx={categoryTransitionInfo?.nextIdx}
          players={players}
          teams={teams}
          completedPlayersMap={completedPlayersMap}
          onInspectTeam={(team) => setInspectedTeam(team)}
          onProceed={handleProceedToNextCategory}
          onClose={() => {
            setShowCategoryTransition(false);
            setCategoryTransitionInfo(null);
          }}
          onSelectSet={(targetSet) => handleOpenSetTransition(targetSet)}
        />
      )}

      {celebrationActive && <div className="sold-celebration-overlay"></div>}

      {/* Top Header */}
      <Header
        currentSet={currentPlayer?.set}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenHelp={() => setShowShortcutsModal(true)}
        onOpenRules={() => setShowRulesModal(true)}
        onOpenIntro={() => setShowIntro(true)}
        onOpenAddTeam={() => setShowAddTeamModal(true)}
        onResetData={handleResetData}
        onLogout={handleLogout}
        onOpenSetTransition={handleOpenSetTransition}
        onOpenSetOverview={handleOpenSetOverview}
        players={players}
        completedPlayersMap={completedPlayersMap}
      />

      {/* Main Tabbed Views */}
      {activeTab === 'bidding' && (
        <main className="bidding-main-view">
          <div className="center-stage-container" style={{ flex: 1 }}>
            <PlayerStage
              player={currentPlayer}
              status={status}
              leadingTeam={leadingTeam}
              currentBid={currentBid}
            />

            <ActionBar
              onSold={handleSold}
              onUnsold={handleUnsold}
              onNextPlayer={handleNextPlayer}
              onPreviousPlayer={handlePreviousPlayer}
              onUndoBid={handleUndoBid}
              onRedoBid={handleRedoBid}
              canUndo={bidHistory.length > 0}
              canRedo={redoHistory.length > 0}
              onManualIncrement={handleManualIncrement}
              canSold={!!leadingTeam}
              status={status}
            />
          </div>
        </main>
      )}

      {activeTab === 'teams' && (
        <main style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
          <SidebarTeams
            teams={teams}
            onInspectTeam={(team) => setInspectedTeam(team)}
          />
        </main>
      )}

      {activeTab === 'queue' && (
        <main style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
          <UpcomingQueue
            players={players}
            currentPlayerId={currentPlayer?.id}
            onSelectPlayer={handleSelectPlayerFromQueue}
            completedPlayersMap={completedPlayersMap}
            onLoadSet={handleOpenSetTransition}
          />
        </main>
      )}

      {/* Modals */}
      {showShortcutsModal && (
        <ShortcutsModal onClose={() => setShowShortcutsModal(false)} />
      )}

      {showRulesModal && (
        <RulesModal onClose={() => setShowRulesModal(false)} />
      )}

      {showAddTeamModal && (
        <AddTeamModal
          teams={teams}
          onAddTeam={handleAddTeam}
          onClearAllTeams={handleClearTeams}
          onResetDefaultTeams={handleResetDefaultTeams}
          onClose={() => setShowAddTeamModal(false)}
        />
      )}

      {inspectedTeam && (
        <TeamDetailModal
          team={inspectedTeam}
          onClose={() => setInspectedTeam(null)}
        />
      )}
    </div>
  );
}
