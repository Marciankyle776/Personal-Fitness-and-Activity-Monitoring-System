import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Field from "../components/ui/Field";
import FormError from "../components/ui/FormError";
import PasswordInput from "../components/ui/PasswordInput";
import PasswordStrength from "../components/ui/PasswordStrength";
import Button from "../components/ui/Button";
import { authService } from "../services/authService";
import { useToast } from "../context/ToastContext";
import { resetSchema } from "../validations/schemas";
import useApiForm from "../hooks/useApiForm";
import usePageTitle from "../hooks/usePageTitle";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const toast = useToast();
  const navigate = useNavigate();
  usePageTitle("Choose a new password");

  const { form: { register, watch, formState: { errors, isSubmitting } }, formError, submit } = useApiForm({
    schema: resetSchema,
    defaultValues: { password: "", confirmPassword: "" },
    onSubmit: async (values) => {
      await authService.resetPassword({ token, ...values });
      toast.success("Password updated. Sign in with your new password.");
      navigate("/login", { replace: true });
    },
  });

  if (token.length !== 64) {
    return (
      <div role="alert">
        <h1 className="text-3xl font-extrabold">Invalid reset link</h1>
        <p className="mt-2 text-sm text-slate-600">This link is missing or incomplete. Request a new one to continue.</p>
        <Link to="/forgot-password" className="btn btn-primary mt-6">Request a new link</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold">Choose a new password</h1>
      <p className="mt-2 text-sm text-slate-600">Use a password you don't use anywhere else.</p>
      <form onSubmit={submit} noValidate className="mt-8 space-y-5" aria-busy={isSubmitting}>
        <FormError message={formError} />
        <Field label="New password" id="password" error={errors.password?.message} required>
          <PasswordInput id="password" autoComplete="new-password" autoFocus invalid={!!errors.password} {...register("password")} />
          <PasswordStrength password={watch("password")} />
        </Field>
        <Field label="Confirm new password" id="confirmPassword" error={errors.confirmPassword?.message} required>
          <PasswordInput id="confirmPassword" autoComplete="new-password" invalid={!!errors.confirmPassword} {...register("confirmPassword")} />
        </Field>
        <Button type="submit" loading={isSubmitting} className="w-full">{isSubmitting ? "Saving..." : "Reset password"}</Button>
      </form>
    </div>
  );
}
