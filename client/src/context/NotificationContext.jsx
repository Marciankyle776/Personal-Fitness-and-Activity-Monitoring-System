import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { notificationService } from "../services/resources";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const userId = user?._id;

  const refresh = useCallback(async () => {
    if (!userId) return;
    try {
      const d = await notificationService.list({ limit: 8 });
      setItems(d.items);
      setUnreadCount(d.unreadCount);
    } catch { /* the badge is non-critical; ignore transient failures */ }
  }, [userId]);

  useEffect(() => {
    if (!userId) { setItems([]); setUnreadCount(0); return undefined; }
    refresh();
    const id = setInterval(refresh, 60000);
    const onVisible = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVisible);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", onVisible); };
  }, [userId, refresh]);

  const markRead = useCallback(async (id) => {
    await notificationService.markRead(id);
    await refresh();
  }, [refresh]);

  const markAllRead = useCallback(async () => {
    await notificationService.markAllRead();
    await refresh();
  }, [refresh]);

  const value = useMemo(() => ({ items, unreadCount, refresh, markRead, markAllRead }), [items, unreadCount, refresh, markRead, markAllRead]);
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationProvider");
  return ctx;
};
