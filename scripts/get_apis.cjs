const https = require('https');

https.get('https://www.iplt20.com/_next/static/immutable/chunks/00vcgn01d5yvs.js', { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    // Find all strings containing "teams" or "players" or "squad" followed by /
    const regex = /["'](\/(?:cricket|teams|squad|feed|competition)[^"']+)["']/g;
    const matches = d.match(regex) || [];
    console.log('Matches:', [...new Set(matches)]);
  });
});
