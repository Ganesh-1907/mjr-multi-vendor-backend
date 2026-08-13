require('dotenv').config();
const mongoose = require('mongoose');

const clearDb = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
    console.log(`Connecting to MongoDB: ${uri}`);
    await mongoose.connect(uri);
    console.log('Connected to DB. Dropping all collections...');

    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.drop();
      console.log(`Dropped collection: ${collection.collectionName}`);
    }

    console.log('Successfully cleared the database.');
  } catch (err) {
    console.error('Error clearing database:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
};

clearDb();
