import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDb, disconnectDb } from '../config/db.js';
import { User } from '../models/User.js';
import { FinancialRecord } from '../models/FinancialRecord.js';
import { ROLES, RECORD_TYPES, USER_STATUS } from '../constants/roles.js';

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/finance_dashboard';

async function seed() {
  await connectDb(uri);

  await FinancialRecord.deleteMany({});
  await User.deleteMany({});

  const adminPass = await User.hashPassword('Admin123!');
  const analystPass = await User.hashPassword('Analyst123!');
  const viewerPass = await User.hashPassword('Viewer123!');

  const [admin, analyst, viewer] = await User.create([
    {
      email: 'admin@example.com',
      passwordHash: adminPass,
      name: 'Admin User',
      role: ROLES.ADMIN,
      status: USER_STATUS.ACTIVE,
    },
    {
      email: 'analyst@example.com',
      passwordHash: analystPass,
      name: 'Analyst User',
      role: ROLES.ANALYST,
      status: USER_STATUS.ACTIVE,
    },
    {
      email: 'viewer@example.com',
      passwordHash: viewerPass,
      name: 'Viewer User',
      role: ROLES.VIEWER,
      status: USER_STATUS.ACTIVE,
    },
  ]);

  const categories = ['Salary', 'Rent', 'Software', 'Travel', 'Marketing'];
  const now = new Date();
  const rows = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const isIncome = i % 5 === 0;
    rows.push({
      amount: isIncome ? 5000 + i * 100 : 200 + i * 20,
      type: isIncome ? RECORD_TYPES.INCOME : RECORD_TYPES.EXPENSE,
      category: categories[i % categories.length],
      date: d,
      notes: `Seed entry ${i + 1}`,
      createdBy: admin._id,
    });
  }
  await FinancialRecord.insertMany(rows);

  console.log('Seed complete.');
  console.log('  admin@example.com / Admin123!');
  console.log('  analyst@example.com / Analyst123!');
  console.log('  viewer@example.com / Viewer123!');

  await disconnectDb();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
