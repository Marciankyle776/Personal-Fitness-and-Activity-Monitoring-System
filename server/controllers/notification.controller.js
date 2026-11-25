import Notification from "../models/Notification.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

export const list = asyncHandler(async (req, res) => {
  const { page, limit, unread } = req.query;
  const filter = { user: req.user.id, ...(unread === "true" && { isRead: false }) };
  const [items, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: req.user.id, isRead: false }),
  ]);
  res.json({
    success: true,
    data: { items, unreadCount, pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) } },
  });
});

export const markRead = asyncHandler(async (req, res) => {
  const item = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { isRead: true },
    { new: true }
  );
  if (!item) throw new AppError("Notification not found", 404);
  res.json({ success: true, message: "Notification marked as read", data: { item } });
});

export const markAllRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
  res.json({ success: true, message: "All notifications marked as read", data: { updated: result.modifiedCount } });
});
