const Notification = require('../models/Notification');
const { AppError } = require('./auth.service');

const getUserNotifications = async (userId) => {
  return Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(50);
};

const getUnreadCount = async (userId) => {
  return Notification.countDocuments({ user: userId, isRead: false });
};

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({ _id: notificationId, user: userId });
  if (!notification) throw new AppError('Notification not found', 404);
  notification.isRead = true;
  await notification.save();
  return notification;
};

const markAllAsRead = async (userId) => {
  await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
};

const deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findOneAndDelete({ _id: notificationId, user: userId });
  if (!notification) throw new AppError('Notification not found', 404);
};

const createNotification = async (userId, { title, message, type, referenceType, referenceId }) => {
  return Notification.create({ user: userId, title, message, type, referenceType, referenceId });
};

module.exports = { getUserNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification, createNotification };
