require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Role = require('../models/Role');
const User = require('../models/User');
const Vendor = require('../models/Vendor');

const insertUsers = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
    console.log(`Connecting to MongoDB: ${uri}`);
    await mongoose.connect(uri);

    // Create Roles if missing
    let customerRole = await Role.findOne({ name: 'CUSTOMER' });
    if (!customerRole) customerRole = await Role.create({ name: 'CUSTOMER', description: 'Regular customer', permissions: [] });
    
    let vendorRole = await Role.findOne({ name: 'VENDOR' });
    if (!vendorRole) vendorRole = await Role.create({ name: 'VENDOR', description: 'Vendor/Seller', permissions: [] });
    
    let adminRole = await Role.findOne({ name: 'ADMIN' });
    if (!adminRole) adminRole = await Role.create({ name: 'ADMIN', description: 'Administrator', permissions: ['all'] });

    // 1. Admin
    let admin = await User.findOne({ email: 'admin@yopmail.com' });
    if (!admin) {
      admin = await User.create({ email: 'admin@yopmail.com', passwordHash: 'password123', firstName: 'Admin', lastName: 'User', phone: '9999999999', role: adminRole._id, isActive: true, emailVerified: true });
      console.log('Created Admin: admin@yopmail.com');
    }

    // 2. Customer
    let customer = await User.findOne({ email: 'john.doe@yopmail.com' });
    if (!customer) {
      customer = await User.create({ email: 'john.doe@yopmail.com', passwordHash: 'password123', firstName: 'John', lastName: 'Doe', phone: '9876543215', role: customerRole._id, isActive: true, emailVerified: true });
      console.log('Created Customer: john.doe@yopmail.com');
    }

    // 3. Vendor
    let vendorUser = await User.findOne({ email: 'rajesh.kumar@yopmail.com' });
    if (!vendorUser) {
      vendorUser = await User.create({ email: 'rajesh.kumar@yopmail.com', passwordHash: 'password123', firstName: 'Rajesh', lastName: 'Kumar', phone: '9876543210', role: vendorRole._id, isActive: true, emailVerified: true });
      console.log('Created Vendor User: rajesh.kumar@yopmail.com');
      
      // Create Vendor Profile for Rajesh
      await Vendor.create({
        user: vendorUser._id,
        storeName: 'TechStore Pro',
        storeSlug: 'techstore-pro',
        storeDescription: 'Premium electronics and gadgets',
        businessEmail: 'rajesh.kumar@yopmail.com',
        businessPhone: '9876543210',
        rating: 0,
        totalProducts: 0,
        totalSales: 0,
        isVerified: true,
        commissionRate: 10
      });
      console.log('Created Vendor Store Profile for Rajesh.');
    }

    console.log('All required users have been inserted successfully!');
  } catch (err) {
    console.error('Error inserting users:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
};

insertUsers();
