import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, LogOut } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Field from "../components/ui/Field";
import FormError from "../components/ui/FormError";
import Button from "../components/ui/Button";
import Avatar from "../components/ui/Avatar";
import useApiForm from "../hooks/useApiForm";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useNotifications } from "../context/NotificationContext";
import { profileService } from "../services/resources";
import { profileSchema } from "../validations/schemas";
import { AVATAR_COLORS } from "../utils/constants";
import { cn } from "../utils/format";

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { refresh } = useNotifications();
  const [avatar, setAvatar] = useState(user.avatar || "emerald");

  const { form: { register, watch, reset, formState: { errors, isSubmitting, isDirty } }, formError, submit } = useApiForm({
    schema: profileSchema,
    defaultValues: { fullName: user.fullName, email: user.email, bio: user.bio || "" },
    onSubmit: async (values) => {
      const d = await profileService.update({ ...values, avatar });
      setUser(d.user);
      reset({ fullName: d.user.fullName, email: d.user.email, bio: d.user.bio || "" });
      toast.success("Profile updated.");
      refresh();
    },
  });
  const bioLength = watch("bio")?.length || 0;
  const changed = isDirty || avatar !== (user.avatar || "emerald");

  const handleLogout = async () => {
    await logout();
    toast.success("You have been signed out.");
    navigate("/login", { replace: true });
  };

  const cls = (e) => `input ${e ? "input-error" : ""}`;

  return (
    <>
      <PageHeader title="Profile" description="Your personal details and how you appear in FitTrack." />
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card flex flex-col items-center p-6 text-center lg:self-start" aria-label="Account summary">
          <Avatar user={{ ...user, avatar }} size="lg" />
          <h2 className="mt-4 text-lg font-bold">{user.fullName}</h2>
          <p className="break-all text-sm text-slate-600">{user.email}</p>
          <dl className="mt-5 w-full space-y-2 border-t border-slate-100 pt-4 text-left text-sm">
            <div className="flex justify-between gap-2"><dt className="text-slate-600">Member since</dt><dd className="font-semibold">{new Date(user.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-slate-600">Last sign-in</dt><dd className="font-semibold">{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "-"}</dd></div>
          </dl>
          <Button variant="secondary" icon={LogOut} className="mt-5 w-full" onClick={handleLogout}>Log out</Button>
        </section>

        <form onSubmit={submit} noValidate className="card space-y-5 p-6 lg:col-span-2" aria-busy={isSubmitting}>
          <h2 className="text-lg font-bold">Edit profile</h2>
          <FormError message={formError} />

          <fieldset>
            <legend className="label">Avatar colour</legend>
            <div className="flex flex-wrap gap-2.5">
              {Object.entries(AVATAR_COLORS).map(([key, bg]) => (
                <button type="button" key={key} onClick={() => setAvatar(key)} aria-label={`${key} avatar`} aria-pressed={avatar === key}
                  className={cn("flex h-11 w-11 items-center justify-center rounded-full text-white ring-offset-2", bg, avatar === key && "ring-2 ring-slate-900")}>
                  {avatar === key && <Check className="h-4 w-4" aria-hidden="true" />}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" id="p-name" error={errors.fullName?.message} required><input id="p-name" autoComplete="name" className={cls(errors.fullName)} {...register("fullName")} /></Field>
            <Field label="Email address" id="p-email" error={errors.email?.message} required><input id="p-email" type="email" autoComplete="email" className={cls(errors.email)} {...register("email")} /></Field>
          </div>
          <Field label="Bio" id="p-bio" error={errors.bio?.message} hint={`Optional. ${bioLength}/200 characters`}>
            <textarea id="p-bio" rows={3} className={cls(errors.bio)} placeholder="A line about your fitness journey" {...register("bio")} />
          </Field>
          <div className="flex items-center justify-end gap-3">
            {!changed && <span className="text-sm text-slate-600">No unsaved changes</span>}
            <Button type="submit" loading={isSubmitting} disabled={!changed}>{isSubmitting ? "Saving..." : "Save changes"}</Button>
          </div>
        </form>
      </div>
    </>
  );
}
