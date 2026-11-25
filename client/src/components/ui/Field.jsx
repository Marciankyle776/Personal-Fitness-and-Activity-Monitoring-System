import { Children, cloneElement, isValidElement } from "react";

// Label + control + hint + validation message. Pass the same `id` to the control.
// The control automatically gets aria-describedby / aria-invalid / aria-required, so screen readers
// announce the hint and the error with the field.
export default function Field({ label, id, error, hint, required, children, className = "" }) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined;

  const enhanced = Children.map(children, (child) =>
    isValidElement(child) && child.props.id === id
      ? cloneElement(child, {
          "aria-describedby": describedBy,
          "aria-invalid": error ? "true" : undefined,
          "aria-required": required ? "true" : undefined,
        })
      : child
  );

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="label">
          {label}
          {required && <span aria-hidden="true" className="text-red-700"> *</span>}
        </label>
      )}
      {enhanced}
      {hint && <p id={hintId} className="mt-1.5 text-xs text-slate-600">{hint}</p>}
      {error && <p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-red-700">{error}</p>}
    </div>
  );
}
