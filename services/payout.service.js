const VendorPayout = require('../models/VendorPayout');
const { nanoid } = require('nanoid');
const { AppError } = require('./auth.service');

const generatePayoutNumber = () => {
  const date = new Date();
  return `PYT-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${nanoid(6).toUpperCase()}`;
};

const createPayout = async (vendorId, amount, periodStart, periodEnd, notes) => {
  const payoutNumber = generatePayoutNumber();
  return VendorPayout.create({
    vendor: vendorId,
    payoutNumber,
    amount,
    periodStart,
    periodEnd,
    status: 'PENDING',
    notes,
  });
};

const updatePayoutStatus = async (payoutId, status) => {
  const update = { status };
  if (status === 'COMPLETED') update.processedAt = new Date();

  const payout = await VendorPayout.findByIdAndUpdate(payoutId, update, { new: true }).populate({ path: 'vendor', populate: { path: 'user' } });
  if (!payout) throw new AppError('Payout not found', 404);

  if (status === 'COMPLETED' && payout.vendor && payout.vendor.user && payout.vendor.user.email) {
    const { sendPayoutProcessedEmail } = require('../utils/email');
    await sendPayoutProcessedEmail(payout.vendor.user.email, payout.amount, payout.payoutNumber).catch(err => console.error('Email error:', err));
  }

  return payout;
};

const getVendorPayouts = async (vendorId) => {
  return VendorPayout.find({ vendor: vendorId }).populate('vendor', 'storeName').sort({ createdAt: -1 });
};

const getAllPayouts = async () => {
  return VendorPayout.find().populate('vendor', 'storeName').sort({ createdAt: -1 });
};

const deletePayout = async (idOrPayoutNumber) => {
  const mongoose = require('mongoose');
  const query = mongoose.isValidObjectId(idOrPayoutNumber)
    ? { _id: idOrPayoutNumber }
    : { payoutNumber: idOrPayoutNumber };
  const payout = await VendorPayout.findOneAndDelete(query);
  if (!payout) throw new AppError('Payout not found', 404);
};

module.exports = { createPayout, updatePayoutStatus, getVendorPayouts, getAllPayouts, deletePayout };
