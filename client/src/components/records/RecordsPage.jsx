import { useState } from "react";
import { Clock, Download, Eye, Flame, LayoutGrid, Pencil, Plus, Table2, Trash2, TrendingUp, X } from "lucide-react";
import PageHeader from "../ui/PageHeader";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import StatCard from "../ui/StatCard";
import SearchInput from "../ui/SearchInput";
import Pagination from "../ui/Pagination";
import EmptyState from "../ui/EmptyState";
import ErrorState from "../ui/ErrorState";
import DataStatus from "../ui/DataStatus";
import ConfirmDialog from "../ui/ConfirmDialog";
import { ListSkeleton, StatsSkeleton } from "../ui/Skeleton";
import RecordForm from "./RecordForm";
import RecordDetails from "./RecordDetails";
import useFetch from "../../hooks/useFetch";
import useResourceList from "../../hooks/useResourceList";
import useDeleteFlow from "../../hooks/useDeleteFlow";
import useOpenOnNewParam from "../../hooks/useOpenOnNewParam";
import { useToast } from "../../context/ToastContext";
import { useNotifications } from "../../context/NotificationContext";
import { formatDate, formatDuration, formatNumber, localDateString } from "../../utils/format";

const INITIAL = { search: "", category: "", from: "", to: "", sort: "-date" };

