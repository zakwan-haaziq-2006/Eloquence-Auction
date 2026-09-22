const fs = require('fs');
const path = require('path');
const https = require('https');

// Helper to fetch thumbnail from Wikipedia
function fetchWikiThumb(title) {
  return new Promise(resolve => {
    const url = 'https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(title.replace(/ /g, '_'));
    const req = https.get(url, { headers: { 'User-Agent': 'EloquenceAuctionApp/1.0 (contact@eloquence.online)' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(data);
          if (j.thumbnail && j.thumbnail.source) {
            return resolve(j.thumbnail.source);
          }
        } catch(e) {}
        resolve(null);
      });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(8000, () => {
      req.destroy();
      resolve(null);
    });
  });
}

// Helper to download image to file
function downloadImage(url, destPath) {
  return new Promise(resolve => {
    const req = https.get(url, { headers: { 'User-Agent': 'EloquenceAuctionApp/1.0 (contact@eloquence.online)' } }, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location, destPath).then(resolve);
      }
      if (res.statusCode !== 200) {
        return resolve(false);
      }
      const file = fs.createWriteStream(destPath);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(true);
      });
    });
    req.on('error', () => resolve(false));
    req.setTimeout(10000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Generate stylized SVG avatar for players without a photo
function generateCyberAvatar(name, role, country) {
  const initials = name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  const roleColors = {
    Batsman: { primary: '#38bdf8', secondary: '#0284c7', label: 'BAT' },
    Bowler: { primary: '#ef4444', secondary: '#b91c1c', label: 'BOWL' },
    'All-Rounder': { primary: '#39ff88', secondary: '#00a83b', label: 'AR' },
    Wicketkeeper: { primary: '#f59e0b', secondary: '#d97706', label: 'WK' }
  };
  const theme = roleColors[role] || { primary: '#39ff88', secondary: '#00a83b', label: 'CRIC' };

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#051c0f" />
      <stop offset="50%" stop-color="#020a05" />
      <stop offset="100%" stop-color="#010503" />
    </linearGradient>
    <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.primary}" stop-opacity="0.8" />
      <stop offset="100%" stop-color="${theme.secondary}" stop-opacity="0.2" />
    </linearGradient>
    <radialGradient id="halo" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="${theme.primary}" stop-opacity="0.3" />
      <stop offset="100%" stop-color="${theme.primary}" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="200" height="200" rx="28" fill="url(#bgGrad)" />
  <rect width="196" height="196" x="2" y="2" rx="26" fill="none" stroke="url(#glowGrad)" stroke-width="2.5" />
  <circle cx="100" cy="85" r="70" fill="url(#halo)" />

  <!-- Hexagon Badge Frame -->
  <polygon points="100,25 150,54 150,112 100,141 50,112 50,54" fill="rgba(255,255,255,0.03)" stroke="${theme.primary}" stroke-width="2" stroke-dasharray="4 2" />

  <!-- Player Silhouette / Insignia -->
  <circle cx="100" cy="72" r="28" fill="${theme.primary}" fill-opacity="0.18" stroke="${theme.primary}" stroke-width="2" />
  
  <!-- Player Initials -->
  <text x="100" y="82" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="26" fill="#ffffff" text-anchor="middle" letter-spacing="1">
    ${initials}
  </text>

  <!-- Bottom Role Badge -->
  <rect x="35" y="148" width="130" height="28" rx="8" fill="rgba(2, 12, 6, 0.95)" stroke="${theme.primary}" stroke-width="1.5" />
  <text x="100" y="167" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="12" fill="${theme.primary}" text-anchor="middle" letter-spacing="2">
    ${theme.label} • ${country ? country.toUpperCase() : 'PRO'}
  </text>
</svg>`;
}

async function main() {
  const auctionDataPath = path.join(__dirname, '..', 'src', 'data', 'auctionData.js');
  const playersDir = path.join(__dirname, '..', 'public', 'players');
  let content = fs.readFileSync(auctionDataPath, 'utf8');

  // Extract all player objects from INITIAL_PLAYERS
  const playerRegex = /{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)'([\s\S]*?)}/g;
  let match;
  const players = [];

  while ((match = playerRegex.exec(content)) !== null) {
    if (match[1].startsWith('set')) {
      const fullMatch = match[0];
      const id = match[1];
      const name = match[2];
      const rest = match[3];
      const hasPhoto = rest.includes('photoUrl:');
      let currentPhoto = '';
      if (hasPhoto) {
        const pm = rest.match(/photoUrl:\s*'([^']+)'/);
        currentPhoto = pm ? pm[1] : '';
      }
      const roleMatch = rest.match(/role:\s*'([^']+)'/);
      const countryMatch = rest.match(/country:\s*'([^']+)'/);

      players.push({
        fullMatch,
        id,
        name,
        hasPhoto,
        currentPhoto,
        role: roleMatch ? roleMatch[1] : 'Batsman',
        country: countryMatch ? countryMatch[1] : 'India'
      });
    }
  }

  console.log(`Found ${players.length} players in INITIAL_PLAYERS.`);
  const missingPlayers = players.filter(p => !p.hasPhoto);
  console.log(`${missingPlayers.length} players missing photoUrl.`);

  let updatedContent = content;

  // Process missing players in batches of 5
  for (let i = 0; i < missingPlayers.length; i += 5) {
    const chunk = missingPlayers.slice(i, i + 5);
    await Promise.all(chunk.map(async (player) => {
      const cleanFileName = player.name.replace(/[^a-zA-Z0-9_-]/g, '_');
      const jpgFileName = `${cleanFileName}.jpg`;
      const jpgFilePath = path.join(playersDir, jpgFileName);
      const svgFileName = `${cleanFileName}.svg`;
      const svgFilePath = path.join(playersDir, svgFileName);

      let assignedPhotoUrl = '';

      // 1. Check if an image file already exists locally for this player
      if (fs.existsSync(jpgFilePath)) {
        assignedPhotoUrl = `/players/${jpgFileName}`;
      } else {
        // 2. Fetch thumbnail from Wikipedia
        let thumbUrl = await fetchWikiThumb(player.name);
        if (!thumbUrl) {
          thumbUrl = await fetchWikiThumb(player.name + ' (cricketer)');
        }

        if (thumbUrl) {
          const ok = await downloadImage(thumbUrl, jpgFilePath);
          if (ok) {
            assignedPhotoUrl = `/players/${jpgFileName}`;
            console.log(`[DOWNLOADED] ${player.name} -> ${jpgFileName}`);
          }
        }

        // 3. Fallback to stylized Cyber SVG Avatar
        if (!assignedPhotoUrl) {
          const svgCode = generateCyberAvatar(player.name, player.role, player.country);
          fs.writeFileSync(svgFilePath, svgCode, 'utf8');
          assignedPhotoUrl = `/players/${svgFileName}`;
          console.log(`[SVG AVATAR] ${player.name} -> ${svgFileName}`);
        }
      }

      // Update in updatedContent
      // Target: add photoUrl: '...' before set:
      const targetStr = `id: '${player.id}', name: '${player.name}'`;
      const playerLineRegex = new RegExp(`({\\s*id:\\s*'${player.id}',\\s*name:\\s*'${player.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'[\\s\\S]*?)(set:\\s*'[^']+',\\s*setNumber:\\s*\\d+\\s*})`);
      
      if (playerLineRegex.test(updatedContent)) {
        updatedContent = updatedContent.replace(playerLineRegex, `$1photoUrl: '${assignedPhotoUrl}', $2`);
      }
    }));
  }

  fs.writeFileSync(auctionDataPath, updatedContent, 'utf8');
  console.log('Finished updating auctionData.js! 100% of players now have images.');
}

main().catch(console.error);
