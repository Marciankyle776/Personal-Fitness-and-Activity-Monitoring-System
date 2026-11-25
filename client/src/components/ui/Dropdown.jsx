import { useEffect, useId, useRef, useState } from "react";
import { cn } from "../../utils/format";

// Disclosure popover. `children` can be a node or a function receiving { close }.
// Closes on Escape (returning focus to the button), on outside click, and when keyboard focus leaves it.
export default function Dropdown({ trigger, children, align = "right", label, panelClassName }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const buttonRef = useRef(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const outside = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => {
      if (e.key === "Escape") { setOpen(false); buttonRef.current?.focus(); }
    };
    document.addEventListener("mousedown", outside);
    document.addEventListener("focusin", outside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", outside);
      document.removeEventListener("focusin", outside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button ref={buttonRef} type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls={open ? panelId : undefined} aria-label={label} className="rounded-xl">
        {trigger}
      </button>
      {open && (
        <div id={panelId} className={cn("absolute z-40 mt-2 rounded-xl border border-slate-200 bg-white shadow-pop", align === "right" ? "right-0" : "left-0", panelClassName || "w-56")}>
          {typeof children === "function" ? children({ close: () => setOpen(false) }) : children}
        </div>
      )}
    </div>
  );
}
