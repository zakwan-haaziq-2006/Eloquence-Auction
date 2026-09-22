const fs = require('fs');

const svgs = [
  'Anrich Nortje', 'Avesh Khan', 'Shardul Thakur', 'Matheesha Pathirana', 'Glenn Phillips',
  'Rahmanullah Gurbaz', 'Varun Chakravarthy', 'Noor Ahmad', 'Rahul Chahar', 'Maheesh Theekshana',
  'Tabraiz Shamsi', 'Mitchell Santner', 'Akeal Hosein', 'Tristan Stubbs', 'Daryl Mitchell',
  'Finn Allen', 'Sai Sudharsan', 'Gerald Coetzee', 'Sandeep Sharma', 'Mohit Sharma',
  'Alzarri Joseph', 'Jimmy Neesham', 'Spencer Johnson', 'Prasidh Krishna', 'Nathan Ellis',
  'Nuwan Thushara', 'Rajat Patidar', 'Shubham Dubey', 'Mayank Yadav', 'Harshit Rana',
  'Yash Dayal', 'Mukesh Kumar', 'Vaibhav Arora', 'Akash Madhwal', 'Yash Thakur',
  'Shivam Mavi', 'Kuldeep Sen', 'Naveen-ul-Haq', 'Mohsin Khan', 'Ravi Bishnoi',
  'Digvesh Rathi', 'Vipraj Nigam', 'Mayank Markande', 'Aniket Verma', 'Vishnu Vinod',
  'N Jagadeesan', 'Baba Indrajith', 'Urvil Patel', 'Aryan Juyal', 'Kumar Kushagra'
];

const idMap = JSON.parse(fs.readFileSync('scripts/sportz_player_ids.json', 'utf8'));

const matched = {};
const missing = [];

const keys = Object.keys(idMap);

for (const p of svgs) {
  const pNorm = p.toLowerCase().replace(/[^a-z0-9]/g, '');
  let foundKey = null;
  for (const k of keys) {
    const kNorm = k.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (kNorm === pNorm || (pNorm.length > 5 && kNorm.includes(pNorm)) || (kNorm.length > 5 && pNorm.includes(kNorm))) {
      foundKey = k;
      break;
    }
  }

  if (!foundKey) {
    const parts = p.toLowerCase().split(' ');
    for (const k of keys) {
      const kLower = k.toLowerCase();
      if (parts.length > 1 && parts.every(part => kLower.includes(part))) {
        foundKey = k;
        break;
      }
    }
  }

  if (foundKey) {
    matched[p] = { nameInMap: foundKey, id: idMap[foundKey] };
  } else {
    missing.push(p);
  }
}

console.log(`Matched ${Object.keys(matched).length} / ${svgs.length} players!`);
console.log('Matches:');
for (const p in matched) {
  console.log(`  ${p} -> id: ${matched[p].id} (name: ${matched[p].nameInMap})`);
}

console.log(`\nMissing (${missing.length}):`, missing);
fs.writeFileSync('scripts/target_player_ids.json', JSON.stringify({ matched, missing }, null, 2));
