// A row of toggle buttons that filters a list. aria-pressed marks the active choice.
export default function FilterTabs({ label, options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
      {options.map(([optionValue, optionLabel]) => (
        <button
          key={optionLabel}
          type="button"
          aria-pressed={value === optionValue}
          onClick={() => onChange(optionValue)}
          className={`min-h-10 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
            value === optionValue ? "bg-emerald-700 text-white" : "border border-slate-500 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          {optionLabel}
        </button>
      ))}
    </div>
  );
}
