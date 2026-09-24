import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generate and download an executive, publication-grade PDF report
 * containing team-wise telemetry, purse statistics, and all auctioned players.
 *
 * @param {Object} params
 * @param {Array} params.teams - List of all team objects
 * @param {Array} params.players - List of all player objects
 * @param {Object} [params.completedPlayersMap] - Status map (player id -> 'SOLD' | 'UNSOLD')
 */
export function generateAuctionReportPdf({ teams = [], players = [], completedPlayersMap = {} }) {
  if (!teams || teams.length === 0) {
    throw new Error('No team data available to export.');
  }

  // Initialize A4 document (210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Formatting helpers
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) return '₹ 0.00 Cr';
    return `₹ ${Number(amount).toFixed(2)} Cr`;
  };

  const currentDate = new Date();
  const timestampStr = currentDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }) + ' at ' + currentDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  // Calculate Overall Macro Statistics
  const totalPurseAllocated = teams.reduce((acc, t) => acc + (t.purseTotal || 80.0), 0);
  const totalPurseRemaining = teams.reduce((acc, t) => acc + (t.purseRemaining ?? (t.purseTotal || 80.0)), 0);
  const totalPurseSpent = +(totalPurseAllocated - totalPurseRemaining).toFixed(2);
  const totalPlayersSold = teams.reduce((acc, t) => acc + (t.squadCount || t.acquiredPlayers?.length || 0), 0);
  const totalOverseasSold = teams.reduce((acc, t) => acc + (t.overseasCount || 0), 0);

  // Unsold count from completed map or passed players
  const unsoldPlayers = players.filter((p) => {
    return completedPlayersMap[p.id] === 'UNSOLD' || (p.isPassed && !p.soldPrice && !p.soldTo);
  });

  // ----------------------------------------------------
  // 1. PAGE 1: HEADER BANNER
  // ----------------------------------------------------
  let currentY = 14;

  // Dark emerald tournament header banner
  doc.setFillColor(4, 30, 16); // #041e10
  doc.roundedRect(margin, currentY, contentWidth, 28, 3, 3, 'F');

  // Accent glowing border on the left
  doc.setFillColor(57, 255, 136); // #39ff88
  doc.rect(margin, currentY, 3.5, 28, 'F');

  // Banner Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("ELOQUENCE '26 — DOOMSDAY AUCTION", margin + 8, currentY + 10);

  // Banner Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(57, 255, 136);
  doc.text("OFFICIAL FRANCHISE SQUADS & PURSE EXPENDITURE AUDIT REPORT", margin + 8, currentY + 17);

  // Metadata / Timestamp on right side
  doc.setFontSize(7.5);
  doc.setTextColor(170, 195, 180);
  doc.text(`EXTRACTED: ${timestampStr}`, pageWidth - margin - 6, currentY + 11, { align: 'right' });
  doc.text(`FRANCHISES: ${teams.length} TEAMS  •  STATUS: VERIFIED`, pageWidth - margin - 6, currentY + 18, { align: 'right' });

  currentY += 34;

  // ----------------------------------------------------
  // 2. EXECUTIVE KPI SUMMARY METRICS (4 Metric Cards)
  // ----------------------------------------------------
  const cardWidth = (contentWidth - 9) / 4;
  const cardHeight = 18;

  const kpis = [
    {
      label: 'TOTAL PURSE POOL',
      value: formatCurrency(totalPurseAllocated),
      subtext: `${teams.length} Franchises`,
      borderColor: [46, 125, 75]
    },
    {
      label: 'TOTAL PURSE SPENT',
      value: formatCurrency(totalPurseSpent),
      subtext: `${((totalPurseSpent / (totalPurseAllocated || 1)) * 100).toFixed(1)}% Pool Utilized`,
      borderColor: [212, 175, 55] // Gold
    },
    {
      label: 'PLAYERS ACQUIRED',
      value: `${totalPlayersSold}`,
      subtext: `${totalOverseasSold} Overseas Players`,
      borderColor: [56, 189, 248] // Sky Blue
    },
    {
      label: 'REMAINING BUDGET',
      value: formatCurrency(totalPurseRemaining),
      subtext: `${unsoldPlayers.length} Unsold / Reserve`,
      borderColor: [57, 255, 136] // Emerald
    }
  ];

  kpis.forEach((kpi, idx) => {
    const x = margin + idx * (cardWidth + 3);
    doc.setFillColor(248, 250, 248);
    doc.roundedRect(x, currentY, cardWidth, cardHeight, 2, 2, 'F');
    doc.setDrawColor(...kpi.borderColor);
    doc.setLineWidth(0.6);
    doc.roundedRect(x, currentY, cardWidth, cardHeight, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 105);
    doc.text(kpi.label, x + 3.5, currentY + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(10, 35, 20);
    doc.text(kpi.value, x + 3.5, currentY + 10.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(110, 125, 115);
    doc.text(kpi.subtext, x + 3.5, currentY + 15);
  });

  currentY += cardHeight + 8;

  // ----------------------------------------------------
  // 3. MASTER FRANCHISE COMPARISON LEADERBOARD TABLE
  // ----------------------------------------------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(4, 30, 16);
  doc.text("1. FRANCHISE FINANCIAL & ROSTER SUMMARY", margin, currentY);
  currentY += 3;

  const masterTableRows = teams.map((team, idx) => {
    const purseSpent = +((team.purseTotal || 80.0) - (team.purseRemaining ?? (team.purseTotal || 80.0))).toFixed(2);
    const topBuy = team.acquiredPlayers && team.acquiredPlayers.length > 0
      ? [...team.acquiredPlayers].sort((a, b) => (b.price || b.bidAmount || 0) - (a.price || a.bidAmount || 0))[0]
      : null;

    const topBuyText = topBuy 
      ? `${topBuy.name} (${formatCurrency(topBuy.price || topBuy.bidAmount)})`
      : 'None';

    const squadMax = team.squadMax || team.maxSlots || 16;
    const squadDisplay = `${team.squadCount || team.acquiredPlayers?.length || 0} / ${squadMax}`;
    const overseasMax = team.overseasMax || team.overseasLimit || 8;
    const overseasDisplay = `${team.overseasCount || 0} / ${overseasMax}`;

    return [
      idx + 1,
      `${team.code} - ${team.name}`,
      formatCurrency(team.purseTotal || 80.0),
      formatCurrency(purseSpent),
      formatCurrency(team.purseRemaining ?? (team.purseTotal || 80.0)),
      squadDisplay,
      overseasDisplay,
      topBuyText
    ];
  });

  // Footer totals row
  const masterTableFooter = [
    [
      '',
      'TOTALS / AGGREGATE',
      formatCurrency(totalPurseAllocated),
      formatCurrency(totalPurseSpent),
      formatCurrency(totalPurseRemaining),
      `${totalPlayersSold} Players`,
      `${totalOverseasSold} Overseas`,
      ''
    ]
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['#', 'Franchise', 'Purse Total', 'Purse Spent', 'Purse Left', 'Squad', 'Overseas', 'Top Purchase']],
    body: masterTableRows,
    foot: masterTableFooter,
    theme: 'grid',
    headStyles: {
      fillColor: [6, 45, 23],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      cellPadding: 2.2,
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 7.2,
      cellPadding: 2,
      textColor: [20, 25, 20]
    },
    alternateRowStyles: {
      fillColor: [247, 250, 248]
    },
    footStyles: {
      fillColor: [230, 240, 234],
      textColor: [4, 30, 16],
      fontStyle: 'bold',
      fontSize: 7.5,
      cellPadding: 2.2
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 44, fontStyle: 'bold' },
      2: { cellWidth: 20, halign: 'right' },
      3: { cellWidth: 20, halign: 'right' },
      4: { cellWidth: 20, halign: 'right' },
      5: { cellWidth: 16, halign: 'center' },
      6: { cellWidth: 16, halign: 'center' },
      7: { cellWidth: 38 }
    }
  });

  currentY = doc.lastAutoTable.finalY + 10;

  // ----------------------------------------------------
  // 4. TEAM-BY-TEAM COMPREHENSIVE SQUAD & PLAYERS
  // ----------------------------------------------------
  teams.forEach((team, teamIndex) => {
    // If less than 50mm left on current page, add new page for clean presentation
    if (currentY > pageHeight - 55) {
      doc.addPage();
      currentY = 18;
    }

    const purseSpent = +((team.purseTotal || 80.0) - (team.purseRemaining ?? (team.purseTotal || 80.0))).toFixed(2);
    const squadMax = team.squadMax || team.maxSlots || 16;
    const squadCount = team.squadCount || team.acquiredPlayers?.length || 0;
    const overseasMax = team.overseasMax || team.overseasLimit || 8;
    const overseasCount = team.overseasCount || 0;

    // Team Header Block
    doc.setFillColor(242, 248, 244);
    doc.roundedRect(margin, currentY, contentWidth, 14, 2, 2, 'F');
    doc.setDrawColor(30, 120, 60);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, currentY, contentWidth, 14, 2, 2, 'S');

    // Color accent tab
    const primaryColorHex = team.primaryColor || '#00a83b';
    doc.setFillColor(primaryColorHex);
    doc.roundedRect(margin, currentY, 3, 14, 1.5, 1.5, 'F');

    // Team Name & Code
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(4, 30, 16);
    doc.text(`${team.name} (${team.code})`, margin + 6, currentY + 5.5);

    // Team Financial Telemetry subtext
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(60, 80, 70);
    const telemetryLine = `Total Purse: ${formatCurrency(team.purseTotal || 80.0)}  |  Spent: ${formatCurrency(purseSpent)}  |  Remaining: ${formatCurrency(team.purseRemaining ?? (team.purseTotal || 80.0))}  |  Squad: ${squadCount}/${squadMax}  |  Overseas: ${overseasCount}/${overseasMax}`;
    doc.text(telemetryLine, margin + 6, currentY + 10.5);

    // Role Distribution Badge on the right
    const roles = team.squadRoleCounts || {};
    const rolesText = `BAT: ${roles.Batsman || 0}  BOWL: ${roles.Bowler || 0}  AR: ${roles['All-Rounder'] || 0}  WK: ${roles.Wicketkeeper || 0}`;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(20, 80, 45);
    doc.text(rolesText, pageWidth - margin - 4, currentY + 8, { align: 'right' });

    currentY += 16;

    // Resolve Acquired Players for this Team
    // Check both team.acquiredPlayers and players array where soldTo matches
    let acquiredList = Array.isArray(team.acquiredPlayers) ? [...team.acquiredPlayers] : [];

    // Also cross-reference with players array to ensure no sold player is missed
    players.forEach((p) => {
      const isSoldToTeam = p.soldToTeamId === team.id || 
                           p.soldTo === team.name || 
                           p.soldTo === team.code;
      if (isSoldToTeam && !acquiredList.some((ap) => ap.id === p.id)) {
        acquiredList.push({
          id: p.id,
          name: p.name,
          role: p.role,
          country: p.country,
          isOverseas: p.isOverseas,
          price: p.soldPrice || p.currentBid,
          basePrice: p.basePrice,
          set: p.set
        });
      }
    });

    if (acquiredList.length === 0) {
      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [['#', 'Player Name', 'Role', 'Category / Origin', 'Base Price', 'Winning Bid / Sold Price']],
        body: [['—', 'No players acquired yet in this auction.', '—', '—', '—', '—']],
        theme: 'plain',
        headStyles: {
          fillColor: [230, 238, 233],
          textColor: [60, 80, 68],
          fontStyle: 'bold',
          fontSize: 7.2,
          cellPadding: 1.8
        },
        bodyStyles: {
          fontSize: 7.2,
          textColor: [120, 130, 125],
          fontStyle: 'italic',
          cellPadding: 2.5
        }
      });
      currentY = doc.lastAutoTable.finalY + 8;
    } else {
      const playerRows = acquiredList.map((player, pIdx) => {
        // Enrich from canonical players list if needed
        const canonical = players.find((cp) => cp.id === player.id) || {};
        const role = player.role || canonical.role || 'Batsman';
        const isOverseas = player.isOverseas !== undefined ? player.isOverseas : canonical.isOverseas;
        const country = player.country || canonical.country || (isOverseas ? 'Overseas' : 'India');
        const originText = isOverseas ? `Overseas (${country})` : `Domestic (${country})`;
        const basePrice = player.basePrice || canonical.basePrice || 2.0;
        const soldPrice = player.price ?? player.bidAmount ?? canonical.soldPrice ?? basePrice;

        return [
          pIdx + 1,
          player.name || canonical.name || 'Unnamed Player',
          role,
          originText,
          formatCurrency(basePrice),
          formatCurrency(soldPrice)
        ];
      });

      // Subtotal row for this squad
      const squadTotalSpend = acquiredList.reduce((sum, p) => sum + (p.price || p.bidAmount || 0), 0);
      const playerFoot = [
        [
          '',
          `Total Squad Roster: ${acquiredList.length} Players`,
          '',
          '',
          'Total Invested:',
          formatCurrency(squadTotalSpend)
        ]
      ];

      autoTable(doc, {
        startY: currentY,
        margin: { left: margin, right: margin },
        head: [['#', 'Player Name', 'Role', 'Category / Origin', 'Base Price', 'Sold Price']],
        body: playerRows,
        foot: playerFoot,
        theme: 'grid',
        headStyles: {
          fillColor: [30, 65, 45],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 7.2,
          cellPadding: 1.8
        },
        bodyStyles: {
          fontSize: 7.2,
          cellPadding: 1.8,
          textColor: [20, 25, 20]
        },
        alternateRowStyles: {
          fillColor: [250, 252, 250]
        },
        footStyles: {
          fillColor: [240, 246, 242],
          textColor: [4, 30, 16],
          fontStyle: 'bold',
          fontSize: 7.2,
          cellPadding: 2
        },
        columnStyles: {
          0: { cellWidth: 8, halign: 'center' },
          1: { cellWidth: 54, fontStyle: 'bold' },
          2: { cellWidth: 32 },
          3: { cellWidth: 36 },
          4: { cellWidth: 24, halign: 'right' },
          5: { cellWidth: 28, halign: 'right', fontStyle: 'bold' }
        }
      });

      currentY = doc.lastAutoTable.finalY + 8;
    }
  });

  // ----------------------------------------------------
  // 5. OPTIONAL APPENDIX: UNSOLD PLAYERS LIST
  // ----------------------------------------------------
  if (unsoldPlayers.length > 0) {
    if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = 18;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(150, 40, 40);
    doc.text(`APPENDIX: UNSOLD / RESERVE PLAYERS POOL (${unsoldPlayers.length} PLAYERS)`, margin, currentY);
    currentY += 3;

    const unsoldRows = unsoldPlayers.map((player, idx) => [
      idx + 1,
      player.name,
      player.role || 'Batsman',
      player.country || (player.isOverseas ? 'Overseas' : 'India'),
      formatCurrency(player.basePrice || 2.0),
      player.set || 'Reserve Pool'
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['#', 'Player Name', 'Role', 'Country', 'Base Price', 'Set / Category']],
      body: unsoldRows,
      theme: 'grid',
      headStyles: {
        fillColor: [120, 35, 35],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.2,
        cellPadding: 1.8
      },
      bodyStyles: {
        fontSize: 7.0,
        cellPadding: 1.6,
        textColor: [40, 20, 20]
      },
      alternateRowStyles: {
        fillColor: [254, 248, 248]
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 54, fontStyle: 'bold' },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 24, halign: 'right' },
        5: { cellWidth: 36 }
      }
    });

    currentY = doc.lastAutoTable.finalY + 8;
  }

  // ----------------------------------------------------
  // 6. RUNNING HEADERS & FOOTERS (All Pages)
  // ----------------------------------------------------
  const totalPages = doc.internal.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Running Header (pages 2 and above)
    if (i > 1) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 115, 105);
      doc.text("ELOQUENCE '26 DOOMSDAY AUCTION • SQUAD & PURSE TELEMETRY AUDIT", margin, 10);
      doc.text(`EXTRACTED: ${timestampStr}`, pageWidth - margin, 10, { align: 'right' });
      doc.setDrawColor(210, 225, 215);
      doc.setLineWidth(0.2);
      doc.line(margin, 12, pageWidth - margin, 12);
    }

    // Running Footer (every page)
    const footerY = pageHeight - 8;
    doc.setDrawColor(210, 225, 215);
    doc.setLineWidth(0.2);
    doc.line(margin, footerY - 3, pageWidth - margin, footerY - 3);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(120, 135, 125);
    doc.text("Official Document • Generated by Eloquence Auction Engine • All values in INR Crores (₹ Cr)", margin, footerY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(50, 70, 60);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, footerY, { align: 'right' });
  }

  // ----------------------------------------------------
  // 7. DOWNLOAD PDF FILE
  // ----------------------------------------------------
  const safeDateStr = currentDate.toISOString().slice(0, 10);
  const safeTimeStr = currentDate.toTimeString().slice(0, 5).replace(':', '');
  const fileName = `Eloquence26_Auction_Summary_${safeDateStr}_${safeTimeStr}.pdf`;

  if (typeof window !== 'undefined' && doc.save) {
    doc.save(fileName);
  }
  return { success: true, fileName, totalPages, doc };
}

