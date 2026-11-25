import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Bell, CheckCheck, Dumbbell, Target, User } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import Pagination from "../components/ui/Pagination";
import FilterTabs from "../components/ui/FilterTabs";
import DataStatus from "../components/ui/DataStatus";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import { ListSkeleton } from "../components/ui/Skeleton";
import useResourceList from "../hooks/useResourceList";
import { notificationService } from "../services/resources";
import { useNotifications } from "../context/NotificationContext";
import { useToast } from "../context/ToastContext";
import { timeAgo } from "../utils/format";

const ICONS = { activity: Activity, workout: Dumbbell, goal: Target, profile: User, system: Bell };

export default function Notifications() {
  const toast = useToast();
  const navigate = useNavigate();
  const { unreadCount, refresh } = useNotifications();
  const [busy, setBusy] = useState(false);

  const list = useResourceList(notificationService, { initial: { unread: "" }, filterKeys: ["unread"], limit: 15 });
  const { items, filters, setFilter } = list;

  // Any change reloads the list and the navbar badge together so the two never disagree.
  const run = async (fn) => {
    if (busy) return;
    setBusy(true);
    try { await fn(); await Promise.all([list.reload(), refresh()]); }
    catch (err) { toast.error(err.userMessage); }
    finally { setBusy(false); }
  };

  const open = (n) => run(async () => {
    if (!n.isRead) await notificationService.markRead(n._id);
    if (n.link) navigate(n.link);
  });

  return (
    <>
      <PageHeader title="Notifications" description={unreadCount ? `${unreadCount} unread` : "You're all caught up."}
        actions={<Button variant="secondary" icon={CheckCheck} disabled={!unreadCount} loading={busy} onClick={() => run(async () => { await notificationService.markAllRead(); toast.success("All notifications marked as read."); })}>Mark all as read</Button>} />
      <DataStatus error={list.error} hasData={!!list.data} onRetry={list.reload} />

      <div className="mb-5">
        <FilterTabs label="Filter notifications" options={[["", "All"], ["true", "Unread"]]} value={filters.unread} onChange={(unread) => setFilter({ unread })} />
      </div>

      <section className="card" aria-label="Notifications list">
        {list.loading && !list.data ? <ListSkeleton /> : list.error && !list.data ? <ErrorState error={list.error} onRetry={list.reload} /> : items.length === 0 ? (
          <EmptyState icon={Bell} title={filters.unread ? "No unread notifications" : "No notifications yet"} message="Updates about your activities, workouts and goals will appear here."
            action={filters.unread ? <Button variant="secondary" onClick={list.reset}>Show all</Button> : null} />
        ) : (
          <div aria-busy={list.loading}>
            <ul className="divide-y divide-slate-100">
              {items.map((n) => {
                const Icon = ICONS[n.type] || Bell;
                return (
                  <li key={n._id} className={`flex items-start gap-3 px-4 py-4 sm:px-5 ${n.isRead ? "" : "bg-emerald-50/60"}`}>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 ring-1 ring-slate-300"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                    <button onClick={() => open(n)} className="min-w-0 flex-1 rounded-lg text-left">
                      <span className="flex items-center gap-2 text-sm font-bold">{n.title}{!n.isRead && <span className="badge bg-emerald-100 text-emerald-900">Unread</span>}</span>
                      <span className="mt-0.5 block text-sm text-slate-700">{n.message}</span>
                      <span className="mt-1 block text-xs text-slate-600">{timeAgo(n.createdAt)}</span>
                    </button>
                    {!n.isRead && <Button size="sm" variant="ghost" onClick={() => run(() => notificationService.markRead(n._id))} disabled={busy}>Mark as read</Button>}
                  </li>
                );
              })}
            </ul>
            <Pagination pagination={list.pagination} onPage={list.setPage} />
          </div>
        )}
      </section>
    </>
  );
}
