const express = require('express');
const router = express.Router();
const supportController = require('../controllers/support.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/tickets', authenticate, supportController.createTicket);
router.get('/tickets', authenticate, supportController.getUserTickets);
router.get('/tickets/:ticketId', authenticate, supportController.getTicketById);
router.post('/tickets/:ticketId/responses', authenticate, supportController.addResponse);

module.exports = router;
