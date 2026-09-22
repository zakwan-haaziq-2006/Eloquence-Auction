const fs = require('fs');

const content = fs.readFileSync('C:/Users/TUF/.gemini/antigravity-ide/brain/600ac570-9e87-4a1d-b2e3-2ae1f4085bf3/.system_generated/steps/530/content.md', 'utf8');
const imgs = content.match(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)/gi) || [];
console.log('Images in step 530:', imgs);
