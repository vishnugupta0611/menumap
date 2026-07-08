import { MdChevronRight } from "react-icons/md";

export default function MenuListItem({ item, index }) {
  return (
    <div className="flex items-center justify-between py-md px-xs hover:bg-surface-container-low/50 transition-colors rounded-xl group cursor-pointer">
      <div className="flex items-center gap-md">
        <span className="text-secondary-fixed-dim font-bold font-label-sm w-4">
          {String(index).padStart(2, '0')}
        </span>
        <div>
          <h3 className="font-headline-md text-body-lg text-on-surface group-hover:text-primary transition-colors">
            {item.name}
          </h3>
          <p className="text-label-sm text-secondary opacity-60">{item.category}</p>
        </div>
      </div>
      <div className="flex items-center gap-sm">
        <span className="font-headline-md text-body-lg text-on-surface">
          ${item.price.toFixed(2)}
        </span>
        <MdChevronRight className="text-secondary-fixed-dim opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}
