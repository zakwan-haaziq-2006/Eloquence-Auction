const fs = require('fs');
const path = require('path');

const auctionDataPath = path.resolve('src/data/auctionData.js');
let content = fs.readFileSync(auctionDataPath, 'utf8');

const publicFiles = fs.readdirSync('public/players');

const playerRegex = /{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)'([\s\S]*?)}/g;
let m;
const updates = [];
const missing = [];

while ((m = playerRegex.exec(content)) !== null) {
  const id = m[1];
  const name = m[2];
  const body = m[3];
  if (id.startsWith('set')) {
    const photoMatch = body.match(/photoUrl:\s*'([^']+)'/);
    if (photoMatch) {
      const oldPhoto = photoMatch[1];
      if (oldPhoto.endsWith('.svg')) {
        const cleanName = name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
        const found = publicFiles.find(f => {
          if (f.endsWith('.svg')) return false;
          const base = f.replace(/\.[^.]+$/, '');
          return base.toLowerCase() === cleanName.toLowerCase();
        });
        if (found) {
          updates.push({
            id,
            name,
            oldPhoto,
            newPhoto: '/players/' + found,
            oldLine: `photoUrl: '${oldPhoto}'`,
            newLine: `photoUrl: '/players/${found}'`
          });
        } else {
          missing.push({ id, name, oldPhoto });
        }
      }
    }
  }
}

console.log('Total SVG players to update:', updates.length);
console.log('Missing matches:', missing.length);

if (missing.length > 0) {
  console.error('Errors found, aborting:', missing);
  process.exit(1);
}

// Perform replacements
let updatedContent = content;
for (const u of updates) {
  if (!updatedContent.includes(u.oldLine)) {
    console.error(`Target line not found for ${u.name}: ${u.oldLine}`);
    process.exit(1);
  }
  updatedContent = updatedContent.replace(u.oldLine, u.newLine);
}

// Write back
fs.writeFileSync(auctionDataPath, updatedContent, 'utf8');
console.log('Successfully updated src/data/auctionData.js!');

// Verification
const verifyContent = fs.readFileSync(auctionDataPath, 'utf8');
const remainingSvgs = (verifyContent.match(/photoUrl:\s*'[^\']+\.svg'/g) || []);
console.log('Remaining SVG photoUrls in auctionData.js:', remainingSvgs.length);

// Verify every player's photo file exists on disk
let allValid = true;
let totalChecked = 0;
let verifyMatch;
const verifyRegex = /{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)'([\s\S]*?)}/g;
while ((verifyMatch = verifyRegex.exec(verifyContent)) !== null) {
  if (verifyMatch[1].startsWith('set')) {
    totalChecked++;
    const photo = (verifyMatch[3].match(/photoUrl:\s*'([^']+)'/) || [])[1];
    const diskPath = path.join('public', photo);
    if (!fs.existsSync(diskPath)) {
      console.error(`MISSING ON DISK: ${verifyMatch[2]} -> ${diskPath}`);
      allValid = false;
    }
  }
}
console.log(`Verified ${totalChecked} players. All exist on disk: ${allValid}`);
