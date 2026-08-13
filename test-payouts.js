require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const VendorPayout = require('./models/VendorPayout');
const Vendor = require('./models/Vendor');
const User = require('./models/User');
const payoutService = require('./services/payout.service');

async function run() {
  await connectDB();
  
  // Find a vendor
  const vendor = await Vendor.findOne().populate('user');
  if (!vendor) {
    console.log('No vendor found');
    process.exit(0);
  }
  
  console.log('Vendor:', vendor.storeName, vendor._id);
  
  // Create a payout
  const payout = await payoutService.createPayout(vendor._id, 500, new Date(), new Date(), 'Test Payout');
  console.log('Created Payout:', payout);
  
  // Get vendor payouts as vendor would
  const vendorPayouts = await payoutService.getVendorPayouts(vendor._id);
  console.log('Vendor Payouts (vendor ID):', vendorPayouts.map(p => ({ id: p._id, vendor: p.vendor })));
  
  // What does it look like when not populated?
  const raw = await VendorPayout.find({ vendor: vendor._id }).lean();
  console.log('Raw Lean:', raw.map(p => ({ id: p._id, vendor: p.vendor })));
  
  // Does it match the string ID in frontend?
  const stringVendorId = vendor._id.toString();
  const rawString = raw[0].vendor.toString();
  console.log('Match string:', stringVendorId === rawString);
  
  process.exit(0);
}

run();
