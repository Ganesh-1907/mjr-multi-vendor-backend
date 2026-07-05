require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Role = require('../models/Role');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Category = require('../models/Category');
const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');
const ProductImage = require('../models/ProductImage');
const Banner = require('../models/Banner');
const Coupon = require('../models/Coupon');

const seedData = async () => {
  try {
    const roleCount = await Role.countDocuments();
    if (roleCount > 0) {
      console.log('Seed data already exists, skipping...');
      return;
    }

    console.log('Seeding database...');

    // 1. Create Roles
    const roles = await Role.insertMany([
      { name: 'CUSTOMER', description: 'Regular customer', permissions: [] },
      { name: 'VENDOR', description: 'Vendor/Seller', permissions: [] },
      { name: 'ADMIN', description: 'Administrator', permissions: ['all'] },
    ]);
    console.log('✓ Roles created (CUSTOMER, VENDOR, ADMIN)');

    const [customerRole, vendorRole, adminRole] = roles;

    // 2. Create Users (password for all: password123)
    const passwordHash = await bcrypt.hash('password123', 12);
    const users = await User.insertMany([
      { email: 'admin@yopmail.com', passwordHash, firstName: 'Admin', lastName: 'User', phone: '9999999999', role: adminRole._id, isActive: true, emailVerified: true },
      { email: 'rajesh.kumar@yopmail.com', passwordHash, firstName: 'Rajesh', lastName: 'Kumar', phone: '9876543210', role: vendorRole._id, isActive: true, emailVerified: true },
      { email: 'priya.sharma@yopmail.com', passwordHash, firstName: 'Priya', lastName: 'Sharma', phone: '9876543211', role: vendorRole._id, isActive: true, emailVerified: true },
      { email: 'amit.patel@yopmail.com', passwordHash, firstName: 'Amit', lastName: 'Patel', phone: '9876543212', role: vendorRole._id, isActive: true, emailVerified: true },
      { email: 'suresh.verma@yopmail.com', passwordHash, firstName: 'Suresh', lastName: 'Verma', phone: '9876543213', role: vendorRole._id, isActive: true, emailVerified: true },
      { email: 'neha.gupta@yopmail.com', passwordHash, firstName: 'Neha', lastName: 'Gupta', phone: '9876543214', role: vendorRole._id, isActive: true, emailVerified: true },
      { email: 'john.doe@yopmail.com', passwordHash, firstName: 'John', lastName: 'Doe', phone: '9876543215', role: customerRole._id, isActive: true, emailVerified: true },
    ]);
    console.log(`✓ Users created (1 admin, 5 vendors, 1 customer)`);

    // 3. Create Vendors
    const vendors = await Vendor.insertMany([
      { user: users[1]._id, storeName: 'TechStore Pro', storeSlug: 'techstore-pro', storeDescription: 'Premium electronics and gadgets', businessEmail: 'rajesh.kumar@yopmail.com', businessPhone: '9876543210', rating: 4.5, totalProducts: 4, totalSales: 0, isVerified: true, commissionRate: 10 },
      { user: users[2]._id, storeName: 'Fashion Hub', storeSlug: 'fashion-hub', storeDescription: 'Trendy fashion and accessories', businessEmail: 'priya.sharma@yopmail.com', businessPhone: '9876543211', rating: 4.2, totalProducts: 2, totalSales: 0, isVerified: true, commissionRate: 10 },
      { user: users[3]._id, storeName: 'Home Special', storeSlug: 'home-special', storeDescription: 'Home decor and kitchen essentials', businessEmail: 'amit.patel@yopmail.com', businessPhone: '9876543212', rating: 4.0, totalProducts: 2, totalSales: 0, isVerified: true, commissionRate: 10 },
      { user: users[4]._id, storeName: 'Sport Zone', storeSlug: 'sport-zone', storeDescription: 'Sports equipment and fitness gear', businessEmail: 'suresh.verma@yopmail.com', businessPhone: '9876543213', rating: 4.3, totalProducts: 2, totalSales: 0, isVerified: true, commissionRate: 10 },
      { user: users[5]._id, storeName: 'Book World', storeSlug: 'book-world', storeDescription: 'Books for every reader', businessEmail: 'neha.gupta@yopmail.com', businessPhone: '9876543214', rating: 4.7, totalProducts: 2, totalSales: 0, isVerified: true, commissionRate: 10 },
    ]);
    console.log('✓ Vendors created (5 stores)');

    // 4. Create Categories
    const categories = await Category.insertMany([
      { name: 'Electronics', slug: 'electronics', description: 'Latest electronics and gadgets', icon: 'electronic_icon', isActive: true, displayOrder: 1 },
      { name: 'Fashion', slug: 'fashion', description: 'Trendy fashion and accessories', icon: 'fashion_icon', isActive: true, displayOrder: 2 },
      { name: 'Home & Kitchen', slug: 'home-kitchen', description: 'Home decor and kitchen essentials', icon: 'home_icon', isActive: true, displayOrder: 3 },
      { name: 'Sports & Fitness', slug: 'sports-fitness', description: 'Sports equipment and fitness gear', icon: 'sports_icon', isActive: true, displayOrder: 4 },
      { name: 'Books', slug: 'books', description: 'Books for every reader', icon: 'books_icon', isActive: true, displayOrder: 5 },
      { name: 'Beauty & Personal Care', slug: 'beauty-personal-care', description: 'Beauty products and personal care', icon: 'beauty_icon', isActive: true, displayOrder: 6 },
      { name: 'Toys & Games', slug: 'toys-games', description: 'Toys for all ages', icon: 'toys_icon', isActive: true, displayOrder: 7 },
      { name: 'Automotive', slug: 'automotive', description: 'Car accessories and automotive', icon: 'auto_icon', isActive: true, displayOrder: 8 },
    ]);
    console.log('✓ Categories created (8 categories)');
    const [electronics, fashion, homeKitchen, sportsFitness, books, beauty] = categories;

    // 5. Create Products
    const products = await Product.insertMany([
      { vendor: vendors[0]._id, category: electronics._id, name: 'iPhone 15 Pro Max', slug: 'iphone-15-pro-max', shortDescription: 'Apple iPhone 15 Pro Max 256GB', description: 'The most powerful iPhone ever. A17 Pro chip, 48MP camera system, and all-day battery life.', rating: 4.5, totalReviews: 128, status: 'APPROVED', isFeatured: true, isTrending: true, tags: ['apple', 'iphone', 'smartphone'], specifications: { 'Display': '6.7-inch OLED', 'Processor': 'A17 Pro', 'Camera': '48MP Triple', 'Battery': '4422mAh' } },
      { vendor: vendors[0]._id, category: electronics._id, name: 'Samsung Galaxy S24 Ultra', slug: 'samsung-galaxy-s24-ultra', shortDescription: 'Samsung Galaxy S24 Ultra 512GB', description: 'Galaxy AI is here. Built with titanium, Galaxy S24 Ultra features a flat display with Corning Gorilla Armor.', rating: 4.3, totalReviews: 95, status: 'APPROVED', isFeatured: true, isTrending: true, tags: ['samsung', 'galaxy', 'smartphone'], specifications: { 'Display': '6.8-inch Dynamic AMOLED', 'Processor': 'Snapdragon 8 Gen 3', 'Camera': '200MP Quad', 'Battery': '5000mAh' } },
      { vendor: vendors[0]._id, category: electronics._id, name: 'MacBook Pro 16"', slug: 'macbook-pro-16', shortDescription: 'Apple MacBook Pro 16" M3 Pro Chip', description: 'Supercharged by M3 Pro or M3 Max chip, MacBook Pro delivers extraordinary performance.', rating: 4.7, totalReviews: 67, status: 'APPROVED', isFeatured: true, isTrending: false, tags: ['apple', 'macbook', 'laptop'], specifications: { 'Display': '16.2-inch Liquid Retina XDR', 'Processor': 'M3 Pro', 'Memory': '18GB Unified', 'Storage': '512GB SSD' } },
      { vendor: vendors[0]._id, category: electronics._id, name: 'Sony WH-1000XM5', slug: 'sony-wh-1000xm5', shortDescription: 'Sony WH-1000XM5 Wireless Noise Cancelling', description: 'Industry-leading noise cancellation with Auto NC Optimizer. Crystal clear hands-free calling.', rating: 4.6, totalReviews: 234, status: 'APPROVED', isFeatured: false, isTrending: true, tags: ['sony', 'headphones', 'noise-cancelling'], specifications: { 'Type': 'Over-ear Wireless', 'Battery': '30 hours', 'Noise Cancellation': 'Adaptive', 'Driver': '30mm' } },
      { vendor: vendors[1]._id, category: fashion._id, name: 'Cotton T-Shirt Set', slug: 'cotton-tshirt-set', shortDescription: 'Premium Cotton T-Shirt Set - Pack of 3', description: 'Ultra-comfortable 100% organic cotton t-shirts. Pre-shrunk, breathable fabric perfect for daily wear.', rating: 4.1, totalReviews: 456, status: 'APPROVED', isFeatured: true, isTrending: false, tags: ['cotton', 't-shirt', 'casual'], specifications: { 'Material': '100% Organic Cotton', 'Fit': 'Regular', 'Pack': '3 Pieces', 'Care': 'Machine Washable' } },
      { vendor: vendors[1]._id, category: fashion._id, name: 'Designer Kurti', slug: 'designer-kurti', shortDescription: 'Designer Printed Rayon Kurti', description: 'Beautiful printed rayon kurti with elegant design. Perfect for casual and festive wear.', rating: 4.4, totalReviews: 189, status: 'APPROVED', isFeatured: true, isTrending: true, tags: ['kurti', 'designer', 'ethnic'], specifications: { 'Material': 'Rayon', 'Length': 'Calf Length', 'Pattern': 'Printed', 'Neck': 'Round Neck' } },
      { vendor: vendors[2]._id, category: homeKitchen._id, name: 'Premium Cookware Set', slug: 'premium-cookware-set', shortDescription: '11-Piece Non-Stick Cookware Set', description: 'Complete kitchen cookware set with aluminum non-stick coating. Includes pots, pans, and lids.', rating: 4.3, totalReviews: 312, status: 'APPROVED', isFeatured: true, isTrending: false, tags: ['cookware', 'kitchen', 'non-stick'], specifications: { 'Pieces': '11', 'Material': 'Aluminum Non-Stick', 'Oven Safe': 'Up to 180°C', 'Dishwasher': 'Safe' } },
      { vendor: vendors[2]._id, category: homeKitchen._id, name: 'Ergonomic Office Chair', slug: 'ergonomic-office-chair', shortDescription: 'High-Back Mesh Ergonomic Office Chair', description: 'Adjustable lumbar support, breathable mesh back, and comfortable cushion seat.', rating: 4.0, totalReviews: 78, status: 'APPROVED', isFeatured: false, isTrending: false, tags: ['office', 'chair', 'ergonomic'], specifications: { 'Material': 'Mesh + PU Leather', 'Adjustment': 'Height & Recline', 'Weight Capacity': '150kg', 'Warranty': '3 Years' } },
      { vendor: vendors[3]._id, category: sportsFitness._id, name: 'Premium Yoga Mat', slug: 'premium-yoga-mat', shortDescription: 'Extra Thick Non-Slip Yoga Mat', description: 'Premium TPE yoga mat with alignment lines. Eco-friendly, non-toxic, and lightweight for easy carrying.', rating: 4.5, totalReviews: 567, status: 'APPROVED', isFeatured: true, isTrending: true, tags: ['yoga', 'fitness', 'mat'], specifications: { 'Material': 'TPE', 'Thickness': '6mm', 'Dimensions': '183x61cm', 'Weight': '1.2kg' } },
      { vendor: vendors[3]._id, category: sportsFitness._id, name: 'Adjustable Dumbbell Set', slug: 'adjustable-dumbbell-set', shortDescription: '20kg Adjustable Dumbbell Set with Stand', description: 'Space-saving adjustable dumbbells. Replace 6 pairs of dumbbells with one compact set.', rating: 4.2, totalReviews: 234, status: 'APPROVED', isFeatured: true, isTrending: false, tags: ['dumbbell', 'weight', 'fitness'], specifications: { 'Weight': '2-20kg each', 'Increment': '2kg', 'Material': 'Cast Iron + Rubber', 'Stand': 'Included' } },
      { vendor: vendors[4]._id, category: books._id, name: 'Bestseller Book Bundle', slug: 'bestseller-book-bundle', shortDescription: 'Top 5 Bestseller Books Bundle', description: 'Curated collection of this year\'s top-rated fiction and non-fiction bestsellers.', rating: 4.8, totalReviews: 890, status: 'APPROVED', isFeatured: true, isTrending: true, tags: ['books', 'bestseller', 'reading'], specifications: { 'Books': '5', 'Genre': 'Mixed Fiction & Non-Fiction', 'Format': 'Paperback', 'Language': 'English' } },
      { vendor: vendors[4]._id, category: beauty._id, name: 'Luxury Skincare Gift Set', slug: 'skincare-gift-set', shortDescription: 'Premium 5-Piece Skincare Gift Set', description: 'Complete skincare routine with cleanser, toner, serum, moisturizer, and face mask.', rating: 4.6, totalReviews: 445, status: 'APPROVED', isFeatured: true, isTrending: true, tags: ['skincare', 'beauty', 'gift'], specifications: { 'Pieces': '5', 'Skin Type': 'All Skin Types', 'Contains': 'Cleanser, Toner, Serum, Moisturizer, Mask', 'Cruelty Free': 'Yes' } },
    ]);
    console.log(`✓ Products created (${products.length} products)`);

    // 6. Create Product Variants
    const variantCount = 19;
    await ProductVariant.insertMany([
      { product: products[0]._id, name: 'Natural Titanium 256GB', sku: 'IP15PM-NT-256', price: 139900, comparePrice: 159900, stockQuantity: 50, image: 'https://picsum.photos/seed/iphone1/400/400' },
      { product: products[0]._id, name: 'Natural Titanium 512GB', sku: 'IP15PM-NT-512', price: 159900, comparePrice: 179900, stockQuantity: 30, image: 'https://picsum.photos/seed/iphone2/400/400' },
      { product: products[1]._id, name: 'Titanium Gray 256GB', sku: 'S24U-TG-256', price: 129999, comparePrice: 149999, stockQuantity: 40, image: 'https://picsum.photos/seed/samsung1/400/400' },
      { product: products[1]._id, name: 'Titanium Gray 512GB', sku: 'S24U-TG-512', price: 149999, comparePrice: 169999, stockQuantity: 20, image: 'https://picsum.photos/seed/samsung2/400/400' },
      { product: products[2]._id, name: 'Space Black 18GB/512GB', sku: 'MBP16-SB-512', price: 249900, comparePrice: 269900, stockQuantity: 15, image: 'https://picsum.photos/seed/macbook1/400/400' },
      { product: products[2]._id, name: 'Silver 36GB/1TB', sku: 'MBP16-SI-1T', price: 299900, stockQuantity: 10, image: 'https://picsum.photos/seed/macbook2/400/400' },
      { product: products[3]._id, name: 'Black', sku: 'SONY-WH1000-B', price: 29990, comparePrice: 34990, stockQuantity: 100, image: 'https://picsum.photos/seed/sony1/400/400' },
      { product: products[3]._id, name: 'Silver', sku: 'SONY-WH1000-S', price: 29990, comparePrice: 34990, stockQuantity: 80, image: 'https://picsum.photos/seed/sony2/400/400' },
      { product: products[4]._id, name: 'Pack of 3 - White', sku: 'CTP-W-3', price: 1299, comparePrice: 1799, stockQuantity: 500, image: 'https://picsum.photos/seed/tshirt1/400/400' },
      { product: products[4]._id, name: 'Pack of 3 - Black', sku: 'CTP-B-3', price: 1299, comparePrice: 1799, stockQuantity: 500, image: 'https://picsum.photos/seed/tshirt2/400/400' },
      { product: products[5]._id, name: 'Blue Printed', sku: 'DK-BLUE-P', price: 2499, comparePrice: 3499, stockQuantity: 200, image: 'https://picsum.photos/seed/kurti1/400/400' },
      { product: products[5]._id, name: 'Green Printed', sku: 'DK-GRN-P', price: 2499, comparePrice: 3499, stockQuantity: 200, image: 'https://picsum.photos/seed/kurti2/400/400' },
      { product: products[6]._id, name: '11-Piece Set - Red', sku: 'CKR-R-11', price: 5999, comparePrice: 8999, stockQuantity: 100, image: 'https://picsum.photos/seed/cookware1/400/400' },
      { product: products[7]._id, name: 'Black Mesh', sku: 'OC-BLK-M', price: 15999, comparePrice: 19999, stockQuantity: 50, image: 'https://picsum.photos/seed/chair1/400/400' },
      { product: products[8]._id, name: 'Purple 6mm', sku: 'YM-PUR-6', price: 2499, comparePrice: 3499, stockQuantity: 300, image: 'https://picsum.photos/seed/yoga1/400/400' },
      { product: products[8]._id, name: 'Blue 6mm', sku: 'YM-BLUE-6', price: 2499, comparePrice: 3499, stockQuantity: 300, image: 'https://picsum.photos/seed/yoga2/400/400' },
      { product: products[9]._id, name: '2-20kg Pair with Stand', sku: 'DS-20KG-S', price: 12999, comparePrice: 17999, stockQuantity: 60, image: 'https://picsum.photos/seed/dumbbell1/400/400' },
      { product: products[10]._id, name: 'Fiction Bundle', sku: 'BB-FIC-5', price: 3999, comparePrice: 5999, stockQuantity: 200, image: 'https://picsum.photos/seed/books1/400/400' },
      { product: products[11]._id, name: 'For Women', sku: 'SG-WOMEN', price: 4499, comparePrice: 5999, stockQuantity: 150, image: 'https://picsum.photos/seed/skincare1/400/400' },
    ]);
    console.log(`✓ Product variants created (${variantCount} variants)`);

    // 7. Create Product Images
    await ProductImage.insertMany([
      { product: products[0]._id, url: 'https://picsum.photos/seed/iphone1/800/800', isPrimary: true, altText: 'iPhone 15 Pro Max' },
      { product: products[0]._id, url: 'https://picsum.photos/seed/iphone2/800/800', isPrimary: false, altText: 'iPhone 15 Pro Max Back' },
      { product: products[1]._id, url: 'https://picsum.photos/seed/samsung1/800/800', isPrimary: true, altText: 'Samsung Galaxy S24 Ultra' },
      { product: products[2]._id, url: 'https://picsum.photos/seed/macbook1/800/800', isPrimary: true, altText: 'MacBook Pro 16' },
      { product: products[3]._id, url: 'https://picsum.photos/seed/sony1/800/800', isPrimary: true, altText: 'Sony WH-1000XM5' },
      { product: products[4]._id, url: 'https://picsum.photos/seed/tshirt1/800/800', isPrimary: true, altText: 'Cotton T-Shirt Set' },
      { product: products[5]._id, url: 'https://picsum.photos/seed/kurti1/800/800', isPrimary: true, altText: 'Designer Kurti' },
      { product: products[6]._id, url: 'https://picsum.photos/seed/cookware1/800/800', isPrimary: true, altText: 'Cookware Set' },
      { product: products[7]._id, url: 'https://picsum.photos/seed/chair1/800/800', isPrimary: true, altText: 'Office Chair' },
      { product: products[8]._id, url: 'https://picsum.photos/seed/yoga1/800/800', isPrimary: true, altText: 'Yoga Mat' },
      { product: products[9]._id, url: 'https://picsum.photos/seed/dumbbell1/800/800', isPrimary: true, altText: 'Dumbbell Set' },
      { product: products[10]._id, url: 'https://picsum.photos/seed/books1/800/800', isPrimary: true, altText: 'Book Bundle' },
      { product: products[11]._id, url: 'https://picsum.photos/seed/skincare1/800/800', isPrimary: true, altText: 'Skincare Gift Set' },
    ]);
    console.log('✓ Product images created (13 images)');

    // 8. Create Banners
    await Banner.insertMany([
      { title: 'Mega Sale Week', subtitle: 'Up to 50% off on Electronics', imageUrl: 'https://picsum.photos/seed/banner1/1200/400', linkUrl: '/products?category=electronics', buttonText: 'Shop Now', position: 'HOME_HERO', isActive: true, sortOrder: 1 },
      { title: 'Fashion Fest', subtitle: 'New Summer Collection 2024', imageUrl: 'https://picsum.photos/seed/banner2/1200/400', linkUrl: '/products?category=fashion', buttonText: 'Explore', position: 'HOME_PROMO', isActive: true, sortOrder: 2 },
      { title: 'Fitness Frenzy', subtitle: 'Get fit with our sports collection', imageUrl: 'https://picsum.photos/seed/banner3/1200/400', linkUrl: '/categories', buttonText: 'View More', position: 'HOME_HERO', isActive: true, sortOrder: 3 },
    ]);
    console.log('✓ Banners created (3 banners)');

    // 9. Create Coupons
    await Coupon.insertMany([
      { code: 'WELCOME10', type: 'PERCENTAGE', value: 10, minOrderAmount: 500, maxDiscountAmount: 200, usageLimit: 1000, perUserLimit: 1, validFrom: new Date('2024-01-01'), validUntil: new Date('2025-12-31'), isActive: true },
      { code: 'FLAT200', type: 'FIXED', value: 200, minOrderAmount: 1500, maxDiscountAmount: 200, usageLimit: 500, perUserLimit: 1, validFrom: new Date('2024-01-01'), validUntil: new Date('2025-12-31'), isActive: true },
      { code: 'MEGA20', type: 'PERCENTAGE', value: 20, minOrderAmount: 2000, maxDiscountAmount: 500, usageLimit: 200, perUserLimit: 1, validFrom: new Date('2024-01-01'), validUntil: new Date('2025-12-31'), isActive: true },
    ]);
    console.log('✓ Coupons created (3 coupons)');

    console.log('\n✅ Seed data inserted successfully!');
    console.log('   Admin: admin@yopmail.com / password123');
    console.log('   Customer: john.doe@yopmail.com / password123');
    console.log('   Vendors (5): rajesh.kumar, priya.sharma, amit.patel, suresh.verma, neha.gupta @yopmail.com / password123');
  } catch (error) {
    console.error('\n❌ Seed error:', error.message);
    throw error;
  }
};

// Run standalone if script is executed directly
if (require.main === module) {
  const connectDB = require('../config/db');

  (async () => {
    try {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
      console.log(`Connecting to MongoDB: ${uri}`);
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
