import { Link, useNavigate } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
import Dropdown from "../ui/Dropdown";
import { useNotifications } from "../../context/NotificationContext";
import { useToast } from "../../context/ToastContext";
import { timeAgo } from "../../utils/format";

export default function NotificationBell() {
  const { items, unreadCount, markRead, markAllRead } = useNotifications();
  const toast = useToast();
  const navigate = useNavigate();

  const handleOpen = async (n, close) => {
    close();
    try { if (!n.isRead) await markRead(n._id); } catch { /* non-critical */ }
    if (n.link) navigate(n.link);
  };

  const handleAll = async () => {
    try { await markAllRead(); } catch (e) { toast.error(e.userMessage); }
  };

  return (
    <Dropdown
      label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
      panelClassName="w-[22rem] max-w-[calc(100vw-2rem)]"
      trigger={
        <span className="icon-btn relative">
          <Bell className="h-5 w-5" aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-700 px-1 text-[11px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </span>
      }
    >
      {({ close }) => (
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-bold">Notifications</p>
            <button onClick={handleAll} disabled={!unreadCount} className="flex items-center gap-1 text-xs font-semibold text-emerald-700 disabled:text-slate-500">
              <CheckCheck className="h-4 w-4" /> Mark all as read
            </button>
          </div>
          <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
            {items.length === 0 && <li className="px-4 py-8 text-center text-sm text-slate-500">You're all caught up.</li>}
            {items.map((n) => (
              <li key={n._id}>
                <button onClick={() => handleOpen(n, close)} className="flex w-full gap-3 px-4 py-3 text-left hover:bg-slate-50">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.isRead ? "bg-transparent" : "bg-emerald-500"}`} aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{n.title}</span>
                    <span className="line-clamp-2 text-xs text-slate-500">{n.message}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">{timeAgo(n.createdAt)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <Link to="/notifications" onClick={close} className="block border-t border-slate-100 px-4 py-3 text-center text-sm font-semibold text-emerald-700 hover:bg-slate-50">
            View all notifications
          </Link>
        </div>
      )}
    </Dropdown>
  );
}