// Shared management screen for activities and workouts.
export default function RecordsPage({ config }) {
  const { label, plural, titleKey, categories, service, exportable, icon: Icon } = config;
  const noun = label.toLowerCase();
  const toast = useToast();
  const { refresh: refreshNotifications } = useNotifications();

  const list = useResourceList(service, { initial: INITIAL, filterKeys: ["search", "category", "from", "to"] });
  const stats = useFetch(() => service.stats(), [], { refetchOnFocus: true });
  const { items, pagination, filters, setFilter } = list;

  const [view, setView] = useState(() => (window.innerWidth < 768 ? "cards" : "table"));
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Every change to the records refreshes the list, the statistics and the notification badge together.
  const reloadAll = () => { list.reload(); stats.reload(); refreshNotifications(); };
  const del = useDeleteFlow({ remove: service.remove, successMessage: `${label} deleted.`, onDone: () => { setViewing(null); reloadAll(); } });

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (record) => { setViewing(null); setEditing(record); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditing(null); };
  useOpenOnNewParam(openCreate);

  const handleSave = async (payload) => {
    if (editing) await service.update(editing._id, payload);
    else await service.create(payload);
    toast.success(`${label} ${editing ? "updated" : "saved"}.`);
    closeForm();
    reloadAll();
  };

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const { page, ...exportParams } = list.params; // eslint-disable-line no-unused-vars
      const blob = await service.exportCsv(exportParams);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${plural.toLowerCase()}-${localDateString()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("CSV file downloaded.");
    } catch (err) {
      toast.error(err.userMessage);
    } finally {
      setExporting(false);
    }
  };

  // Keep the date range valid instead of silently returning nothing.
  const changeFrom = (from) => setFilter(filters.to && from > filters.to ? { from, to: from } : { from });
  const changeTo = (to) => setFilter(filters.from && to < filters.from ? { to, from: to } : { to });

  const s = stats.data;
  const rowActions = (r) => (
    <div className="flex justify-end gap-0.5">
      <button className="icon-btn" onClick={() => setViewing(r)} aria-label={`View ${r[titleKey]}`}><Eye className="h-4 w-4" /></button>
      <button className="icon-btn" onClick={() => openEdit(r)} aria-label={`Edit ${r[titleKey]}`}><Pencil className="h-4 w-4" /></button>
      <button className="icon-btn hover:!text-red-700" onClick={() => del.ask(r)} aria-label={`Delete ${r[titleKey]}`}><Trash2 className="h-4 w-4" /></button>
    </div>
  );

  const summary = list.loading || list.pending
    ? "Updating results..."
    : pagination ? `${formatNumber(pagination.total)} ${pagination.total === 1 ? noun : plural.toLowerCase()}${list.hasFilters ? " match your filters" : ""}` : "";

  return (
    <>
      <PageHeader
        title={plural}
        description={config.description}
        actions={
          <>
            {exportable && <Button variant="secondary" icon={Download} loading={exporting} onClick={handleExport}>Export CSV</Button>}
            <Button icon={Plus} onClick={openCreate}>Add {noun}</Button>
          </>
        }
      />

      <DataStatus error={stats.error || list.error} hasData={!!(list.data || stats.data)} onRetry={reloadAll} />

      {stats.loading && !s ? <StatsSkeleton count={4} /> : s && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={Icon} label={`Total ${plural.toLowerCase()}`} value={formatNumber(s.total)} />
          <StatCard icon={Clock} tone="sky" label="Total time" value={formatDuration(s.totalMinutes)} hint={s.total ? `${formatDuration(s.averageMinutes)} on average` : undefined} />
          <StatCard icon={TrendingUp} tone="violet" label="Last 30 days" value={formatNumber(s.last30Sessions)} hint={formatDuration(s.last30Minutes)} />
          <StatCard icon={Flame} tone="amber" label="Most frequent" value={s.topCategory || "-"} hint={s.topCategory ? `${s.categories[0].count} records` : "No records yet"} />
        </div>
      )}

      <section className="card mt-6" aria-label={`${plural} list`}>
        <div className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto]">
          <SearchInput value={filters.search} onChange={(v) => setFilter({ search: v })} placeholder={`Search ${plural.toLowerCase()}...`} label={`Search ${plural.toLowerCase()}`} />
          <select aria-label="Filter by category" className="input" value={filters.category} onChange={(e) => setFilter({ category: e.target.value })}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input aria-label="From date" type="date" className="input" value={filters.from} max={localDateString()} onChange={(e) => changeFrom(e.target.value)} />
          <input aria-label="To date" type="date" className="input" value={filters.to} max={localDateString()} onChange={(e) => changeTo(e.target.value)} />
          <select aria-label="Sort records" className="input" value={filters.sort} onChange={(e) => setFilter({ sort: e.target.value })}>
            <option value="-date">Newest first</option>
            <option value="date">Oldest first</option>
            <option value="-duration">Longest first</option>
            <option value="duration">Shortest first</option>
            <option value={titleKey}>Name A-Z</option>
          </select>
          <div className="flex items-center gap-1 rounded-xl border border-slate-500 p-1" role="group" aria-label="Layout">
            {[["table", Table2, "Table view"], ["cards", LayoutGrid, "Card view"]].map(([key, VIcon, text]) => (
              <button key={key} onClick={() => setView(key)} aria-label={text} aria-pressed={view === key}
                className={`flex h-9 w-10 items-center justify-center rounded-lg ${view === key ? "bg-emerald-700 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
                <VIcon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-4 py-2 text-sm text-slate-700" role="status" aria-live="polite">
          <span>{summary}</span>
          {list.hasFilters && <button onClick={list.reset} className="inline-flex min-h-10 items-center gap-1 font-semibold text-emerald-800 hover:underline"><X className="h-4 w-4" aria-hidden="true" /> Clear filters</button>}
        </div>

        {list.loading && !list.data ? <ListSkeleton /> : list.error && !list.data ? (
          <ErrorState error={list.error} onRetry={list.reload} />
        ) : items.length === 0 ? (
          list.hasFilters ? (
            <EmptyState title="No matches" message="Try a different search or clear your filters." action={<Button variant="secondary" onClick={list.reset}>Clear filters</Button>} />
          ) : (
            <EmptyState icon={Icon} title={`No ${plural.toLowerCase()} yet`} message={config.emptyMessage} action={<Button icon={Plus} onClick={openCreate}>Add {noun}</Button>} />
          )
        ) : (
          <div aria-busy={list.loading} className={list.loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
            {view === "table" ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <caption className="sr-only">{plural}, page {pagination?.page} of {pagination?.pages}</caption>
                  <thead className="border-b border-slate-100 text-xs text-slate-600">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">{config.titleLabel}</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Category</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Date</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Duration</th>
                      <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((r) => (
                      <tr key={r._id} className="hover:bg-slate-50/70">
                        <td className="max-w-xs px-4 py-3">
                          <button onClick={() => setViewing(r)} className="block max-w-full truncate text-left font-semibold text-slate-900 hover:text-emerald-800">{r[titleKey]}</button>
                          {r.tags?.length > 0 && <p className="mt-0.5 truncate text-xs text-slate-600">{r.tags.map((t) => `#${t}`).join("  ")}</p>}
                        </td>
                        <td className="px-4 py-3"><Badge>{r.category}</Badge></td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-700">{formatDate(r.date)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-700">{formatDuration(r.duration)}</td>
                        <td className="px-4 py-3">{rowActions(r)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((r) => (
                  <article key={r._id} className="flex flex-col rounded-xl border border-slate-300 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="line-clamp-2 text-base font-bold">{r[titleKey]}</h3>
                      <Badge>{r.category}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{formatDate(r.date)} - {formatDuration(r.duration)}</p>
                    {r.notes && <p className="mt-2 line-clamp-2 text-sm text-slate-700">{r.notes}</p>}
                    {r.tags?.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{r.tags.map((t) => <span key={t} className="badge bg-slate-100 text-slate-700">#{t}</span>)}</div>}
                    <div className="mt-auto border-t border-slate-100 pt-3">{rowActions(r)}</div>
                  </article>
                ))}
              </div>
            )}
            <Pagination pagination={pagination} onPage={list.setPage} />
          </div>
        )}
      </section>

      {formOpen && <RecordForm config={config} record={editing} onSubmit={handleSave} onClose={closeForm} />}
      <RecordDetails config={config} record={viewing} onClose={() => setViewing(null)} onEdit={openEdit} onDelete={del.ask} />
      <ConfirmDialog
        open={!!del.target}
        title={`Delete this ${noun}?`}
        message={del.target ? `"${del.target[titleKey]}" will be permanently removed. This can't be undone.` : ""}
        loading={del.busy}
        onConfirm={del.confirm}
        onCancel={del.cancel}
      />
    </>
  );
}
