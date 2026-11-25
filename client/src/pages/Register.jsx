import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Field from "../components/ui/Field";
import FormError from "../components/ui/FormError";
import PasswordInput from "../components/ui/PasswordInput";
import PasswordStrength from "../components/ui/PasswordStrength";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { registerSchema } from "../validations/schemas";
import useApiForm from "../hooks/useApiForm";
import usePageTitle from "../hooks/usePageTitle";

const LEGAL = {
  terms: {
    title: "Terms of use",
    body: [
      "FitTrack is a personal tracking tool. It is not medical advice and does not replace guidance from a health professional.",
      "You are responsible for keeping your password private and for the accuracy of the records you enter.",
      "Please check with a doctor before starting a new exercise programme if you have a health condition.",
    ],
  },
  privacy: {
    title: "Privacy policy",
    body: [
      "We store your name, email, hashed password and the activity records you create so the app can work for you.",
      "Your records are only visible to your account. We do not sell or share your data.",
      "You can update your details at any time from your profile.",
    ],
  },
};

export default function Register() {
  const { register: signUp } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [legal, setLegal] = useState(null);
  usePageTitle("Create account");

  const { form: { register, watch, formState: { errors, isSubmitting } }, formError, submit } = useApiForm({
    schema: registerSchema,
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "", acceptTerms: false },
    onSubmit: async (values) => {
      const user = await signUp(values);
      toast.success(`Account created. Welcome, ${user.fullName.split(" ")[0]}!`);
      navigate("/", { replace: true });
    },
  });
  const password = watch("password");

  const invalid = (name) => `input ${errors[name] ? "input-error" : ""}`;

  return (
    <div>
      <h1 className="text-3xl font-extrabold">Create your account</h1>
      <p className="mt-2 text-sm text-slate-600">Start tracking your activity in under a minute.</p>

      <form onSubmit={submit} noValidate className="mt-8 space-y-5" aria-busy={isSubmitting}>
        <FormError message={formError} />

        <Field label="Full name" id="fullName" error={errors.fullName?.message} required>
          <input id="fullName" autoComplete="name" autoFocus placeholder="Alex Rivera" className={invalid("fullName")} {...register("fullName")} />
        </Field>
        <Field label="Email address" id="email" error={errors.email?.message} required>
          <input id="email" type="email" autoComplete="email" placeholder="you@example.com" className={invalid("email")} {...register("email")} />
        </Field>
        <Field label="Password" id="password" error={errors.password?.message} required>
          <PasswordInput id="password" autoComplete="new-password" placeholder="Create a password" invalid={!!errors.password} {...register("password")} />
          <PasswordStrength password={password} />
        </Field>
        <Field label="Confirm password" id="confirmPassword" error={errors.confirmPassword?.message} required>
          <PasswordInput id="confirmPassword" autoComplete="new-password" placeholder="Repeat your password" invalid={!!errors.confirmPassword} {...register("confirmPassword")} />
        </Field>

        <div>
          <label className="flex min-h-11 cursor-pointer items-start gap-2.5 text-sm text-slate-700">
            <input type="checkbox" aria-describedby={errors.acceptTerms ? "terms-error" : undefined} className="mt-0.5 h-5 w-5 rounded border-slate-500 text-emerald-700" {...register("acceptTerms")} />
            <span>
              I agree to the{" "}
              <button type="button" onClick={() => setLegal("terms")} className="font-semibold text-emerald-800 hover:underline">Terms of use</button>
              {" "}and{" "}
              <button type="button" onClick={() => setLegal("privacy")} className="font-semibold text-emerald-800 hover:underline">Privacy policy</button>.
            </span>
          </label>
          {errors.acceptTerms && <p id="terms-error" role="alert" className="mt-1.5 text-xs font-medium text-red-700">{errors.acceptTerms.message}</p>}
        </div>

        <Button type="submit" loading={isSubmitting} className="w-full">{isSubmitting ? "Creating account..." : "Create account"}</Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Already have an account? <Link to="/login" className="font-semibold text-emerald-800 hover:underline">Sign in</Link>
      </p>

      <Modal open={!!legal} onClose={() => setLegal(null)} title={legal ? LEGAL[legal].title : ""} size="sm"
        footer={<Button onClick={() => setLegal(null)}>Close</Button>}>
        <div className="space-y-3 text-sm text-slate-600">{legal && LEGAL[legal].body.map((p) => <p key={p}>{p}</p>)}</div>
      </Modal>
    </div>
  );
}
