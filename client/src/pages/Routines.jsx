import { useState } from "react";
import { useFieldArray } from "react-hook-form";
import { Clock, Eye, ListChecks, Pencil, Play, Plus, Trash2, X } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Field from "../components/ui/Field";
import FormError from "../components/ui/FormError";
import SearchInput from "../components/ui/SearchInput";
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
import { routineService } from "../services/resources";
import { useToast } from "../context/ToastContext";
import { useNotifications } from "../context/NotificationContext";
import { routineSchema, logRoutineSchema } from "../validations/schemas";
import { ROUTINE_CATEGORIES } from "../utils/constants";
import { formatDate, formatDuration, localDateString } from "../utils/format";

const emptyExercise = { name: "", sets: "", reps: "", durationMinutes: "" };
const INITIAL = { search: "", category: "", sort: "-createdAt" };

function RoutineForm({ routine, onSubmit, onClose }) {
  const { form: { register, control, formState: { errors, isSubmitting } }, formError, submit } = useApiForm({
    schema: routineSchema,
    defaultValues: routine
      ? {
          name: routine.name, description: routine.description || "", category: routine.category,
          estimatedDuration: routine.estimatedDuration, notes: routine.notes || "",
          exercises: routine.exercises.map((e) => ({ name: e.name, sets: e.sets ?? "", reps: e.reps ?? "", durationMinutes: e.durationMinutes ?? "" })),
        }
      : { name: "", description: "", category: ROUTINE_CATEGORIES[0], estimatedDuration: "", notes: "", exercises: [{ ...emptyExercise }] },
    onSubmit: (values) => onSubmit({ ...values, estimatedDuration: Number(values.estimatedDuration) }),
  });
  const { fields, append, remove } = useFieldArray({ control, name: "exercises" });
  const cls = (e) => `input ${e ? "input-error" : ""}`;

  return (
    <Modal open size="lg" onClose={isSubmitting ? undefined : onClose} title={routine ? "Edit routine" : "New routine"} description="Fields marked * are required."
      footer={<><Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button><Button type="submit" form="routine-form" loading={isSubmitting}>{isSubmitting ? "Saving..." : routine ? "Save changes" : "Save routine"}</Button></>}>
      <form id="routine-form" onSubmit={submit} noValidate className="space-y-4" aria-busy={isSubmitting}>
        <FormError message={formError} />
        <Field label="Routine name" id="r-name" error={errors.name?.message} required>
          <input id="r-name" autoFocus className={cls(errors.name)} placeholder="Morning mobility" {...register("name")} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category" id="r-cat" error={errors.category?.message} required>
            <select id="r-cat" className={cls(errors.category)} {...register("category")}>{ROUTINE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          </Field>
          <Field label="Estimated duration (minutes)" id="r-dur" error={errors.estimatedDuration?.message} required>
            <input id="r-dur" type="number" inputMode="numeric" min="1" className={cls(errors.estimatedDuration)} {...register("estimatedDuration")} />
          </Field>
        </div>
        <Field label="Description" id="r-desc" error={errors.description?.message}>
          <textarea id="r-desc" rows={2} className={cls(errors.description)} placeholder="Optional" {...register("description")} />
        </Field>

        <fieldset>
          <legend className="label">Exercises</legend>
          <div className="space-y-3">
            {fields.map((f, i) => (
              <div key={f.id} className="rounded-xl border border-slate-300 p-3">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input aria-label={`Exercise ${i + 1} name`} aria-invalid={errors.exercises?.[i]?.name ? "true" : undefined} placeholder="Exercise name" className={cls(errors.exercises?.[i]?.name)} {...register(`exercises.${i}.name`)} />
                    {errors.exercises?.[i]?.name && <p role="alert" className="mt-1 text-xs font-medium text-red-700">{errors.exercises[i].name.message}</p>}
                  </div>
                  <button type="button" className="icon-btn" onClick={() => remove(i)} aria-label={`Remove exercise ${i + 1}`}><X className="h-4 w-4" /></button>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <input aria-label={`Exercise ${i + 1} sets`} type="number" inputMode="numeric" min="1" placeholder="Sets" className={cls(errors.exercises?.[i]?.sets)} {...register(`exercises.${i}.sets`)} />
                  <input aria-label={`Exercise ${i + 1} reps`} type="number" inputMode="numeric" min="1" placeholder="Reps" className={cls(errors.exercises?.[i]?.reps)} {...register(`exercises.${i}.reps`)} />
                  <input aria-label={`Exercise ${i + 1} minutes`} type="number" inputMode="numeric" min="1" placeholder="Minutes" className={cls(errors.exercises?.[i]?.durationMinutes)} {...register(`exercises.${i}.durationMinutes`)} />
                </div>
              </div>
            ))}
          </div>
          {errors.exercises?.message && <p role="alert" className="mt-1.5 text-xs font-medium text-red-700">{errors.exercises.message}</p>}
          <Button variant="secondary" size="sm" icon={Plus} className="mt-3" onClick={() => append({ ...emptyExercise })}>Add exercise</Button>
        </fieldset>

        <Field label="Notes" id="r-notes" error={errors.notes?.message}>
          <textarea id="r-notes" rows={2} className={cls(errors.notes)} placeholder="Optional" {...register("notes")} />
        </Field>
      </form>
    </Modal>
  );
}

function LogModal({ routine, onSubmit, onClose }) {
  const { form: { register, formState: { errors, isSubmitting } }, formError, submit } = useApiForm({
    schema: logRoutineSchema,
    defaultValues: { date: localDateString(), duration: routine.estimatedDuration, notes: "" },
    onSubmit: (v) => onSubmit({ ...v, duration: Number(v.duration) }),
  });
  return (
    <Modal open size="sm" onClose={isSubmitting ? undefined : onClose} title={`Log "${routine.name}"`} description="Record this routine as a completed workout."
      footer={<><Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button><Button type="submit" form="log-form" icon={Play} loading={isSubmitting}>{isSubmitting ? "Logging..." : "Log workout"}</Button></>}>
      <form id="log-form" onSubmit={submit} noValidate className="space-y-4" aria-busy={isSubmitting}>
        <FormError message={formError} />
        <Field label="Date" id="l-date" error={errors.date?.message} required><input id="l-date" type="date" max={localDateString()} className="input" {...register("date")} /></Field>
        <Field label="Duration (minutes)" id="l-dur" error={errors.duration?.message} required><input id="l-dur" type="number" inputMode="numeric" min="1" autoFocus className="input" {...register("duration")} /></Field>
        <Field label="Notes" id="l-notes" error={errors.notes?.message}><textarea id="l-notes" rows={2} className="input" placeholder="Optional" {...register("notes")} /></Field>
      </form>
    </Modal>
  );
}

export default function Routines() {
  const toast = useToast();
  const { refresh: refreshNotifications } = useNotifications();
  const list = useResourceList(routineService, { initial: INITIAL, filterKeys: ["search", "category"], limit: 9 });
  const { items, filters, setFilter } = list;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [logging, setLogging] = useState(null);

  const del = useDeleteFlow({ remove: routineService.remove, successMessage: "Routine deleted.", onDone: () => { setViewing(null); list.reload(); } });
  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (r) => { setViewing(null); setEditing(r); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditing(null); };
  useOpenOnNewParam(openCreate);

  const handleSave = async (payload) => {
    if (editing) await routineService.update(editing._id, payload);
    else await routineService.create(payload);
    toast.success(`Routine ${editing ? "updated" : "saved"}.`);
    closeForm();
    list.reload();
  };

  const handleLog = async (payload) => {
    await routineService.log(logging._id, payload);
    toast.success("Routine logged as a workout.");
    setLogging(null);
    list.reload();
    refreshNotifications();
  };

  return (
    <>
      <PageHeader title="Workout routines" description="Build reusable routines, then log one as a workout whenever you finish it." actions={<Button icon={Plus} onClick={openCreate}>New routine</Button>} />
      <DataStatus error={list.error} hasData={!!list.data} onRetry={list.reload} />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <SearchInput value={filters.search} onChange={(v) => setFilter({ search: v })} placeholder="Search routines..." label="Search routines" />
        <select aria-label="Filter by category" className="input" value={filters.category} onChange={(e) => setFilter({ category: e.target.value })}>
          <option value="">All categories</option>{ROUTINE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select aria-label="Sort routines" className="input" value={filters.sort} onChange={(e) => setFilter({ sort: e.target.value })}>
          <option value="-createdAt">Newest first</option>
          <option value="name">Name A-Z</option>
          <option value="-timesCompleted">Most completed</option>
          <option value="-lastCompletedAt">Recently completed</option>
          <option value="estimatedDuration">Shortest first</option>
        </select>
      </div>
      <p className="sr-only" role="status" aria-live="polite">{list.loading || list.pending ? "Updating results" : `${list.pagination?.total ?? 0} routines`}</p>

      {list.loading && !list.data ? <CardsSkeleton /> : list.error && !list.data ? (
        <div className="card"><ErrorState error={list.error} onRetry={list.reload} /></div>
      ) : items.length === 0 ? (
        <div className="card">
          {list.hasFilters
            ? <EmptyState title="No matching routines" message="Try a different search or category." action={<Button variant="secondary" onClick={list.reset}>Clear filters</Button>} />
            : <EmptyState icon={ListChecks} title="No routines yet" message="Save the exercises you repeat often, then log a session whenever you finish one." action={<Button icon={Plus} onClick={openCreate}>Create your first routine</Button>} />}
        </div>
      ) : (
        <>
          <div aria-busy={list.loading} className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-3 ${list.loading ? "opacity-60" : ""}`}>
            {items.map((r) => (
              <article key={r._id} className="card flex flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="line-clamp-2 text-base font-bold">{r.name}</h3>
                  <Badge>{r.category}</Badge>
                </div>
                {r.description && <p className="mt-2 line-clamp-2 text-sm text-slate-700">{r.description}</p>}
                <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-600"><Clock className="h-4 w-4" aria-hidden="true" />{formatDuration(r.estimatedDuration)} - {r.exercises.length} exercise{r.exercises.length === 1 ? "" : "s"}</p>
                <p className="mt-1 text-xs text-slate-600">{r.timesCompleted ? `Completed ${r.timesCompleted} time${r.timesCompleted === 1 ? "" : "s"}, last on ${formatDate(r.lastCompletedAt)}` : "Not completed yet"}</p>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <Button size="sm" icon={Play} onClick={() => setLogging(r)}>Log workout</Button>
                  <div className="flex">
                    <button className="icon-btn" onClick={() => setViewing(r)} aria-label={`View ${r.name}`}><Eye className="h-4 w-4" /></button>
                    <button className="icon-btn" onClick={() => openEdit(r)} aria-label={`Edit ${r.name}`}><Pencil className="h-4 w-4" /></button>
                    <button className="icon-btn hover:!text-red-700" onClick={() => del.ask(r)} aria-label={`Delete ${r.name}`}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="card mt-4"><Pagination pagination={list.pagination} onPage={list.setPage} /></div>
        </>
      )}

      {formOpen && <RoutineForm routine={editing} onSubmit={handleSave} onClose={closeForm} />}
      {logging && <LogModal routine={logging} onSubmit={handleLog} onClose={() => setLogging(null)} />}

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.name} description={viewing ? `${viewing.category} - ${formatDuration(viewing.estimatedDuration)}` : ""}
        footer={viewing && <><Button variant="secondary" icon={Pencil} onClick={() => openEdit(viewing)}>Edit</Button><Button icon={Play} onClick={() => { setLogging(viewing); setViewing(null); }}>Log workout</Button></>}>
        {viewing && (
          <div className="space-y-4">
            {viewing.description && <p className="text-sm text-slate-700">{viewing.description}</p>}
            <ol className="divide-y divide-slate-100 rounded-xl border border-slate-300">
              {viewing.exercises.length === 0 && <li className="p-4 text-sm text-slate-600">No exercises added.</li>}
              {viewing.exercises.map((e, i) => (
                <li key={e._id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <span className="font-semibold">{i + 1}. {e.name}</span>
                  <span className="text-slate-600">{[e.sets && `${e.sets} sets`, e.reps && `${e.reps} reps`, e.durationMinutes && `${e.durationMinutes} min`].filter(Boolean).join(" - ") || "-"}</span>
                </li>
              ))}
            </ol>
            {viewing.notes && <p className="whitespace-pre-wrap text-sm text-slate-700">{viewing.notes}</p>}
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!del.target} title="Delete this routine?" message={del.target ? `"${del.target.name}" will be removed. Workouts you already logged from it are kept.` : ""}
        loading={del.busy} onConfirm={del.confirm} onCancel={del.cancel} />
    </>
  );
}
