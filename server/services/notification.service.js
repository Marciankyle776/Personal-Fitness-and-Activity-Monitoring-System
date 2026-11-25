import Notification from "../models/Notification.js";
import User from "../models/User.js";

// Never throws: a failed notification must not break the main operation.
// Respects the user's notificationsEnabled preference unless force is true.
export const createNotification = async (
  userId,
  { title, message, type = "system", link = "" },
  { force = false } = {}
) => {
  try {
    if (!force) {
      const user = await User.findById(userId).select("preferences.notificationsEnabled");
      if (user && user.preferences?.notificationsEnabled === false) return null;
    }
    return await Notification.create({ user: userId, title, message, type, link });
  } catch (error) {
    console.error(`Failed to create notification: ${error.message}`);
    return null;
  }
};
