// Form-level error banner (role="alert" so screen readers announce it when it appears).
export default function FormError({ message }) {
  if (!message) return null;
  return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{message}</div>;
}
