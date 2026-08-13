require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const resetPasswords = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
    await mongoose.connect(uri);
    
    // We must NOT use User.save() if we are assigning already-hashed passwords, OR
    // we use save() and just assign 'password123' as passwordHash.
    
    const users = await User.find({});
    for (const user of users) {
      user.passwordHash = 'password123';
      await user.save();
    }
    
    console.log('All passwords reset to password123');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
};

resetPasswords();
