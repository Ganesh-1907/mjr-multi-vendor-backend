const SupportTicket = require('../models/SupportTicket');
const TicketResponse = require('../models/TicketResponse');
const { nanoid } = require('nanoid');
const { AppError } = require('./auth.service');

const generateTicketNumber = async () => {
  const date = new Date();
  const prefix = `TKT-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-`;
  const suffix = nanoid(6).toUpperCase();
  return `${prefix}${suffix}`;
};

const createTicket = async (userId, request) => {
  const ticketNumber = await generateTicketNumber();
  return SupportTicket.create({
    ticketNumber,
    user: userId,
    subject: request.subject,
    message: request.message,
    category: request.category,
    priority: request.priority || 'MEDIUM',
    status: 'OPEN',
  });
};

const getUserTickets = async (userId) => {
  return SupportTicket.find({ user: userId })
    .sort({ createdAt: -1 })
    .lean();
};

const getTicketById = async (ticketId, userId) => {
  const ticket = await SupportTicket.findById(ticketId).populate('user', 'firstName lastName email').lean();
  if (!ticket) throw new AppError('Ticket not found', 404);
  if (ticket.user._id.toString() !== userId.toString()) {
    // Also allow admin to view any ticket
    const User = require('../models/User');
    const user = await User.findById(userId).populate('role');
    if (user.role.name !== 'ADMIN') throw new AppError('Not authorized', 403);
  }

  const responses = await TicketResponse.find({ ticket: ticketId })
    .populate('user', 'firstName lastName role')
    .sort({ createdAt: 1 })
    .lean();

  return { ...ticket, responses };
};

const addTicketResponse = async (ticketId, userId, message) => {
  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) throw new AppError('Ticket not found', 404);

  // If ticket is closed or resolved, reopen it
  if (['RESOLVED', 'CLOSED'].includes(ticket.status)) {
    ticket.status = 'IN_PROGRESS';
    await ticket.save();
  }

  return TicketResponse.create({
    ticket: ticketId,
    user: userId,
    message,
    isInternal: false,
  });
};

const getAllTickets = async () => {
  return SupportTicket.find().populate('user', 'firstName lastName email').sort({ createdAt: -1 }).lean();
};

const assignTicket = async (ticketId, adminUserId) => {
  const ticket = await SupportTicket.findByIdAndUpdate(ticketId, { assignedTo: adminUserId }, { new: true });
  if (!ticket) throw new AppError('Ticket not found', 404);
  return ticket;
};

const updateTicketStatus = async (ticketId, status) => {
  const ticket = await SupportTicket.findByIdAndUpdate(ticketId, { status }, { new: true });
  if (!ticket) throw new AppError('Ticket not found', 404);
  return ticket;
};

module.exports = { createTicket, getUserTickets, getTicketById, addTicketResponse, getAllTickets, assignTicket, updateTicketStatus };
