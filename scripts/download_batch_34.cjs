const https = require('https');
const fs = require('fs');
const path = require('path');

const targets = {
  'Anrich Nortje': { url: 'https://www.lucknowsupergiants.in/static-assets/images/players/63641.png' },
  'Avesh Khan': { url: 'https://www.lucknowsupergiants.in/static-assets/images/players/64511.png' },
  'Shardul Thakur': { url: 'https://www.lucknowsupergiants.in/static-assets/images/players/63345.png' },
  'Matheesha Pathirana': { url: 'https://www.kkr.in/static-assets/images/players/73830.png' },
  'Glenn Phillips': { url: 'https://www.gujarattitansipl.com/static-assets/images/players/65295.png' },
  'Noor Ahmad': { url: 'https://www.gujarattitansipl.com/static-assets/images/players/71411.png' },
  'Rahul Chahar': { url: 'https://www.punjabkingsipl.in/static-assets/images/players/66823.png' },
  'Mitchell Santner': { url: 'https://www.mumbaiindians.com/static-assets/images/players/large/57903.png' },
  'Tristan Stubbs': { url: 'https://www.delhicapitals.in/static-assets/images/players/ipl/74761.png' },
  'Finn Allen': { url: 'https://www.kkr.in/static-assets/images/players/66046.png' },
  'Sai Sudharsan': { url: 'https://www.gujarattitansipl.com/static-assets/images/players/69500.png' },
  'Sandeep Sharma': { url: 'https://www.rajasthanroyals.com/static-assets/images/players/10116.png' },
  'Spencer Johnson': { url: 'https://www.kkr.in/static-assets/images/players/67778.png' },
  'Prasidh Krishna': { url: 'https://www.rajasthanroyals.com/static-assets/images/players/65702.png' },
  'Shubham Dubey': { url: 'https://www.rajasthanroyals.com/static-assets/images/players/83453.png' },
  'Mayank Yadav': { url: 'https://www.lucknowsupergiants.in/static-assets/images/players/90501.png' },
  'Mukesh Kumar': { url: 'https://www.delhicapitals.in/static-assets/images/players/ipl/65723.png' },
  'Vaibhav Arora': { url: 'https://www.kkr.in/static-assets/images/players/74298.png' },
  'Yash Thakur': { url: 'https://www.lucknowsupergiants.in/static-assets/images/players/66819.png' },
  'Kuldeep Sen': { url: 'https://www.rajasthanroyals.com/static-assets/images/players/70402.png' },
  'Mohsin Khan': { url: 'https://www.lucknowsupergiants.in/static-assets/images/players/68182.png' },
  'Ravi Bishnoi': { url: 'https://www.lucknowsupergiants.in/static-assets/images/players/71288.png' },
  'Vipraj Nigam': { url: 'https://www.delhicapitals.in/static-assets/images/players/ipl/88677.png' },
  'Mayank Markande': { url: 'https://www.kkr.in/static-assets/images/players/67126.png' },
  'Vishnu Vinod': { url: 'https://www.punjabkingsipl.in/static-assets/images/players/64783.png' },
  'Urvil Patel': { url: 'https://www.gujarattitansipl.com/static-assets/images/players/68150.png' },
  'Kumar Kushagra': { url: 'https://www.delhicapitals.in/static-assets/images/players/ipl/74097.png' },
  'Rahmanullah Gurbaz': { url: 'https://www.kkr.in/static-assets/images/players/68027.png' },
  'Harshit Rana': { url: 'https://www.kkr.in/static-assets/images/players/93526.png' },
  'Yash Dayal': { url: 'https://www.royalchallengers.com/PRRCB01/public/2025-03/dayal.png' },
  'Nuwan Thushara': { url: 'https://www.royalchallengers.com/PRRCB01/public/2025-03/nuwan.png' },
  'Rajat Patidar': { url: 'https://www.royalchallengers.com/PRRCB01/public/2026-03/rajat.png' },
  'Aniket Verma': { url: 'https://d1zakxcsliwds.cloudfront.net/image-pool/614a2c5b812547e3a729834dac2fb7d1.png', referer: 'https://www.sunrisershyderabad.in/' },
  'Shivam Mavi': { url: 'https://d1zakxcsliwds.cloudfront.net/image-pool/cef85d257c8044fb81fca2bb0aaa30a3.png', referer: 'https://www.sunrisershyderabad.in/' }
};

function download(name, info) {
  return new Promise(resolve => {
    const filename = name.replace(/\s+/g, '_') + '.png';
    const dest = path.join('public', 'players', filename);
    const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' };
    if (info.referer) {
      headers['Referer'] = info.referer;
    }

    const req = https.get(info.url, { headers }, res => {
      if (res.statusCode !== 200) {
        console.error(`[FAIL ${res.statusCode}] ${name} from ${info.url}`);
        return resolve(false);
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          const stats = fs.statSync(dest);
          console.log(`[SUCCESS] ${name} -> ${filename} (${stats.size} bytes)`);
          resolve(true);
        });
      });
    }).on('error', err => {
      console.error(`[ERROR] ${name}:`, err.message);
      resolve(false);
    });
  });
}

async function run() {
  console.log(`Downloading ${Object.keys(targets).length} verified franchise player images...`);
  let ok = 0;
  for (const name in targets) {
    const res = await download(name, targets[name]);
    if (res) ok++;
  }
  console.log(`Downloaded ${ok} / ${Object.keys(targets).length} images successfully!`);
}

run();
