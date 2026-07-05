require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error.middleware');
const seedData = require('./utils/seed');

// Route imports
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const cartRoutes = require('./routes/cart.routes');
const wishlistRoutes = require('./routes/wishlist.routes');
const addressRoutes = require('./routes/address.routes');
const reviewRoutes = require('./routes/review.routes');
const profileRoutes = require('./routes/profile.routes');
const publicRoutes = require('./routes/public.routes');
const categoryRoutes = require('./routes/category.routes');
const vendorPublicRoutes = require('./routes/vendorPublic.routes');
const vendorDashboardRoutes = require('./routes/vendorDashboard.routes');
const adminRoutes = require('./routes/admin.routes');
const paymentRoutes = require('./routes/payment.routes');
const supportRoutes = require('./routes/support.routes');
const notificationRoutes = require('./routes/notification.routes');
const customerRoutes = require('./routes/customer.routes');
const bannerRoutes = require('./routes/banner.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
});

// Routes - all under /api prefix
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/vendors', vendorPublicRoutes);
app.use('/api/vendor', vendorDashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/banners', bannerRoutes);

// Error handler
app.use(errorHandler);

// Start server
const start = async () => {
  await connectDB();
  await seedData();

  app.listen(PORT, () => {
    console.log(`Node backend running on http://localhost:${PORT}`);
    console.log(`API base: http://localhost:${PORT}/api`);
  });
};

start();
