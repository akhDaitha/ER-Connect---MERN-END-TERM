const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const env = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production',
  CHAT_KEY: process.env.CHAT_KEY,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  ALLOWED_EMAIL_DOMAIN: process.env.ALLOWED_EMAIL_DOMAIN || '@sst.scaler.com',
  MAX_CONCURRENT_CHATS_PER_ER: parseInt(process.env.MAX_CONCURRENT_CHATS_PER_ER || '3', 10),
  NODE_ENV: process.env.NODE_ENV || 'development'
};

module.exports = env;
