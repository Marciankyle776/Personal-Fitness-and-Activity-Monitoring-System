import { Loader2 } from "lucide-react";
import { cn } from "../../utils/format";

const VARIANTS = { primary: "btn-primary", secondary: "btn-secondary", danger: "btn-danger", ghost: "btn-ghost" };

export default function Button({ variant = "primary", size, loading = false, icon: Icon, children, className, disabled, type = "button", ...props }) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn("btn", VARIANTS[variant], size === "sm" && "btn-sm", className)}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
