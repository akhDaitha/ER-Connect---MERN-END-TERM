const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  if (!env.MONGO_URI) {
    console.error('CRITICAL ERROR: MONGO_URI is not set in server/.env.');
    console.error('Please configure your MongoDB Atlas connection string in server/.env.');
    throw new Error('MONGO_URI is missing');
  }

  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Failed: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
