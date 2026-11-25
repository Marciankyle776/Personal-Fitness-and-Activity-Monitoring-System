import { useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { LogOut, X } from "lucide-react";
import Logo from "./Logo";
import { NAV_ITEMS } from "./navItems";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { useToast } from "../../context/ToastContext";
import { cn } from "../../utils/format";

export default function Sidebar({ open, onClose }) {
  const { logout } = useAuth();
  const { unreadCount } = useNotifications();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { onClose(); }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    await logout();
    toast.success("You have been signed out.");
    navigate("/login", { replace: true });
  };

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden" onClick={onClose} aria-hidden="true" />}
      <aside
        aria-label="Main navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Logo />
          <button className="icon-btn lg:hidden" onClick={onClose} aria-label="Close menu"><X className="h-5 w-5" /></button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                  isActive ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="flex-1">{label}</span>
              {badge && unreadCount > 0 && (
                <span className="rounded-full bg-emerald-700 px-2 py-0.5 text-xs font-bold text-white" aria-label={`${unreadCount} unread`}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-100 p-3">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-700">
            <LogOut className="h-5 w-5" aria-hidden="true" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
