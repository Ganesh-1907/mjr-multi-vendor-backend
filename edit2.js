const fs = require('fs');
const path = require('path');
const file = path.join(process.cwd(), 'controllers', 'admin.controller.js');
let content = fs.readFileSync(file, 'utf8');

const insertCode = `
const updateOrderItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { fulfillmentStatus, trackingNumber, courier } = req.body;
    
    const OrderItem = require('../models/OrderItem');
    const orderItem = await OrderItem.findById(itemId);
    if (!orderItem) return res.status(404).json(ApiResponse.error('Order item not found'));

    if (fulfillmentStatus !== undefined) orderItem.fulfillmentStatus = fulfillmentStatus;
    if (trackingNumber !== undefined) orderItem.trackingNumber = trackingNumber;
    if (courier !== undefined) orderItem.courier = courier;

    await orderItem.save();
    res.json(ApiResponse.success(orderItem, 'Order item updated'));
  } catch (error) {
    next(error);
  }
};
`;

content = content.replace('// Categories', insertCode + '\n// Categories');
content = content.replace('getOrders, updateOrderStatus,', 'getOrders, updateOrderStatus, updateOrderItem,');
fs.writeFileSync(file, content, 'utf8');
console.log('Modified admin.controller.js');
