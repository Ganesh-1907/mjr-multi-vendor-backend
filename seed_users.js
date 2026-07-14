const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Role = require('./models/Role');
const User = require('./models/User');
const Vendor = require('./models/Vendor');

async function seed() {
  await mongoose.connect('mongodb://localhost:27017/ecommerce');
  console.log('Connected to DB');

  const roles = ['ADMIN', 'VENDOR', 'CUSTOMER'];
  const roleDocs = {};
  for (const roleName of roles) {
    let role = await Role.findOne({ name: roleName });
    if (!role) {
      role = await Role.create({ name: roleName });
      console.log(`Created role: ${roleName}`);
    }
    roleDocs[roleName] = role;
  }

  const users = [
    { email: 'admin@example.com', role: 'ADMIN', firstName: 'Admin', lastName: 'User' },
    { email: 'vendor@example.com', role: 'VENDOR', firstName: 'Vendor', lastName: 'User' },
    { email: 'customer@example.com', role: 'CUSTOMER', firstName: 'Customer', lastName: 'User' },
  ];

  for (const u of users) {
    let user = await User.findOne({ email: u.email });
    if (!user) {
      user = await User.create({
        email: u.email,
        passwordHash: 'password123',
        firstName: u.firstName,
        lastName: u.lastName,
        role: roleDocs[u.role]._id,
        isActive: true,
        emailVerified: true
      });
      console.log(`Created user: ${u.email} / password123`);
      
      if (u.role === 'VENDOR') {
        await Vendor.create({
          user: user._id,
          storeName: 'Test Vendor Store',
          storeDescription: 'A test store',
          isApproved: true,
          status: 'ACTIVE',
          contactEmail: u.email,
          contactPhone: '1234567890'
        });
        console.log(`Created vendor profile for ${u.email}`);
      }
    } else {
      console.log(`User already exists: ${u.email}`);
    }
  }

  mongoose.disconnect();
}

seed().catch(console.error);
