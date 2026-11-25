import { Pencil, Trash2 } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { formatDate, formatDuration } from "../../utils/format";

export default function RecordDetails({ config, record, onClose, onEdit, onDelete }) {
  if (!record) return null;
  const rows = [
    ["Category", <Badge key="c">{record.category}</Badge>],
    ["Date", formatDate(record.date)],
    ["Duration", formatDuration(record.duration)],
    ["Added", new Date(record.createdAt).toLocaleString()],
  ];
  return (
    <Modal
      open
      onClose={onClose}
      title={record[config.titleKey]}
      description={`${config.label} details`}
      footer={
        <>
          <Button variant="secondary" icon={Trash2} onClick={() => onDelete(record)}>Delete</Button>
          <Button icon={Pencil} onClick={() => onEdit(record)}>Edit</Button>
        </>
      }
    >
      <dl className="grid gap-4 sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k}><dt className="text-xs font-medium text-slate-500">{k}</dt><dd className="mt-1 text-sm font-semibold text-slate-800">{v}</dd></div>
        ))}
      </dl>
      <div className="mt-5">
        <p className="text-xs font-medium text-slate-500">Notes</p>
        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{record.notes || "No notes."}</p>
      </div>
      {record.tags?.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {record.tags.map((t) => <span key={t} className="badge bg-slate-100 text-slate-600">#{t}</span>)}
        </div>
      )}
    </Modal>
  );
}
