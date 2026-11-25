import { useState } from "react";
import { CalendarDays, Pencil, Plus, Target, Trash2, TrendingUp, Trophy } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Badge, { StatusBadge } from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Field from "../components/ui/Field";
import FormError from "../components/ui/FormError";
import FilterTabs from "../components/ui/FilterTabs";
import ProgressBar from "../components/ui/ProgressBar";
import Pagination from "../components/ui/Pagination";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import DataStatus from "../components/ui/DataStatus";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { CardsSkeleton } from "../components/ui/Skeleton";
import useApiForm from "../hooks/useApiForm";
import useResourceList from "../hooks/useResourceList";
import useDeleteFlow from "../hooks/useDeleteFlow";
import useOpenOnNewParam from "../hooks/useOpenOnNewParam";
import { goalService } from "../services/resources";
import { useToast } from "../context/ToastContext";
import { useNotifications } from "../context/NotificationContext";
import { goalSchema, progressSchema } from "../validations/schemas";
import { GOAL_CATEGORIES, GOAL_UNITS } from "../utils/constants";
import { formatDate, localDateString, toInputDate } from "../utils/format";

const TABS = [["", "All"], ["active", "Active"], ["completed", "Completed"], ["paused", "Paused"]];

// Builds the full PUT payload for a goal, with optional overrides.
const toPayload = (g, overrides = {}) => ({
  title: g.title, description: g.description || "", category: g.category, targetValue: g.targetValue, unit: g.unit,
  progressValue: g.progressValue, startDate: toInputDate(g.startDate), targetDate: toInputDate(g.targetDate),
  status: g.status === "completed" ? "active" : g.status, ...overrides,
});

const isOverdue = (g) => g.status === "active" && toInputDate(g.targetDate) < localDateString();

