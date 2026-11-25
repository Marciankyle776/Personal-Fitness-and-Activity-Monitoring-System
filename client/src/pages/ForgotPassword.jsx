import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MailCheck } from "lucide-react";
import Field from "../components/ui/Field";
import FormError from "../components/ui/FormError";
import Button from "../components/ui/Button";
import { authService } from "../services/authService";
import { forgotSchema } from "../validations/schemas";
import useApiForm from "../hooks/useApiForm";
import usePageTitle from "../hooks/usePageTitle";

export default function ForgotPassword() {
  const [result, setResult] = useState(null);
  usePageTitle("Reset password");

  const { form: { register, formState: { errors, isSubmitting } }, formError, submit } = useApiForm({
    schema: forgotSchema,
    defaultValues: { email: "" },
    onSubmit: async (values) => setResult(await authService.forgotPassword(values)),
  });

  return (
    <div>
      <Link to="/login" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to sign in
      </Link>

      {result ? (
        <div role="status">
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><MailCheck className="h-6 w-6" /></span>
          <h1 className="text-3xl font-extrabold">Check your email</h1>
          <p className="mt-2 text-sm text-slate-600">{result.message} The link expires in 15 minutes.</p>
          {result.devResetUrl && (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-semibold">Development mode</p>
              <p className="mt-1">No email server is configured, so here is your reset link:</p>
              <a href={result.devResetUrl} className="mt-2 block break-all font-semibold underline">Open the reset page</a>
            </div>
          )}
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-extrabold">Reset your password</h1>
          <p className="mt-2 text-sm text-slate-600">Enter your account email and we'll send you a reset link.</p>
          <form onSubmit={submit} noValidate className="mt-8 space-y-5" aria-busy={isSubmitting}>
            <FormError message={formError} />
            <Field label="Email address" id="email" error={errors.email?.message} required>
              <input id="email" type="email" autoComplete="email" autoFocus placeholder="you@example.com" className={`input ${errors.email ? "input-error" : ""}`} {...register("email")} />
            </Field>
            <Button type="submit" loading={isSubmitting} className="w-full">{isSubmitting ? "Sending..." : "Send reset link"}</Button>
          </form>
        </>
      )}
    </div>
  );
}
