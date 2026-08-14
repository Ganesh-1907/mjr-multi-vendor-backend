require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('../models/Role');
const User = require('../models/User');

const ADMIN_EMAIL = 'admin@yopmail.com';
const ADMIN_PASSWORD = 'admin@123';

const seedData = async () => {
  let adminRole = await Role.findOne({ name: 'ADMIN' });
  if (!adminRole) {
    adminRole = await Role.create({ name: 'ADMIN', description: 'Administrator', permissions: ['all'] });
    console.log('Created ADMIN role');
  }

  const existing = await User.findOne({ email: ADMIN_EMAIL });

  if (existing) {
    existing.passwordHash = ADMIN_PASSWORD;
    existing.firstName = 'Admin';
    existing.lastName = 'User';
    existing.phone = '9999999999';
    existing.role = adminRole._id;
    existing.isActive = true;
    existing.emailVerified = true;
    await existing.save();
    console.log(`Updated admin user: ${ADMIN_EMAIL}`);
  } else {
    await User.create({
      email: ADMIN_EMAIL,
      passwordHash: ADMIN_PASSWORD,
      firstName: 'Admin',
      lastName: 'User',
      phone: '9999999999',
      role: adminRole._id,
      isActive: true,
      emailVerified: true,
    });
    console.log(`Created admin user: ${ADMIN_EMAIL}`);
  }

  console.log(`Admin credentials: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
};

if (require.main === module) {
  const connectDB = require('../config/db');

  (async () => {
    try {
      await connectDB();
      await seedData();
    } catch (error) {
      console.error('Seed failed:', error.message);
      process.exit(1);
    } finally {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB. Done.');
    }
  })();
}

module.exports = seedData;
