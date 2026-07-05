const express = require('express');
const router = express.Router();
const addressController = require('../controllers/address.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/', authenticate, addressController.getAddresses);
router.post('/', authenticate, addressController.addAddress);
router.put('/:addressId', authenticate, addressController.updateAddress);
router.delete('/:addressId', authenticate, addressController.deleteAddress);
router.put('/:addressId/default', authenticate, addressController.setDefaultAddress);

module.exports = router;