/**
 * Generate and download an executive PDF of all players categorized by set.
 */
export function generatePlayersCataloguePdf({ sets = [], players = [] }) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;

  const formatCurrency = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '₹ 0.00 Cr';
    return `₹ ${Number(val).toFixed(2)} Cr`;
  };

  const currentDate = new Date();
  const timestampStr = currentDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }) + ' • ' + currentDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const totalPlayers = players.length;
  const totalCapped = players.filter(p => !p.set.toLowerCase().includes('uncapped')).length;
  const totalUncapped = players.filter(p => p.set.toLowerCase().includes('uncapped')).length;
  const totalOverseas = players.filter(p => p.isOverseas).length;
  const totalDomestic = totalPlayers - totalOverseas;
  const totalBaseVal = players.reduce((sum, p) => sum + (p.basePrice || 0), 0);

  let currentY = 12;

  // Banner Header
  doc.setFillColor(3, 22, 12);
  doc.roundedRect(margin, currentY, contentWidth, 26, 2.5, 2.5, 'F');
  doc.setFillColor(57, 255, 136);
  doc.rect(margin, currentY, 3, 26, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text("ELOQUENCE '26 — OFFICIAL PLAYER CATALOGUE", margin + 7, currentY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(57, 255, 136);
  doc.text("COMPREHENSIVE MASTER ROSTER BY CATEGORY & DISCIPLINE", margin + 7, currentY + 16);

  doc.setFontSize(7.5);
  doc.setTextColor(180, 205, 190);
  doc.text(`CATALOGUE EXTRACTED: ${timestampStr}`, pageWidth - margin - 5, currentY + 10, { align: 'right' });
  doc.text(`TOTAL POOL: ${totalPlayers} PLAYERS • 10 ACTIVE SETS`, pageWidth - margin - 5, currentY + 17, { align: 'right' });

  currentY += 30;

  // KPI Cards
  const kpiCount = 5;
  const kpiGap = 2.5;
  const kpiWidth = (contentWidth - kpiGap * (kpiCount - 1)) / kpiCount;
  const kpiHeight = 15;

  const kpis = [
    { label: 'TOTAL PLAYERS', value: `${totalPlayers}`, sub: 'Full Auction Pool', color: [46, 125, 75] },
    { label: 'CAPPED STARS', value: `${totalCapped}`, sub: 'Sets 1 to 7', color: [56, 189, 248] },
    { label: 'UNCAPPED TALENTS', value: `${totalUncapped}`, sub: 'Sets 8 to 10', color: [245, 158, 11] },
    { label: 'OVERSEAS / DOM', value: `${totalOverseas} / ${totalDomestic}`, sub: `${((totalOverseas/totalPlayers)*100).toFixed(0)}% Overseas`, color: [168, 85, 247] },
    { label: 'TOTAL BASE VALUE', value: formatCurrency(totalBaseVal), sub: 'Opening Pool Worth', color: [57, 255, 136] }
  ];

  kpis.forEach((k, idx) => {
    const x = margin + idx * (kpiWidth + kpiGap);
    doc.setFillColor(248, 251, 249);
    doc.roundedRect(x, currentY, kpiWidth, kpiHeight, 1.5, 1.5, 'F');
    doc.setDrawColor(...k.color);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, currentY, kpiWidth, kpiHeight, 1.5, 1.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.setTextColor(90, 105, 95);
    doc.text(k.label, x + 2.5, currentY + 4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(5, 30, 15);
    doc.text(k.value, x + 2.5, currentY + 9.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(115, 130, 120);
    doc.text(k.sub, x + 2.5, currentY + 13);
  });

  currentY += kpiHeight + 6;

  const activeSets = sets.filter(set => (set.count || set.totalPlayers) > 0);
  const setColors = {
    1: { header: [12, 45, 25], accent: [57, 255, 136] },
    2: { header: [45, 25, 15], accent: [249, 115, 22] },
    3: { header: [15, 35, 45], accent: [14, 165, 233] },
    4: { header: [45, 35, 10], accent: [234, 179, 8] },
    5: { header: [25, 15, 45], accent: [168, 85, 247] },
    6: { header: [12, 45, 35], accent: [45, 212, 191] },
    7: { header: [45, 20, 25], accent: [244, 63, 94] },
    8: { header: [20, 40, 20], accent: [132, 204, 22] },
    9: { header: [35, 25, 40], accent: [217, 70, 239] },
    10: { header: [20, 35, 45], accent: [6, 182, 212] }
  };

  activeSets.forEach((set) => {
    const setNum = set.id || set.setNumber;
    const playersInSet = players.filter(p => p.setNumber === setNum);
    if (playersInSet.length === 0) return;

    if (currentY > pageHeight - 45) {
      doc.addPage();
      currentY = 16;
    }

    const setConfig = setColors[setNum] || { header: [20, 30, 25], accent: [57, 255, 136] };
    const setBaseTotal = playersInSet.reduce((acc, p) => acc + (p.basePrice || 0), 0);
    const overseasCount = playersInSet.filter(p => p.isOverseas).length;

    doc.setFillColor(setConfig.header[0], setConfig.header[1], setConfig.header[2]);
    doc.roundedRect(margin, currentY, contentWidth, 10, 1.8, 1.8, 'F');
    doc.setFillColor(setConfig.accent[0], setConfig.accent[1], setConfig.accent[2]);
    doc.rect(margin, currentY, 2.5, 10, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(set.name.toUpperCase(), margin + 5, currentY + 6.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(setConfig.accent[0], setConfig.accent[1], setConfig.accent[2]);
    const summaryText = `${playersInSet.length} PLAYERS  •  ${overseasCount} OVERSEAS  •  BASE TOTAL: ${formatCurrency(setBaseTotal)}`;
    doc.text(summaryText, pageWidth - margin - 4, currentY + 6.5, { align: 'right' });

    currentY += 12;

    const rows = playersInSet.map((player, pIdx) => {
      const originStr = player.isOverseas 
        ? `Overseas (${player.country || 'INT'})` 
        : `Domestic (${player.country || 'India'})`;

      return [
        pIdx + 1,
        player.name,
        player.role,
        player.subRole || player.role,
        originStr,
        formatCurrency(player.basePrice)
      ];
    });

    const footRows = [
      [
        '',
        `Category Summary: ${playersInSet.length} Players`,
        '',
        '',
        'Total Category Base:',
        formatCurrency(setBaseTotal)
      ]
    ];

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['#', 'Player Name', 'Role', 'Discipline / Sub-Role', 'Category / Origin', 'Base Price']],
      body: rows,
      foot: footRows,
      theme: 'grid',
      headStyles: {
        fillColor: [24, 38, 30],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.2,
        cellPadding: 1.8,
        halign: 'left'
      },
      bodyStyles: {
        fontSize: 7.0,
        cellPadding: 1.6,
        textColor: [18, 22, 18]
      },
      alternateRowStyles: {
        fillColor: [250, 252, 250]
      },
      footStyles: {
        fillColor: [238, 245, 240],
        textColor: [4, 30, 16],
        fontStyle: 'bold',
        fontSize: 7.0,
        cellPadding: 1.8
      },
      columnStyles: {
        0: { cellWidth: 7, halign: 'center' },
        1: { cellWidth: 52, fontStyle: 'bold' },
        2: { cellWidth: 26 },
        3: { cellWidth: 40 },
        4: { cellWidth: 35 },
        5: { cellWidth: 26, halign: 'right', fontStyle: 'bold' }
      }
    });

    currentY = doc.lastAutoTable.finalY + 7;
  });

  const totalPages = doc.internal.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    if (i > 1) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.setTextColor(95, 110, 100);
      doc.text("ELOQUENCE '26 OFFICIAL PLAYER AUCTION POOL CATALOGUE • BY CATEGORY", margin, 9);
      doc.text(`EXTRACTED: ${timestampStr}`, pageWidth - margin, 9, { align: 'right' });
      doc.setDrawColor(210, 225, 215);
      doc.setLineWidth(0.2);
      doc.line(margin, 11, pageWidth - margin, 11);
    }

    const footerY = pageHeight - 7;
    doc.setDrawColor(210, 225, 215);
    doc.setLineWidth(0.2);
    doc.line(margin, footerY - 2.5, pageWidth - margin, footerY - 2.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(115, 130, 120);
    doc.text("Eloquence '26 Player Pool Catalogue • Official Publication • All base prices in INR Crores (₹ Cr)", margin, footerY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.0);
    doc.setTextColor(40, 60, 50);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, footerY, { align: 'right' });
  }

  const fileName = `Eloquence26_Complete_Players_Catalogue.pdf`;
  if (typeof window !== 'undefined' && doc.save) {
    doc.save(fileName);
  }
  return { success: true, fileName, totalPages, doc };
}
