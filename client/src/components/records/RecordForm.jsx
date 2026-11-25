import { useMemo } from "react";
import Modal from "../ui/Modal";
import Field from "../ui/Field";
import FormError from "../ui/FormError";
import Button from "../ui/Button";
import useApiForm from "../../hooks/useApiForm";
import { makeRecordSchema } from "../../validations/schemas";
import { localDateString, parseTags, toInputDate } from "../../utils/format";

// Create / edit form for activities and workouts (they share the same shape).
export default function RecordForm({ config, record, onSubmit, onClose }) {
  const { titleKey, titleLabel, categories, label } = config;
  const schema = useMemo(() => makeRecordSchema(titleKey, titleLabel), [titleKey, titleLabel]);

  const { form: { register, formState: { errors, isSubmitting } }, formError, submit } = useApiForm({
    schema,
    defaultValues: record
      ? { [titleKey]: record[titleKey], category: record.category, date: toInputDate(record.date), duration: record.duration, notes: record.notes || "", tagsText: (record.tags || []).join(", ") }
      : { [titleKey]: "", category: categories[0], date: localDateString(), duration: "", notes: "", tagsText: "" },
    onSubmit: ({ tagsText, ...values }) => onSubmit({ ...values, duration: Number(values.duration), tags: parseTags(tagsText) }),
  });

  const cls = (name) => `input ${errors[name] ? "input-error" : ""}`;

  return (
    <Modal
      open
      onClose={isSubmitting ? undefined : onClose}
      title={record ? `Edit ${label.toLowerCase()}` : `Add ${label.toLowerCase()}`}
      description="Fields marked * are required."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" form="record-form" loading={isSubmitting}>{isSubmitting ? "Saving..." : record ? "Save changes" : `Save ${label.toLowerCase()}`}</Button>
        </>
      }
    >
      <form id="record-form" onSubmit={submit} noValidate className="space-y-4" aria-busy={isSubmitting}>
        <FormError message={formError} />

        <Field label={titleLabel} id="rec-title" error={errors[titleKey]?.message} required>
          <input id="rec-title" autoFocus className={cls(titleKey)} placeholder={config.titlePlaceholder} {...register(titleKey)} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category" id="rec-category" error={errors.category?.message} required>
            <select id="rec-category" className={cls("category")} {...register("category")}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Duration (minutes)" id="rec-duration" error={errors.duration?.message} required>
            <input id="rec-duration" type="number" inputMode="numeric" min="1" max="1440" className={cls("duration")} placeholder="30" {...register("duration")} />
          </Field>
        </div>

        <Field label="Date" id="rec-date" error={errors.date?.message} required>
          <input id="rec-date" type="date" max={localDateString()} className={cls("date")} {...register("date")} />
        </Field>

        <Field label="Notes" id="rec-notes" error={errors.notes?.message}>
          <textarea id="rec-notes" rows={3} className={cls("notes")} placeholder="How did it go? (optional)" {...register("notes")} />
        </Field>

        <Field label="Tags" id="rec-tags" hint="Optional. Separate tags with commas, for example: morning, outdoor" error={errors.tagsText?.message}>
          <input id="rec-tags" className={cls("tagsText")} {...register("tagsText")} />
        </Field>
      </form>
    </Modal>
  );
}
