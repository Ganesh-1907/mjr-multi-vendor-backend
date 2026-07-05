const supportService = require('../services/support.service');
const ApiResponse = require('../utils/ApiResponse');

const createTicket = async (req, res, next) => {
  try {
    const ticket = await supportService.createTicket(req.user.userId, req.body);
    res.json(ApiResponse.success(ticket, 'Ticket created'));
  } catch (error) {
    next(error);
  }
};

const getUserTickets = async (req, res, next) => {
  try {
    const tickets = await supportService.getUserTickets(req.user.userId);
    res.json(ApiResponse.success(tickets));
  } catch (error) {
    next(error);
  }
};

const getTicketById = async (req, res, next) => {
  try {
    const ticket = await supportService.getTicketById(req.params.ticketId, req.user.userId);
    res.json(ApiResponse.success(ticket));
  } catch (error) {
    next(error);
  }
};

const addResponse = async (req, res, next) => {
  try {
    const response = await supportService.addTicketResponse(req.params.ticketId, req.user.userId, req.body.message);
    res.json(ApiResponse.success(response, 'Response added'));
  } catch (error) {
    next(error);
  }
};

module.exports = { createTicket, getUserTickets, getTicketById, addResponse };
