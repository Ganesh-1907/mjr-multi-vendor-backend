const notificationService = require('../services/notification.service');
const ApiResponse = require('../utils/ApiResponse');

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.user.userId);
    res.json(ApiResponse.success(notifications));
  } catch (error) {
    next(error);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.userId);
    res.json(ApiResponse.success(count));
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    await notificationService.markAsRead(req.params.notificationId, req.user.userId);
    res.json(ApiResponse.success(null, 'Marked as read'));
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user.userId);
    res.json(ApiResponse.success(null, 'All marked as read'));
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    await notificationService.deleteNotification(req.params.notificationId, req.user.userId);
    res.json(ApiResponse.success(null, 'Notification deleted'));
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification };
