import { Link, useLocation, useNavigate } from "react-router-dom";
import Field from "../components/ui/Field";
import FormError from "../components/ui/FormError";
import PasswordInput from "../components/ui/PasswordInput";
import Button from "../components/ui/Button";
import useApiForm from "../hooks/useApiForm";
import usePageTitle from "../hooks/usePageTitle";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { loginSchema } from "../validations/schemas";

export default function Login() {
  usePageTitle("Sign in");
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const { form: { register, formState: { errors, isSubmitting } }, formError, submit } = useApiForm({
    schema: loginSchema,
    defaultValues: { email: "", password: "", rememberMe: false },
    onSubmit: async (values) => {
      const user = await login(values);
      toast.success(`Welcome back, ${user.fullName.split(" ")[0]}!`);
      navigate(location.state?.from || "/", { replace: true });
    },
  });

  return (
    <div>
      <h1 className="text-3xl font-extrabold">Sign in</h1>
      <p className="mt-2 text-sm text-slate-600">Welcome back. Pick up where you left off.</p>

      <form onSubmit={submit} noValidate className="mt-8 space-y-5" aria-busy={isSubmitting}>
        <FormError message={formError} />

        <Field label="Email address" id="email" error={errors.email?.message} required>
          <input id="email" type="email" autoComplete="email" autoFocus placeholder="you@example.com" className={`input ${errors.email ? "input-error" : ""}`} {...register("email")} />
        </Field>

        <Field label="Password" id="password" error={errors.password?.message} required>
          <PasswordInput id="password" autoComplete="current-password" placeholder="Your password" invalid={!!errors.password} {...register("password")} />
        </Field>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" className="h-5 w-5 rounded border-slate-500 text-emerald-700" {...register("rememberMe")} />
            Remember me for 7 days
          </label>
          <Link to="/forgot-password" className="inline-flex min-h-11 items-center text-sm font-semibold text-emerald-800 hover:underline">Forgot password?</Link>
        </div>

        <Button type="submit" loading={isSubmitting} className="w-full">{isSubmitting ? "Signing in..." : "Sign in"}</Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600">
        New to FitTrack? <Link to="/register" className="font-semibold text-emerald-800 hover:underline">Create an account</Link>
      </p>
    </div>
  );
}
