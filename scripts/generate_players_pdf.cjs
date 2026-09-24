const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');
const autoTable = require('jspdf-autotable').default || require('jspdf-autotable');

// Load auction data
const { AUCTION_SETS, INITIAL_PLAYERS } = require('../src/data/auctionData.js');

function formatCurrency(val) {
  if (val === undefined || val === null || isNaN(val)) return '₹ 0.00 Cr';
  return `₹ ${Number(val).toFixed(2)} Cr`;
}

function generatePlayersPdf() {
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

  // Calculate high-level stats
  const totalPlayers = INITIAL_PLAYERS.length;
  const totalCapped = INITIAL_PLAYERS.filter(p => !p.set.toLowerCase().includes('uncapped')).length;
  const totalUncapped = INITIAL_PLAYERS.filter(p => p.set.toLowerCase().includes('uncapped')).length;
  const totalOverseas = INITIAL_PLAYERS.filter(p => p.isOverseas).length;
  const totalDomestic = totalPlayers - totalOverseas;
  const totalBaseVal = INITIAL_PLAYERS.reduce((sum, p) => sum + (p.basePrice || 0), 0);

  let currentY = 12;

  // ==========================================
  // COVER / BANNER HEADER
  // ==========================================
  doc.setFillColor(3, 22, 12); // Deep rich emerald black
  doc.roundedRect(margin, currentY, contentWidth, 26, 2.5, 2.5, 'F');

  // Accent bar
  doc.setFillColor(57, 255, 136); // #39ff88 neon green
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

  // ==========================================
  // MACRO KPI STATS (5 Compact Cards)
  // ==========================================
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

  // Filter sets to only those with players
  const activeSets = AUCTION_SETS.filter(set => set.count > 0);

  // Set-specific color palettes
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

  // Iterate over each set
  activeSets.forEach((set) => {
    const setNum = set.id;
    const playersInSet = INITIAL_PLAYERS.filter(p => p.setNumber === setNum);
    if (playersInSet.length === 0) return;

    // Check if we need a new page for the next category header
    if (currentY > pageHeight - 45) {
      doc.addPage();
      currentY = 16;
    }

    const setConfig = setColors[setNum] || { header: [20, 30, 25], accent: [57, 255, 136] };
    const setBaseTotal = playersInSet.reduce((acc, p) => acc + (p.basePrice || 0), 0);
    const overseasCount = playersInSet.filter(p => p.isOverseas).length;

    // Category Header Box
    doc.setFillColor(setConfig.header[0], setConfig.header[1], setConfig.header[2]);
    doc.roundedRect(margin, currentY, contentWidth, 10, 1.8, 1.8, 'F');

    // Accent line
    doc.setFillColor(setConfig.accent[0], setConfig.accent[1], setConfig.accent[2]);
    doc.rect(margin, currentY, 2.5, 10, 'F');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(set.name.toUpperCase(), margin + 5, currentY + 6.5);

    // Right subtitle/summary badge
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(setConfig.accent[0], setConfig.accent[1], setConfig.accent[2]);
    const summaryText = `${playersInSet.length} PLAYERS  •  ${overseasCount} OVERSEAS  •  BASE TOTAL: ${formatCurrency(setBaseTotal)}`;
    doc.text(summaryText, pageWidth - margin - 4, currentY + 6.5, { align: 'right' });

    currentY += 12;

    // Build Table Rows
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

  // ==========================================
  // RUNNING HEADERS & FOOTERS (All Pages)
  // ==========================================
  const totalPages = doc.internal.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Running Header (Page 2+)
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

    // Running Footer (All Pages)
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

  // Save to file
  const rootPdfPath = path.resolve('Eloquence26_Complete_Players_Catalogue.pdf');
  const publicPdfPath = path.resolve('public/players_by_set.pdf');

  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  fs.writeFileSync(rootPdfPath, pdfBuffer);
  fs.writeFileSync(publicPdfPath, pdfBuffer);

  console.log(`Generated PDF successfully!`);
  console.log(`- Saved root file: ${rootPdfPath} (${pdfBuffer.length} bytes, ${totalPages} pages)`);
  console.log(`- Saved public file: ${publicPdfPath} (${pdfBuffer.length} bytes)`);
}

generatePlayersPdf();
