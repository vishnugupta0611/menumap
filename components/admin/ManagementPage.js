import { AdminPanel } from "@/components/admin/AdminPanel";
import MaterialIcon from "@/components/stitch/MaterialIcon";

export default function ManagementPage({ title, eyebrow, icon, items = [], actions = [] }) {
  return (
    <div className="space-y-8">
      <div>
        <p className="font-label-sm text-label-sm uppercase text-secondary">{eyebrow}</p>
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary">{title}</h1>
      </div>
      <AdminPanel title={title} eyebrow="Manage" icon={icon}>
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <div key={item.title} className="rounded-2xl bg-surface-container-low p-5">
              <div className="mb-3 flex items-center gap-3">
                <MaterialIcon name={item.icon || icon} className="text-primary" />
                <h2 className="font-bold">{item.title}</h2>
              </div>
              <p className="text-on-surface-variant">{item.description}</p>
            </div>
          ))}
        </div>
        {actions.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            {actions.map((action) => (
              <button key={action} className="rounded-full bg-primary px-5 py-3 font-bold text-on-primary">{action}</button>
            ))}
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
