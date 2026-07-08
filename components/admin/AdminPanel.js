import MaterialIcon from "@/components/stitch/MaterialIcon";

export function AdminPanel({ title, eyebrow, icon = "settings", children, action }) {
  return (
    <section className="rounded-3xl border border-surface-container bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-fixed text-primary">
            <MaterialIcon name={icon} />
          </div>
          <div>
            {eyebrow && <p className="font-label-sm text-label-sm uppercase text-secondary">{eyebrow}</p>}
            <h2 className="font-headline-md text-headline-md text-on-surface">{title}</h2>
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function MetricCard({ label, value, icon, tone = "primary" }) {
  return (
    <div className="rounded-2xl border border-surface-container bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-label-sm text-label-sm uppercase text-secondary">{label}</span>
        <MaterialIcon name={icon} className={tone === "green" ? "text-tertiary" : "text-primary"} />
      </div>
      <p className="font-display-lg-mobile text-display-lg-mobile text-on-surface">{value}</p>
    </div>
  );
}
