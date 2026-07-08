import MaterialIcon from "./MaterialIcon";

export default function SearchPill({ placeholder = "Search dishes...", defaultValue = "" }) {
  return (
    <div className="relative group">
      <MaterialIcon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary" />
      <input
        className="w-full rounded-full border border-surface-container bg-white py-4 pl-12 pr-4 font-body-md shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        placeholder={placeholder}
        defaultValue={defaultValue}
        name="q"
        type="text"
      />
    </div>
  );
}
