require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const result = await Product.updateMany(
      { approvalStatus: 'DRAFT' },
      { $set: { approvalStatus: 'PENDING_REVIEW', availabilityStatus: 'ACTIVE' } }
    );
    console.log(`Updated ${result.modifiedCount} products to PENDING_REVIEW`);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
})();
