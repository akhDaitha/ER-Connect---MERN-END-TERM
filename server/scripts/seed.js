const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const env = require('../config/env');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Report = require('../models/Report');
const AuditLog = require('../models/AuditLog');

const seedData = async () => {
  if (!env.MONGO_URI) {
    console.error('Error: MONGO_URI is missing in server/.env. Cannot seed database.');
    process.exit(1);
  }

  if (!process.env.SEED_PASSWORD) {
    console.error('Error: SEED_PASSWORD is missing in server/.env. Set a local development password before seeding.');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(env.MONGO_URI);
    console.log('Connected.');

    console.log('Clearing existing collections...');
    await User.deleteMany({});
    await Chat.deleteMany({});
    await Message.deleteMany({});
    await Report.deleteMany({});
    await AuditLog.deleteMany({});

    const primaryDomain = env.ALLOWED_EMAIL_DOMAIN.split(',')[0].trim().replace(/^@/, '');

    const commonPassword = process.env.SEED_PASSWORD;
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(commonPassword, salt);

    console.log('Creating users for domain:', primaryDomain);

    // 1. Admin
    const admin = await User.create({
      alias: 'AdminRoot',
      email: `admin@${primaryDomain}`,
      passwordHash,
      role: 'admin',
      gender: 'other',
      batch: 2024
    });

    // 2. 4 Emotional Responders (ERs) - Mixed gender
    const er1 = await User.create({
      alias: 'CalmRiver7',
      email: `er.calmriver@${primaryDomain}`,
      passwordHash,
      role: 'er',
      gender: 'female',
      batch: 2025,
      isAvailable: true,
      isSuspended: false,
      ratingSum: 23,
      ratingCount: 5,
      avgRating: 4.30,
      activeChatCount: 0
    });

    const er2 = await User.create({
      alias: 'SteadyOak22',
      email: `er.steadyoak@${primaryDomain}`,
      passwordHash,
      role: 'er',
      gender: 'male',
      batch: 2026,
      isAvailable: true,
      isSuspended: false,
      ratingSum: 19,
      ratingCount: 4,
      avgRating: 4.33,
      activeChatCount: 0
    });

    const er3 = await User.create({
      alias: 'GentlePine5',
      email: `er.gentlepine@${primaryDomain}`,
      passwordHash,
      role: 'er',
      gender: 'female',
      batch: 2025,
      isAvailable: true,
      isSuspended: false,
      ratingSum: 15,
      ratingCount: 3,
      avgRating: 4.38,
      activeChatCount: 0
    });

    const er4 = await User.create({
      alias: 'WarmBreeze14',
      email: `er.warmbreeze@${primaryDomain}`,
      passwordHash,
      role: 'er',
      gender: 'other',
      batch: 2026,
      isAvailable: false,
      isSuspended: false,
      ratingSum: 8,
      ratingCount: 2,
      avgRating: 4.00,
      activeChatCount: 0
    });

    // 3. 3 Test Clients (including user's exact roll format)
    const client1 = await User.create({
      alias: 'QuietFox42',
      email: `student1@${primaryDomain}`,
      passwordHash,
      role: 'client',
      gender: 'male',
      batch: 2029 // Joined 2025, Graduating 2029
    });

    const client2 = await User.create({
      alias: 'MellowPanda19',
      email: `student2@${primaryDomain}`,
      passwordHash,
      role: 'client',
      gender: 'female',
      batch: 2028 // Joined 2024, Graduating 2028
    });

    const client3 = await User.create({
      alias: 'SwiftSparrow88',
      email: `student3@${primaryDomain}`,
      passwordHash,
      role: 'client',
      gender: 'other',
      batch: 2027 // Joined 2023, Graduating 2027
    });

    console.log('Seeding completed successfully!');
    console.log('==================================================');
    console.log(`Common Password for all accounts: ${commonPassword}`);
    console.log('Accounts created:');
    console.log(`- Admin:   ${admin.email} (Alias: ${admin.alias})`);
    console.log(`- ER 1:    ${er1.email} (Alias: ${er1.alias}, Available: true)`);
    console.log(`- ER 2:    ${er2.email} (Alias: ${er2.alias}, Available: true)`);
    console.log(`- ER 3:    ${er3.email} (Alias: ${er3.alias}, Available: true)`);
    console.log(`- ER 4:    ${er4.email} (Alias: ${er4.alias}, Available: false)`);
    console.log(`- Client 1:${client1.email} (Alias: ${client1.alias}, Batch: 2029)`);
    console.log(`- Client 2:${client2.email} (Alias: ${client2.alias}, Batch: 2028)`);
    console.log(`- Client 3:${client3.email} (Alias: ${client3.alias}, Batch: 2027)`);
    console.log('==================================================');

    process.exit(0);
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  }
};

seedData();
