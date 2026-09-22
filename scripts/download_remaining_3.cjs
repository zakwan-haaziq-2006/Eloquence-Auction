const https = require('https');
const fs = require('fs');

const targets = [
  {
    name: 'Akeal Hosein',
    url: 'https://images.mykhel.com/webp/images/cricket/players/0/5680.jpg',
    dest: 'public/players/Akeal_Hosein.jpg'
  },
  {
    name: 'N Jagadeesan',
    url: 'https://images.mykhel.com/webp/images/cricket/players/0/11830.jpg',
    dest: 'public/players/N_Jagadeesan.jpg'
  },
  {
    name: 'Baba Indrajith',
    url: 'https://images.mykhel.com/webp/images/cricket/players/9/10749.jpg',
    dest: 'public/players/Baba_Indrajith.jpg'
  }
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      }
    }, res => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode} for ${url}`));
      }
      const fileStream = fs.createWriteStream(dest);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close(() => resolve());
      });
    }).on('error', reject);
  });
}

(async () => {
  for (const t of targets) {
    try {
      await download(t.url, t.dest);
      const stat = fs.statSync(t.dest);
      console.log(`SUCCESS: ${t.name} -> ${t.dest} (${stat.size} bytes)`);
    } catch (e) {
      console.error(`FAILED: ${t.name}`, e.message);
    }
  }
})();
