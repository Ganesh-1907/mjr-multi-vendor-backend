const Address = require('../models/Address');
const { AppError } = require('./auth.service');

const getAddresses = async (userId) => {
  return Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
};

const addAddress = async (userId, request) => {
  if (request.isDefault) {
    await Address.updateMany({ user: userId }, { isDefault: false });
  }

  const address = await Address.create({ ...request, user: userId });
  return address;
};

const updateAddress = async (addressId, userId, request) => {
  const address = await Address.findOne({ _id: addressId, user: userId });
  if (!address) throw new AppError('Address not found', 404);

  if (request.isDefault) {
    await Address.updateMany({ user: userId }, { isDefault: false });
  }

  Object.assign(address, request);
  await address.save();
  return address;
};

const deleteAddress = async (addressId, userId) => {
  const address = await Address.findOne({ _id: addressId, user: userId });
  if (!address) throw new AppError('Address not found', 404);

  await Address.deleteOne({ _id: addressId });
};

const setDefaultAddress = async (addressId, userId) => {
  const address = await Address.findOne({ _id: addressId, user: userId });
  if (!address) throw new AppError('Address not found', 404);

  await Address.updateMany({ user: userId }, { isDefault: false });
  address.isDefault = true;
  await address.save();
  return address;
};

module.exports = { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress };
