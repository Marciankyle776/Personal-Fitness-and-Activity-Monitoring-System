import { Link, useLocation, useNavigate } from "react-router-dom";
import { Activity, ChevronDown, Dumbbell, ListChecks, LogOut, Menu, Plus, Settings, Target, User } from "lucide-react";
import Dropdown from "../ui/Dropdown";
import Avatar from "../ui/Avatar";
import NotificationBell from "./NotificationBell";
import { NAV_ITEMS } from "./navItems";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const QUICK_ADD = [
  { to: "/activities?new=1", label: "Add activity", icon: Activity },
  { to: "/workouts?new=1", label: "Log workout", icon: Dumbbell },
  { to: "/routines?new=1", label: "New routine", icon: ListChecks },
  { to: "/goals?new=1", label: "New goal", icon: Target },
];

export default function Navbar({ onMenu }) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const current = NAV_ITEMS.find((i) => (i.end ? pathname === i.to : pathname.startsWith(i.to)));

  const handleLogout = async () => {
    await logout();
    toast.success("You have been signed out.");
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
      <button className="icon-btn lg:hidden" onClick={onMenu} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
      <p className="flex-1 truncate text-base font-bold text-slate-900">{current?.label || "FitTrack"}</p>

      <Dropdown
        label="Quick add"
        panelClassName="w-52"
        trigger={<span className="flex min-h-10 items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 text-sm font-semibold text-white hover:bg-emerald-800"><Plus className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">Add</span></span>}
      >
        {({ close }) => (
          <div className="py-1.5">
            {QUICK_ADD.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={close} className="flex min-h-11 items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-slate-50"><Icon className="h-4 w-4 text-slate-600" aria-hidden="true" /> {label}</Link>
            ))}
          </div>
        )}
      </Dropdown>

      <NotificationBell />

      <Dropdown
        label={`Account menu for ${user?.fullName}`}
        trigger={
          <span className="flex items-center gap-2 rounded-xl p-1 pr-2 hover:bg-slate-100">
            <Avatar user={user} size="sm" />
            <span className="hidden max-w-[9rem] truncate text-sm font-semibold sm:block">{user?.fullName}</span>
            <ChevronDown className="h-4 w-4 text-slate-500" aria-hidden="true" />
          </span>
        }
      >
        {({ close }) => (
          <div className="py-1.5">
            <div className="border-b border-slate-100 px-4 pb-2.5 pt-1.5">
              <p className="truncate text-sm font-bold">{user?.fullName}</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
            <Link to="/profile" onClick={close} className="flex min-h-11 items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-slate-50"><User className="h-4 w-4" /> Profile</Link>
            <Link to="/settings" onClick={close} className="flex min-h-11 items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-slate-50"><Settings className="h-4 w-4" /> Settings</Link>
            <button onClick={handleLogout} className="flex min-h-11 w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-700 hover:bg-red-50"><LogOut className="h-4 w-4" /> Logout</button>
          </div>
        )}
      </Dropdown>
    </header>
  );
}
