const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['order', 'promotion', 'system', 'review', 'refund', 'product'],
      default: 'system',
    },
    referenceType: { type: String },
    referenceId: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
