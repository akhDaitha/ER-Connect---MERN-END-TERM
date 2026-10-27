const crypto = require('crypto');

const key = crypto.randomBytes(32).toString('hex');
console.log('Generated 32-byte CHAT_KEY (hex):');
console.log(key);
console.log('\nCopy and paste this into your server/.env:');
console.log(`CHAT_KEY=${key}`);
