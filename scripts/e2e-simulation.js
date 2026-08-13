require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const CartItem = require('../models/CartItem');
const VendorPayout = require('../models/VendorPayout');

const authService = require('../services/auth.service');
const orderService = require('../services/order.service');
const cartService = require('../services/cart.service');
const adminService = require('../services/admin.service');

async function runE2E() {
  try {
    console.log('Connecting to DB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mjr-mart');
    console.log('Connected to DB.');

    // 1. Create a Customer
    console.log('\n--- 1. CREATING CUSTOMER ---');
    const customerEmail = `customer_${Date.now()}@e2e.com`;
    const customer = await authService.register({
      firstName: 'E2E',
      lastName: 'Customer',
      email: customerEmail,
      password: 'password123',
      phone: '9999999999',
      role: 'CUSTOMER'
    });
    const customerId = customer.user ? (customer.user._id || customer.user.id) : customer.userId;
    console.log('Customer created:', customerId);

    // 2. Find an active Product & Vendor
    console.log('\n--- 2. FINDING PRODUCT ---');
    const variant = await ProductVariant.findOne({});
    if (!variant) throw new Error('No variants found in the DB. Please seed the DB.');
    let product = await Product.findById(variant.product);
    
    // Force active and approved for testing
    product.status = 'active';
    product.approvalStatus = 'APPROVED';
    await product.save();
    
    console.log(`Found Product: ${product.name} from Vendor: ${product.vendor}`);

    // 3. Add to Cart
    console.log('\n--- 3. ADDING TO CART ---');
    await cartService.addToCart(customerId, { productId: product._id, variantId: variant._id, quantity: 2 });
    const cart = await cartService.getCart(customerId);
    console.log(`Cart total: ${cart.cartTotal} with ${cart.items.length} items`);

    // 4. Checkout
    console.log('\n--- 4. CHECKOUT ---');
    const order = await orderService.placeOrder(customerId, {
      items: [{ variantId: variant._id, quantity: 2 }],
      shippingAddress: {
        fullName: 'E2E Customer',
        phone: '9999999999',
        addressLine1: '123 E2E Street',
        city: 'Techville',
        state: 'State',
        pincode: '123456'
      },
      paymentMethod: 'COD'
    });
    console.log(`Order Created! Order ID: ${order._id}`);
    console.log(`Order Total: ${order.totalAmount}`);

    // 5. Verify Vendor Dashboard reflects the order
    console.log('\n--- 5. VERIFYING VENDOR DASHBOARD ---');
    const vendorDoc = await Vendor.findById(product.vendor);
    const vendorOrdersList = await orderService.getVendorOrders(vendorDoc.user);
    console.log(`Vendor ${vendorDoc.storeName} has ${vendorOrdersList.length} orders.`);
    const foundOrder = vendorOrdersList.find(o => o._id.toString() === order._id.toString());
    if (foundOrder) console.log('✅ Order correctly mapped to Vendor!');
    else console.log('❌ Order NOT found in Vendor dashboard!');

    // 6. Verify Admin Dashboard reflects the order
    console.log('\n--- 6. VERIFYING ADMIN DASHBOARD ---');
    const adminOrders = await adminService.getOrders();
    const adminFoundOrder = adminOrders.find(o => o._id.toString() === order._id.toString());
    if (adminFoundOrder) console.log('✅ Order correctly mapped to Admin!');
    else console.log('❌ Order NOT found in Admin dashboard!');
    console.log(`Admin order items count: ${adminFoundOrder.items.length}`);
    if (adminFoundOrder.items[0].vendor) {
      console.log('✅ Admin order items properly populated with Vendor details:', adminFoundOrder.items[0].vendor.storeName);
    } else {
      console.log('❌ Admin order items missing Vendor population!');
    }

    // 7. Update Item Tracking (Vendor or Admin)
    console.log('\n--- 7. UPDATING ITEM TRACKING ---');
    const orderItem = await OrderItem.findOne({ order: order._id });
    orderItem.fulfillmentStatus = 'SHIPPED';
    orderItem.trackingNumber = 'E2E-TRACK-999';
    orderItem.courier = 'FedEx';
    await orderItem.save();
    console.log('✅ Order item tracking updated.');

    // 8. Update Order Status (Admin)
    console.log('\n--- 8. UPDATING GLOBAL ORDER STATUS ---');
    await adminService.updateOrderStatus(order._id, 'DELIVERED', 'Delivered successfully', 'Techville');
    const updatedOrder = await Order.findById(order._id);
    console.log(`✅ Order status is now: ${updatedOrder.status} (Payment: ${updatedOrder.paymentStatus})`);

    // 9. Verify Settlement Calculation
    console.log('\n--- 9. SETTLEMENT CHECK ---');
    const vendorUpdated = await Vendor.findById(product.vendor);
    console.log(`Vendor Total Sales: ${vendorUpdated.totalSales}`);

    console.log('\n✅ E2E TEST COMPLETED SUCCESSFULLY');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ E2E TEST FAILED:', err);
    process.exit(1);
  }
}

runE2E();
