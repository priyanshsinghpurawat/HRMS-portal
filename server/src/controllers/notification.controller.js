import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Notification } from "../models/Notification.model.js";

export const getMyNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(50);
    return res.status(200).json(new ApiResponse(200, notifications, "Notifications fetched"));
});

export const getUnreadCount = asyncHandler(async (req, res) => {
    const count = await Notification.countDocuments({ user: req.user._id, isRead: false });
    return res.status(200).json(new ApiResponse(200, { count }, "Unread count"));
});

export const markAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { user: req.user._id, isRead: false },
        { isRead: true }
    );
    return res.status(200).json(new ApiResponse(200, {}, "Marked all as read"));
});

export const markOneAsRead = asyncHandler(async (req, res) => {
    await Notification.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { isRead: true }
    );
    return res.status(200).json(new ApiResponse(200, {}, "Marked as read"));
});
