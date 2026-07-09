const mongoose = require('mongoose');

async function getNumbers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ecommerce');
    const users = await mongoose.connection.db.collection('users').find({ phone: { $exists: true, $ne: null } }).toArray();
    console.log("Valid numbers found in database:");
    users.forEach(u => {
      console.log(`- ${u.firstName} ${u.lastName} (${u.email}): ${u.phone}`);
    });
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

getNumbers();
