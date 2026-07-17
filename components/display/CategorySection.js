import Link from "next/link";
import { MdDragIndicator, MdEdit, MdAddCircle, MdDelete } from "react-icons/md";

export default function CategorySection({ title, itemCount, children, showHeader = true }) {
  if (!showHeader) {
    return <section className="mb-xl animate-fade-in">{children}</section>;
  }

  return (
    <section className="mb-xl animate-fade-in">
      <div className="flex justify-between items-end mb-sm">
        <div>
          <h2 className="font-headline-md text-on-surface">{title}</h2>
          <p className="text-on-surface-variant text-label-sm uppercase tracking-tighter">
            {itemCount} Active Items
          </p>
        </div>
        <Link href="#" className="text-primary font-bold text-body-md hover:underline">
          See All
        </Link>
      </div>
      {children}
    </section>
  );
}

export function CategorySectionWithEdit({ title, itemCount, children, onEdit, onDelete }) {
  return (
    <section className="group mb-10">
      <div className="flex flex-wrap items-center justify-between mb-4 border-b border-outline-variant pb-2 gap-2">
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
          <MdDragIndicator className="cursor-grab text-on-surface-variant shrink-0" />
          <h2 className="font-headline-sm md:font-headline-md text-on-surface truncate">{title}</h2>
          <span className="bg-primary-container/10 text-primary px-2 md:px-3 py-0.5 rounded-full text-[10px] md:text-label-sm font-label-sm whitespace-nowrap shrink-0">
            {itemCount} Items
          </span>
        </div>
        <div className="flex gap-1 shrink-0">
          <button onClick={onEdit} className="p-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer border-none bg-transparent rounded-lg hover:bg-surface-container">
            <MdEdit />
          </button>
          <button onClick={onDelete} className="p-2 text-on-surface-variant hover:text-error transition-colors cursor-pointer border-none bg-transparent rounded-lg hover:bg-error-container/20">
            <MdDelete className="text-xl" />
          </button>
        </div>
      </div>
      {children}
    </section>
  );
}

import { cn } from "@/lib/utils";

export function AddNewItemCard({ label = "New Item", className }) {
  return (
    <div className={cn("snap-start flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/40 rounded-2xl hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer h-full min-h-[200px] w-full min-w-0", className)}>
      <MdAddCircle className="text-outline text-4xl" />
      <span className="font-label-sm text-outline mt-2">{label}</span>
    </div>
  );
}
