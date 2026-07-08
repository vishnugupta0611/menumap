import { MdTune } from "react-icons/md";
import { cn } from "@/lib/utils";

export default function FilterButton({ onClick, className }) {
  return (
    <button
      onClick={onClick}
      className={cn("flex items-center gap-xs px-6 py-4 bg-surface-container-low rounded-xl border border-outline-variant/30 hover:bg-surface-container-high transition-colors active:scale-95", className)}
    >
      <MdTune className="text-on-surface-variant" />
      <span className="font-body-md text-on-surface-variant">Filters</span>
    </button>
  );
}
