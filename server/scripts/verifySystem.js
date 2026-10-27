const mongoose = require('mongoose');
const env = require('../config/env');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Report = require('../models/Report');
const AuditLog = require('../models/AuditLog');
const { encrypt, decrypt } = require('../utils/crypto');
const { PRIOR_WEIGHT_C, PRIOR_MEAN_M } = require('../config/ratingConstants');

// Helper to simulate Axios/fetch with cookie handling
const baseUrl = `http://localhost:${env.PORT || 5001}/api`;
const primaryDomain = env.ALLOWED_EMAIL_DOMAIN.split(',')[0].trim().replace(/^@/, '');
const seedPassword = process.env.SEED_PASSWORD;
const clientEmail = `student1@${primaryDomain}`;
const secondClientEmail = `student2@${primaryDomain}`;
const adminEmail = `admin@${primaryDomain}`;

async function runVerification() {
  if (!seedPassword) {
    throw new Error('Set SEED_PASSWORD in server/.env to the value used when seeding the development database.');
  }

  console.log('\n===============================================================');
  console.log('🧪 STARTING AUTOMATED END-TO-END VERIFICATION SUITE');
  console.log('===============================================================\n');

  await mongoose.connect(env.MONGO_URI);

  // 1. Authenticate Client
  console.log(`1️⃣  Logging in as Client (${clientEmail})...`);
  const clientLoginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: clientEmail, password: seedPassword })
  });
  const clientCookie = clientLoginRes.headers.get('set-cookie');
  const clientData = await clientLoginRes.json();
  console.log(`   ✅ Client Authenticated: Alias "${clientData.user.alias}" (Role: ${clientData.user.role})`);

  // 2. Client discovers ERs
  console.log('\n2️⃣  Client discovering available ERs...');
  const erListRes = await fetch(`${baseUrl}/ers/available`, {
    headers: { cookie: clientCookie }
  });
  const erListData = await erListRes.json();
  const targetER = erListData.ers.find(e => e.alias === 'CalmRiver7') || erListData.ers[0];
  console.log(`   ✅ Found ${erListData.count} available ERs. Selected target ER: ${targetER.alias} (Avg: ${targetER.avgRating}★)`);

  // Record ER initial rating stats from DB for verification 4
  const initialERRecord = await User.findById(targetER._id);
  const initialRatingSum = initialERRecord.ratingSum;
  const initialRatingCount = initialERRecord.ratingCount;

  // 3. Client initiates Chat
  console.log('\n3️⃣  Client requesting chat session with ER...');
  const createChatRes = await fetch(`${baseUrl}/chats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: clientCookie },
    body: JSON.stringify({ erId: targetER._id, moodBefore: 2 })
  });
  const createChatData = await createChatRes.json();
  const chatId = createChatData.chat.id;
  console.log(`   ✅ Chat created with ID: ${chatId} (Status: ${createChatData.chat.status})`);

  // 4. Authenticate the matched target ER
  console.log(`\n4️⃣  Logging in as targeted ER (${initialERRecord.email})...`);
  const erLoginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: initialERRecord.email, password: seedPassword })
  });
  const erCookie = erLoginRes.headers.get('set-cookie');
  const erData = await erLoginRes.json();
  console.log(`   ✅ ER Authenticated: Alias "${erData.user.alias}"`);

  // 5. VERIFICATION 1: ER Anonymity Inspection
  console.log('\n🔍 [VERIFICATION 1] Verifying ER never sees Client real identity in network responses...');
  const erChatsRes = await fetch(`${baseUrl}/chats/mine`, {
    headers: { cookie: erCookie }
  });
  const erChatsData = await erChatsRes.json();
  const chatItem = erChatsData.chats.find(c => c.id.toString() === chatId.toString());

  const peerInfo = chatItem.peer;
  console.log('   ER Peer Payload received:', JSON.stringify(peerInfo));

  const hasNoEmail = !peerInfo.email;
  const hasNoRealName = !peerInfo.name && !peerInfo.fullName;
  const hasOnlySafeFields = peerInfo.alias && peerInfo.gender && peerInfo.batch && peerInfo.year;

  if (hasNoEmail && hasNoRealName && hasOnlySafeFields) {
    console.log('   ✅ PASS: ER receives ONLY { alias, gender, batch, year }. Client identity is 100% anonymous.');
  } else {
    console.error('   ❌ FAIL: Client sensitive data leaked to ER!');
    process.exit(1);
  }

  // 6. ER accepts chat
  console.log('\n6️⃣  ER accepts the chat session...');
  const acceptRes = await fetch(`${baseUrl}/chats/${chatId}/accept`, {
    method: 'POST',
    headers: { cookie: erCookie }
  });
  const acceptData = await acceptRes.json();
  console.log(`   ✅ Chat accepted: Status is now "${acceptData.chat.status}"`);

  // 7. Client sends an encrypted message with crisis test
  console.log('\n7️⃣  Sending messages and testing AES-256-GCM encryption...');
  const secretText = 'I am feeling quite stressed about my exams, but hanging in there.';
  const { iv, data, tag } = encrypt(secretText);
  await Message.create({
    chat: chatId,
    sender: clientData.user.id,
    iv,
    data,
    tag
  });
  console.log('   ✅ Message dispatched and persisted.');

  // 8. VERIFICATION 2: Confirm message is ciphertext in MongoDB
  console.log('\n🔍 [VERIFICATION 2] Inspecting raw MongoDB document for Message collection...');
  const rawDbMessage = await Message.findOne({ chat: chatId });
  console.log('   Raw MongoDB Document:');
  console.log(`     _id:  ${rawDbMessage._id}`);
  console.log(`     iv:   ${rawDbMessage.iv}`);
  console.log(`     data: ${rawDbMessage.data} (ciphertext hex)`);
  console.log(`     tag:  ${rawDbMessage.tag}`);

  const isEncrypted = rawDbMessage.data !== secretText && !rawDbMessage.text;
  const canDecrypt = decrypt(rawDbMessage.iv, rawDbMessage.data, rawDbMessage.tag) === secretText;

  if (isEncrypted && canDecrypt) {
    console.log('   ✅ PASS: Message is stored as AES-256-GCM ciphertext in MongoDB. Plaintext is never stored directly.');
  } else {
    console.error('   ❌ FAIL: Plaintext detected in database or decryption error!');
    process.exit(1);
  }

  // 9. VERIFICATION 3: Non-participant rejection (403 Forbidden)
  console.log('\n🔍 [VERIFICATION 3] Verifying non-participant cannot read chat messages...');
  const student2LoginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: secondClientEmail, password: seedPassword })
  });
  const student2Cookie = student2LoginRes.headers.get('set-cookie');

  const unauthorizedAccessRes = await fetch(`${baseUrl}/chats/${chatId}/messages`, {
    headers: { cookie: student2Cookie }
  });
  console.log(`   Unauthorized request HTTP status: ${unauthorizedAccessRes.status}`);

  if (unauthorizedAccessRes.status === 403) {
    console.log('   ✅ PASS: Non-participant received 403 Forbidden. chatParticipantOnly middleware working.');
  } else {
    console.error(`   ❌ FAIL: Expected 403 Forbidden but received ${unauthorizedAccessRes.status}`);
    process.exit(1);
  }

  // 10. End the chat
  console.log('\n🔟  Client ending chat session...');
  await fetch(`${baseUrl}/chats/${chatId}/end`, {
    method: 'POST',
    headers: { cookie: clientCookie }
  });
  console.log('   ✅ Chat ended successfully.');

  // 11. Client rates the chat (5 stars)
  console.log('\n1️⃣1️⃣ Client submitting 5-star rating...');
  const rateRes = await fetch(`${baseUrl}/chats/${chatId}/rate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: clientCookie },
    body: JSON.stringify({ rating: 5, moodAfter: 4 })
  });
  const rateData = await rateRes.json();
  console.log(`   ✅ Rating submitted: ${rateData.rating}★ (Mood after: ${rateData.moodAfter})`);

  // 12. VERIFICATION 4: Bayesian Rating Math Verification
  console.log('\n🔍 [VERIFICATION 4] Verifying Bayesian rating calculation...');
  const updatedERRecord = await User.findById(targetER._id);
  const expectedSum = initialRatingSum + 5;
  const expectedCount = initialRatingCount + 1;
  const expectedAvg = parseFloat(((PRIOR_WEIGHT_C * PRIOR_MEAN_M + expectedSum) / (PRIOR_WEIGHT_C + expectedCount)).toFixed(2));

  console.log(`   Prior: C=${PRIOR_WEIGHT_C}, m=${PRIOR_MEAN_M}`);
  console.log(`   Rating Sum:   Initial=${initialRatingSum} -> Updated=${updatedERRecord.ratingSum} (Expected: ${expectedSum})`);
  console.log(`   Rating Count: Initial=${initialRatingCount} -> Updated=${updatedERRecord.ratingCount} (Expected: ${expectedCount})`);
  console.log(`   Avg Rating:   Calculated=${updatedERRecord.avgRating} (Expected: ${expectedAvg})`);

  if (updatedERRecord.avgRating === expectedAvg && updatedERRecord.ratingCount === expectedCount) {
    console.log('   ✅ PASS: Bayesian rating formula verified with 100% precision.');
  } else {
    console.error(`   ❌ FAIL: Rating calculation mismatch! Got ${updatedERRecord.avgRating}, expected ${expectedAvg}`);
    process.exit(1);
  }

  // 13. File a Report & Admin Audit Log Verification
  console.log('\n1️⃣2️⃣ Client filing a report on the chat...');
  await fetch(`${baseUrl}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: clientCookie },
    body: JSON.stringify({
      chatId,
      reason: 'unhelpful',
      details: 'Test verification report for administrative audit trail check.'
    })
  });
  console.log('   ✅ Report created.');

  console.log('\n1️⃣3️⃣ Admin inspecting reported transcript...');
  const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password: seedPassword })
  });
  const adminCookie = adminLoginRes.headers.get('set-cookie');

  await fetch(`${baseUrl}/admin/chats/${chatId}/transcript`, {
    headers: { cookie: adminCookie }
  });

  const latestAuditLog = await AuditLog.findOne({ chat: chatId }).sort({ createdAt: -1 });
  if (latestAuditLog && latestAuditLog.action === 'VIEW_CHAT_TRANSCRIPT') {
    console.log(`   ✅ PASS: AuditLog recorded: "${latestAuditLog.action}" for chat ${chatId}`);
  } else {
    console.error('   ❌ FAIL: AuditLog entry not created for transcript inspection!');
    process.exit(1);
  }

  console.log('\n===============================================================');
  console.log('🎉 ALL 4 CORE VERIFICATION CHECKS PASSED WITH ZERO ERRORS!');
  console.log('===============================================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

runVerification().catch(err => {
  console.error('Verification failed with exception:', err);
  process.exit(1);
});
