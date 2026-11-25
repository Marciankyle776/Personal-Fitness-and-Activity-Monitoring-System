import { Search } from "lucide-react";

export default function SearchInput({ value, onChange, placeholder = "Search...", label = "Search" }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={label} className="input pl-10" />
    </div>
  );
}
