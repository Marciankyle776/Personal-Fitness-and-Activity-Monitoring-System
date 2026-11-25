import { AVATAR_COLORS } from "../../utils/constants";
import { cn, initials } from "../../utils/format";

export default function Avatar({ user, size = "md", className }) {
  const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-20 w-20 text-2xl" };
  const avatar = user?.avatar || "";
  if (/^https:\/\//.test(avatar)) {
    return <img src={avatar} alt="" className={cn("rounded-full object-cover", sizes[size], className)} />;
  }
  const color = AVATAR_COLORS[avatar] || AVATAR_COLORS.emerald;
  return (
    <span className={cn("inline-flex items-center justify-center rounded-full font-bold text-white", color, sizes[size], className)} aria-hidden="true">
      {initials(user?.fullName)}
    </span>
  );
}
