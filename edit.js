const fs = require('fs');
const path = require('path');
const file = path.join(process.cwd(), 'controllers', 'admin.controller.js');
let content = fs.readFileSync(file, 'utf8');

const insertCode = `
const getPayouts = async (req, res, next) => {
  try {
    const payouts = await payoutService.getAllPayouts();
    res.json(ApiResponse.success(payouts));
  } catch (error) {
    next(error);
  }
};

const createPayout = async (req, res, next) => {
  try {
    const { vendorId, amount, method, reference, notes } = req.body;
    let payout = await payoutService.createPayout(vendorId, amount, new Date(), new Date(), notes || (method + ' - ' + reference));
    payout = await payoutService.updatePayoutStatus(payout._id, 'COMPLETED');
    res.json(ApiResponse.success(payout, 'Settlement created'));
  } catch (error) {
    next(error);
  }
};
`;

content = content.replace('module.exports = {', insertCode + '\nmodule.exports = {\n  getPayouts,\n  createPayout,');
fs.writeFileSync(file, content, 'utf8');
console.log('Modified admin.controller.js');
