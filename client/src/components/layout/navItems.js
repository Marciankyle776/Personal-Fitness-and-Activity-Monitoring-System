import { Activity, BarChart3, Bell, Dumbbell, LayoutDashboard, ListChecks, Settings, Target, User } from "lucide-react";

export const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/activities", label: "Activities", icon: Activity },
  { to: "/workouts", label: "Workouts", icon: Dumbbell },
  { to: "/routines", label: "Workout Routines", icon: ListChecks },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/notifications", label: "Notifications", icon: Bell, badge: true },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
];
