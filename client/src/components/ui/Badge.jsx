import { CATEGORY_STYLES } from "../../utils/constants";
import { cn } from "../../utils/format";

export default function Badge({ children, className }) {
  return <span className={cn("badge", CATEGORY_STYLES[children] || "bg-slate-100 text-slate-600", className)}>{children}</span>;
}

export const StatusBadge = ({ status }) => {
  const styles = { active: "bg-sky-50 text-sky-700", completed: "bg-emerald-50 text-emerald-700", paused: "bg-amber-50 text-amber-700" };
  return <span className={cn("badge capitalize", styles[status])}>{status}</span>;
};
