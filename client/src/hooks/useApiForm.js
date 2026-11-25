import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { applyServerErrors } from "../utils/forms";

// One place for the form pattern used across the app:
//  - client-side Zod validation, checked when a field is left ("onTouched") and re-checked as the user types
//  - server validation errors mapped back onto the matching fields
//  - a form-level error message for everything else
//  - a guard that ignores a second submit while one is still running (double click, repeated Enter)
export default function useApiForm({ schema, defaultValues, onSubmit, mode = "onTouched" }) {
  const form = useForm({ resolver: zodResolver(schema), defaultValues, mode });
  const [formError, setFormError] = useState("");
  const inFlight = useRef(false);

  const submit = form.handleSubmit(async (values) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setFormError("");
    try {
      await onSubmit(values);
    } catch (err) {
      applyServerErrors(err, form.setError);
      setFormError(err.userMessage || "Something went wrong. Please try again.");
    } finally {
      inFlight.current = false;
    }
  });

  return { form, formError, submit };
}
