import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.development or .env
dotenv.config({ path: path.resolve(__dirname, '../.env.development') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DB_URI = process.env.DB_URI || 'mongodb://localhost:27017/ToKo_Store';
const SALT_ROUND = Number(process.env.SALT_ROUND || 10);

async function run() {
  const args = process.argv.slice(2);
  const targetEmail = (args[0] || 'admin@tokostore.com').trim().toLowerCase();
  const plainPassword = args[1] || 'AdminPassword123!';

  console.log(`Connecting to MongoDB at ${DB_URI}...`);
  const conn = await mongoose.connect(DB_URI);

  const db = conn.connection.db;
  if (!db) {
    throw new Error('Could not get database handle from Mongoose');
  }

  const usersCollection = db.collection('Ecommerce_APP_USERS');

  const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUND);
  const now = new Date();

  const existing = await usersCollection.findOne({ email: targetEmail });

  if (existing) {
    await usersCollection.updateOne(
      { _id: existing._id },
      {
        $set: {
          role: 'ADMIN',
          password: hashedPassword,
          confirmEmail: existing.confirmEmail || now,
          deletedAt: null,
          updatedAt: now,
        },
      },
    );
    console.log(`\n✅ Existing user updated to ADMIN!`);
  } else {
    await usersCollection.insertOne({
      firstName: 'Admin',
      lastName: 'User',
      email: targetEmail,
      password: hashedPassword,
      role: 'ADMIN',
      gender: 'MALE',
      provider: 'SYSTEM',
      slug: targetEmail.split('@')[0],
      confirmEmail: now,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`\n✅ New ADMIN user created!`);
  }

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  Email   : ${targetEmail}`);
  console.log(`  Password: ${plainPassword}`);
  console.log(`  Role    : ADMIN`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('❌ Failed to seed admin:', err);
  process.exit(1);
});
