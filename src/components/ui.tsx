import type { OrderStatus } from "@/lib/types";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6 gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="card p-5">
      <div className="text-sm text-slate-500">{label}</div>
      <div className={`mt-2 text-3xl font-bold ${accent ? "text-brand-accent" : "text-brand"}`}>{value}</div>
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <div className="text-center text-slate-400 py-10 text-sm">{text}</div>;
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  draft: "bg-slate-100 text-slate-600",
  confirmed: "bg-blue-100 text-blue-700",
  in_production: "bg-amber-100 text-amber-700",
  ready: "bg-indigo-100 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
};

export function StatusBadge({ status, label }: { status: OrderStatus; label: string }) {
  return <span className={`badge ${STATUS_STYLES[status]}`}>{label}</span>;
}

export function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>{head.map((h, i) => <th key={i} className="th">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">{children}</tbody>
        </table>
      </div>
    </div>
  );
}
