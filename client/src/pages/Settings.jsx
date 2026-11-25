import PageHeader from "../components/ui/PageHeader";
import Field from "../components/ui/Field";
import FormError from "../components/ui/FormError";
import Button from "../components/ui/Button";
import PasswordInput from "../components/ui/PasswordInput";
import PasswordStrength from "../components/ui/PasswordStrength";
import useApiForm from "../hooks/useApiForm";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useNotifications } from "../context/NotificationContext";
import { profileService } from "../services/resources";
import { changePasswordSchema, preferencesSchema } from "../validations/schemas";

function Preferences() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const { refresh } = useNotifications();
  const p = user.preferences || {};

  const { form: { register, reset, formState: { errors, isSubmitting, isDirty } }, formError, submit } = useApiForm({
    schema: preferencesSchema,
    defaultValues: { weeklyActivityTarget: p.weeklyActivityTarget ?? 3, weekStartsOn: String(p.weekStartsOn ?? 1), notificationsEnabled: p.notificationsEnabled ?? true },
    onSubmit: async (values) => {
      const d = await profileService.update({
        fullName: user.fullName, email: user.email, bio: user.bio || "",
        preferences: { ...values, weeklyActivityTarget: Number(values.weeklyActivityTarget), weekStartsOn: Number(values.weekStartsOn) },
      });
      setUser(d.user);
      reset(values);
      toast.success("Preferences saved.");
      refresh();
    },
  });

  return (
    <form onSubmit={submit} noValidate className="card space-y-5 p-6" aria-busy={isSubmitting} aria-labelledby="prefs-title">
      <div><h2 id="prefs-title" className="text-lg font-bold">Preferences</h2><p className="text-sm text-slate-600">These shape your dashboard and reminders.</p></div>
      <FormError message={formError} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Weekly session target" id="s-target" hint="Sessions per week, used for your consistency score." error={errors.weeklyActivityTarget?.message} required>
          <input id="s-target" type="number" inputMode="numeric" min="1" max="14" className={`input ${errors.weeklyActivityTarget ? "input-error" : ""}`} {...register("weeklyActivityTarget")} />
        </Field>
        <Field label="Week starts on" id="s-week">
          <select id="s-week" className="input" {...register("weekStartsOn")}><option value="1">Monday</option><option value="0">Sunday</option></select>
        </Field>
      </div>
      <label className="flex min-h-11 cursor-pointer items-start gap-3">
        <input type="checkbox" className="mt-0.5 h-5 w-5 rounded border-slate-500 text-emerald-700" {...register("notificationsEnabled")} />
        <span><span className="block text-sm font-semibold">In-app notifications</span><span className="text-sm text-slate-600">Get a notification when you record activities, update goals or change your profile.</span></span>
      </label>
      <div className="flex items-center justify-end gap-3">
        {!isDirty && <span className="text-sm text-slate-600">No unsaved changes</span>}
        <Button type="submit" loading={isSubmitting} disabled={!isDirty}>{isSubmitting ? "Saving..." : "Save preferences"}</Button>
      </div>
    </form>
  );
}

function ChangePassword() {
  const toast = useToast();
  const { refresh } = useNotifications();
  const { form: { register, watch, reset, formState: { errors, isSubmitting } }, formError, submit } = useApiForm({
    schema: changePasswordSchema,
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    onSubmit: async (values) => {
      await profileService.changePassword(values);
      toast.success("Password changed. Other devices were signed out.");
      reset();
      refresh();
    },
  });

  return (
    <form onSubmit={submit} noValidate className="card space-y-5 p-6" aria-busy={isSubmitting} aria-labelledby="pw-title">
      <div><h2 id="pw-title" className="text-lg font-bold">Change password</h2><p className="text-sm text-slate-600">Changing your password signs you out on your other devices.</p></div>
      <FormError message={formError} />
      <Field label="Current password" id="cp-current" error={errors.currentPassword?.message} required>
        <PasswordInput id="cp-current" autoComplete="current-password" invalid={!!errors.currentPassword} {...register("currentPassword")} />
      </Field>
      <Field label="New password" id="cp-new" error={errors.newPassword?.message} required>
        <PasswordInput id="cp-new" autoComplete="new-password" invalid={!!errors.newPassword} {...register("newPassword")} />
        <PasswordStrength password={watch("newPassword")} />
      </Field>
      <Field label="Confirm new password" id="cp-confirm" error={errors.confirmPassword?.message} required>
        <PasswordInput id="cp-confirm" autoComplete="new-password" invalid={!!errors.confirmPassword} {...register("confirmPassword")} />
      </Field>
      <div className="flex justify-end"><Button type="submit" loading={isSubmitting}>{isSubmitting ? "Updating..." : "Update password"}</Button></div>
    </form>
  );
}

export default function Settings() {
  return (
    <>
      <PageHeader title="Settings" description="Manage your preferences and account security." />
      <div className="grid gap-6 xl:grid-cols-2">
        <Preferences />
        <ChangePassword />
      </div>
    </>
  );
}
