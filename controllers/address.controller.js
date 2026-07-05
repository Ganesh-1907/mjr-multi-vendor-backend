const addressService = require('../services/address.service');
const ApiResponse = require('../utils/ApiResponse');

const getAddresses = async (req, res, next) => {
  try {
    const addresses = await addressService.getAddresses(req.user.userId);
    res.json(ApiResponse.success(addresses));
  } catch (error) {
    next(error);
  }
};

const addAddress = async (req, res, next) => {
  try {
    const address = await addressService.addAddress(req.user.userId, req.body);
    res.json(ApiResponse.success(address, 'Address added'));
  } catch (error) {
    next(error);
  }
};

const updateAddress = async (req, res, next) => {
  try {
    const address = await addressService.updateAddress(req.params.addressId, req.user.userId, req.body);
    res.json(ApiResponse.success(address, 'Address updated'));
  } catch (error) {
    next(error);
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    await addressService.deleteAddress(req.params.addressId, req.user.userId);
    res.json(ApiResponse.success(null, 'Address deleted'));
  } catch (error) {
    next(error);
  }
};

const setDefaultAddress = async (req, res, next) => {
  try {
    const address = await addressService.setDefaultAddress(req.params.addressId, req.user.userId);
    res.json(ApiResponse.success(address, 'Default address set'));
  } catch (error) {
    next(error);
  }
};

module.exports = { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress };
