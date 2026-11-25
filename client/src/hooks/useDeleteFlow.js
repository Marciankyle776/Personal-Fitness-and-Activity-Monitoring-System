import { useState } from "react";
import { useToast } from "../context/ToastContext";

// Confirm-then-delete state shared by every list page. Pair it with <ConfirmDialog>.
export default function useDeleteFlow({ remove, successMessage, onDone }) {
  const toast = useToast();
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await remove(target._id);
      toast.success(successMessage);
      setTarget(null);
      onDone?.();
    } catch (err) {
      toast.error(err.userMessage);
    } finally {
      setBusy(false);
    }
  };

  return { target, busy, ask: setTarget, cancel: () => setTarget(null), confirm };
}
