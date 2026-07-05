const mongoose = require('mongoose');

const ticketResponseSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SupportTicket',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: { type: String, required: true },
    isInternal: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TicketResponse', ticketResponseSchema);
