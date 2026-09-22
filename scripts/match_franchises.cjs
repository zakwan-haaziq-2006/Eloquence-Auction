const fs = require('fs');

const content = fs.readFileSync('src/data/auctionData.js', 'utf8');
const franchiseData = JSON.parse(fs.readFileSync('scripts/all_franchise_players.json', 'utf8'));

const playerRegex = /{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)'([\s\S]*?)}/g;
let m;
const svgs = [];
while ((m = playerRegex.exec(content)) !== null) {
  if (m[1].startsWith('set')) {
    const photo = (m[3].match(/photoUrl:\s*'([^']+)'/) || [])[1] || '';
    if (photo.endsWith('.svg')) {
      svgs.push({ id: m[1], name: m[2] });
    }
  }
}

console.log(`Checking ${svgs.length} SVG players against 183 franchise players:`);
const matched = [];
const missing = [];

const franchiseKeys = Object.keys(franchiseData);

for (const p of svgs) {
  const pNorm = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  let found = null;

  for (const k of franchiseKeys) {
    const kNorm = k.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (kNorm === pNorm || (kNorm.length > 5 && pNorm.includes(kNorm)) || (pNorm.length > 5 && kNorm.includes(pNorm))) {
      found = franchiseData[k];
      break;
    }
  }

  if (found) {
    matched.push({ player: p.name, franchise: found.name, team: found.team, url: found.url });
  } else {
    missing.push(p.name);
  }
}

console.log(`Matched: ${matched.length} / ${svgs.length}`);
matched.forEach(m => console.log(`  ${m.player} (${m.team}) -> ${m.url}`));
console.log(`Missing (${missing.length}):`, missing);
