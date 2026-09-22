const https = require('https');
const fs = require('fs');

const missing13 = [
  'Tabraiz Shamsi Rajasthan Royals ipl',
  'Daryl Mitchell CSK ipl jersey',
  'Gerald Coetzee Mumbai Indians ipl jersey',
  'Mohit Sharma Gujarat Titans ipl jersey',
  'Alzarri Joseph RCB ipl jersey',
  'Jimmy Neesham Rajasthan Royals ipl',
  'Nathan Ellis Punjab Kings ipl jersey',
  'Akash Madhwal Mumbai Indians ipl',
  'Digvesh Rathi cricketer',
  'N Jagadeesan KKR ipl',
  'Baba Indrajith KKR ipl',
  'Aryan Juyal Mumbai Indians',
  'Akeal Hosein Sunrisers Hyderabad ipl'
];

function searchBing(q) {
  return new Promise(resolve => {
    const url = 'https://www.bing.com/images/search?q=' + encodeURIComponent('site:i.pinimg.com ' + q) + '&first=1';
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        const regex = /murl&quot;:&quot;(https?:\/\/[^&]*pinimg\.com[^&]+)&quot;/g;
        let m;
        const urls = [];
        while ((m = regex.exec(d)) !== null) {
          urls.push(m[1]);
        }
        resolve(urls);
      });
    }).on('error', () => resolve([]));
  });
}

async function run() {
  for (const q of missing13) {
    const urls = await searchBing(q);
    console.log(q, '->', urls.slice(0, 2));
  }
}

run();
