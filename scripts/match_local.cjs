const fs = require('fs');

const content = fs.readFileSync('src/data/auctionData.js', 'utf8');
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

const rootFiles = fs.readdirSync('players');
const publicFiles = fs.readdirSync('public/players');

console.log(`Checking ${svgs.length} SVG players against local files:`);
let matches = 0;
for (const p of svgs) {
  const pNorm = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const rMatch = rootFiles.find(f => {
    const fNorm = f.toLowerCase().replace(/\.[^.]+$/, '').replace(/[^a-z0-9]/g, '');
    return fNorm === pNorm || (fNorm.length > 5 && pNorm.includes(fNorm)) || (pNorm.length > 5 && fNorm.includes(pNorm));
  });
  const pubMatch = publicFiles.find(f => {
    if (f.endsWith('.svg')) return false;
    const fNorm = f.toLowerCase().replace(/\.[^.]+$/, '').replace(/[^a-z0-9]/g, '');
    return fNorm === pNorm || (fNorm.length > 5 && pNorm.includes(fNorm)) || (pNorm.length > 5 && fNorm.includes(pNorm));
  });
  if (rMatch || pubMatch) {
    console.log(`${p.name} -> root: ${rMatch || 'none'}, pub: ${pubMatch || 'none'}`);
    matches++;
  }
}
console.log(`Matched ${matches} / ${svgs.length}`);