function GoalForm({ goal, onSubmit, onClose }) {
  const { form: { register, formState: { errors, isSubmitting } }, formError, submit } = useApiForm({
    schema: goalSchema,
    defaultValues: goal
      ? toPayload(goal)
      : { title: "", description: "", category: GOAL_CATEGORIES[0], targetValue: "", unit: "sessions", progressValue: 0, startDate: localDateString(), targetDate: localDateString(30), status: "active" },
    onSubmit: (v) => onSubmit({ ...v, targetValue: Number(v.targetValue), progressValue: Number(v.progressValue) }),
  });
  const cls = (e) => `input ${e ? "input-error" : ""}`;

  return (
    <Modal open onClose={isSubmitting ? undefined : onClose} title={goal ? "Edit goal" : "New goal"} description="Fields marked * are required."
      footer={<><Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button><Button type="submit" form="goal-form" loading={isSubmitting}>{isSubmitting ? "Saving..." : goal ? "Save changes" : "Save goal"}</Button></>}>
      <form id="goal-form" onSubmit={submit} noValidate className="space-y-4" aria-busy={isSubmitting}>
        <FormError message={formError} />
        <Field label="Goal title" id="g-title" error={errors.title?.message} required>
          <input id="g-title" autoFocus className={cls(errors.title)} placeholder="Walk four days a week" {...register("title")} />
        </Field>
        <Field label="Description" id="g-desc" error={errors.description?.message}>
          <textarea id="g-desc" rows={2} className={cls(errors.description)} placeholder="Optional" {...register("description")} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category" id="g-cat" error={errors.category?.message} required>
            <select id="g-cat" className={cls(errors.category)} {...register("category")}>{GOAL_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          </Field>
          <Field label="Status" id="g-status" hint="A goal completes automatically when it reaches its target.">
            <select id="g-status" className="input" {...register("status")}><option value="active">Active</option><option value="paused">Paused</option></select>
          </Field>
          <Field label="Target" id="g-target" error={errors.targetValue?.message} required>
            <input id="g-target" type="number" inputMode="numeric" min="1" className={cls(errors.targetValue)} {...register("targetValue")} />
          </Field>
          <Field label="Measured in" id="g-unit" error={errors.unit?.message} required>
            <select id="g-unit" className={cls(errors.unit)} {...register("unit")}>{GOAL_UNITS.map((u) => <option key={u}>{u}</option>)}</select>
          </Field>
          <Field label="Current progress" id="g-prog" error={errors.progressValue?.message} required>
            <input id="g-prog" type="number" inputMode="numeric" min="0" className={cls(errors.progressValue)} {...register("progressValue")} />
          </Field>
          <span aria-hidden="true" />
          <Field label="Start date" id="g-start" error={errors.startDate?.message} required><input id="g-start" type="date" className={cls(errors.startDate)} {...register("startDate")} /></Field>
          <Field label="Target date" id="g-end" error={errors.targetDate?.message} required><input id="g-end" type="date" className={cls(errors.targetDate)} {...register("targetDate")} /></Field>
        </div>
      </form>
    </Modal>
  );
}

function ProgressModal({ goal, onSubmit, onClose }) {
  const { form: { register, setValue, getValues, formState: { errors, isSubmitting } }, formError, submit } = useApiForm({
    schema: progressSchema,
    defaultValues: { progressValue: goal.progressValue },
    onSubmit: (v) => onSubmit(Number(v.progressValue)),
  });
  const bump = (n) => setValue("progressValue", Math.max(0, Number(getValues("progressValue") || 0) + n), { shouldValidate: true, shouldDirty: true });
  return (
    <Modal open size="sm" onClose={isSubmitting ? undefined : onClose} title="Update progress" description={`${goal.title} - target ${goal.targetValue} ${goal.unit}`}
      footer={<><Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button><Button type="submit" form="progress-form" loading={isSubmitting}>{isSubmitting ? "Saving..." : "Save progress"}</Button></>}>
      <form id="progress-form" onSubmit={submit} noValidate className="space-y-4" aria-busy={isSubmitting}>
        <FormError message={formError} />
        <Field label={`Progress (${goal.unit})`} id="p-val" error={errors.progressValue?.message} required>
          <input id="p-val" type="number" inputMode="numeric" min="0" autoFocus className={`input ${errors.progressValue ? "input-error" : ""}`} {...register("progressValue")} />
        </Field>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Adjust progress">
          {[1, 5, 10].map((n) => <Button key={n} variant="secondary" size="sm" onClick={() => bump(n)}>+{n}</Button>)}
          <Button variant="secondary" size="sm" onClick={() => bump(-1)}>-1</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function Goals() {
  const toast = useToast();
  const { refresh: refreshNotifications } = useNotifications();
  const list = useResourceList(goalService, { initial: { status: "" }, filterKeys: ["status"], limit: 9 });
  const { items, filters, setFilter } = list;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [updating, setUpdating] = useState(null);

  const refreshAll = () => { list.reload(); refreshNotifications(); };
  const del = useDeleteFlow({ remove: goalService.remove, successMessage: "Goal deleted.", onDone: refreshAll });
  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditing(null); };
  useOpenOnNewParam(openCreate);

  const celebrate = (before, after, fallback) =>
    toast.success(after.status === "completed" && before?.status !== "completed" ? "Goal completed. Congratulations!" : fallback);

  const handleSave = async (payload) => {
    const { item } = editing ? await goalService.update(editing._id, payload) : await goalService.create(payload);
    celebrate(editing, item, editing ? "Goal updated." : "Goal created.");
    closeForm();
    refreshAll();
  };

  const handleProgress = async (value) => {
    const { item } = await goalService.update(updating._id, toPayload(updating, { progressValue: value }));
    celebrate(updating, item, "Progress updated.");
    setUpdating(null);
    refreshAll();
  };

  return (
    <>
      <PageHeader title="Goals" description="Set habits that build consistency, and track how far you've come." actions={<Button icon={Plus} onClick={openCreate}>New goal</Button>} />
      <DataStatus error={list.error} hasData={!!list.data} onRetry={list.reload} />

      <div className="mb-5">
        <FilterTabs label="Filter goals by status" options={TABS} value={filters.status} onChange={(status) => setFilter({ status })} />
      </div>
      <p className="sr-only" role="status" aria-live="polite">{list.loading ? "Updating goals" : `${list.pagination?.total ?? 0} goals shown`}</p>

      {list.loading && !list.data ? <CardsSkeleton /> : list.error && !list.data ? (
        <div className="card"><ErrorState error={list.error} onRetry={list.reload} /></div>
      ) : items.length === 0 ? (
        <div className="card">
          <EmptyState icon={Target} title={filters.status ? `No ${filters.status} goals` : "No goals yet"}
            message={filters.status ? "Try another filter to see your other goals." : "Pick something small and steady, like three sessions a week."}
            action={filters.status ? <Button variant="secondary" onClick={list.reset}>Show all goals</Button> : <Button icon={Plus} onClick={openCreate}>Create your first goal</Button>} />
        </div>
      ) : (
        <>
          <div aria-busy={list.loading} className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-3 ${list.loading ? "opacity-60" : ""}`}>
            {items.map((g) => (
              <article key={g._id} className="card flex flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="line-clamp-2 text-base font-bold">{g.title}</h3>
                  <StatusBadge status={g.status} />
                </div>
                {g.description && <p className="mt-1.5 line-clamp-2 text-sm text-slate-700">{g.description}</p>}
                <div className="mt-4">
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-semibold">{g.progressValue} / {g.targetValue} {g.unit}</span>
                    <span className="text-slate-600">{g.progressPercent}%</span>
                  </div>
                  <ProgressBar value={g.progressPercent} label={`${g.title} progress`} tone={g.status === "completed" ? "emerald" : "sky"} />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                  <Badge>{g.category}</Badge>
                  <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />Due {formatDate(g.targetDate)}</span>
                  {isOverdue(g) && <span className="badge bg-red-50 text-red-800">Overdue</span>}
                </div>
                {g.status === "completed" && g.completedAt && <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-800"><Trophy className="h-4 w-4" aria-hidden="true" />Completed {new Date(g.completedAt).toLocaleDateString()}</p>}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <Button size="sm" variant="secondary" icon={TrendingUp} onClick={() => setUpdating(g)}>Update progress</Button>
                  <div className="flex">
                    <button className="icon-btn" onClick={() => { setEditing(g); setFormOpen(true); }} aria-label={`Edit ${g.title}`}><Pencil className="h-4 w-4" /></button>
                    <button className="icon-btn hover:!text-red-700" onClick={() => del.ask(g)} aria-label={`Delete ${g.title}`}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="card mt-4"><Pagination pagination={list.pagination} onPage={list.setPage} /></div>
        </>
      )}

      {formOpen && <GoalForm goal={editing} onSubmit={handleSave} onClose={closeForm} />}
      {updating && <ProgressModal goal={updating} onSubmit={handleProgress} onClose={() => setUpdating(null)} />}
      <ConfirmDialog open={!!del.target} title="Delete this goal?" message={del.target ? `"${del.target.title}" and its progress will be removed.` : ""}
        loading={del.busy} onConfirm={del.confirm} onCancel={del.cancel} />
    </>
  );
}
