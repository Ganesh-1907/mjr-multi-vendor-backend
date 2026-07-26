require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const migrate = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const products = await Product.find({});
    for (const product of products) {
      if (product._doc.status === 'APPROVED') {
        product.approvalStatus = 'APPROVED';
        product.availabilityStatus = 'ACTIVE';
      } else if (product._doc.status === 'PENDING') {
        product.approvalStatus = 'PENDING_REVIEW';
        product.availabilityStatus = 'INACTIVE';
      } else if (product._doc.status === 'REJECTED') {
        product.approvalStatus = 'REJECTED';
        product.availabilityStatus = 'INACTIVE';
      } else if (product._doc.status === 'DRAFT') {
        product.approvalStatus = 'DRAFT';
        product.availabilityStatus = 'INACTIVE';
      }
      
      // We use product.set to ensure mongoose saves it even if the schema changed
      await product.save();
    }
    console.log('Migration complete. Migrated', products.length, 'products');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

migrate();
