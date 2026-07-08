import Link from "next/link";
import MaterialIcon from "@/components/stitch/MaterialIcon";

export default function DishResultCard({ dish }) {
  return (
    <Link
      href={`/${dish.restaurant.city}/${dish.restaurant.slug}/${dish.id}`}
      className="grid grid-cols-[100px_1fr] gap-4 rounded-2xl border border-surface-container bg-white p-3 hover:border-primary/30 transition-colors md:grid-cols-[140px_1fr]"
    >
      <img
        alt={dish.name}
        className="h-24 w-full rounded-xl object-cover md:h-32"
        src={dish.image}
      />
      <div className="flex min-w-0 flex-col justify-between py-1">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-sm border ${
                dish.veg ? "border-tertiary bg-tertiary" : "border-error bg-error"
              }`}
            />
            <span className="font-label-sm text-label-sm uppercase tracking-wide text-secondary">
              {dish.category}
            </span>
          </div>
          <h3 className="font-headline-md text-body-lg text-on-surface">{dish.name}</h3>
          <p className="line-clamp-2 text-sm text-on-surface-variant">{dish.description}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-headline-md text-body-lg text-primary">₹{dish.price}</span>
          <span className="flex items-center gap-1 text-sm text-on-surface-variant">
            <MaterialIcon name="star" fill className="text-[14px] text-primary" /> {dish.rating}
          </span>
        </div>
      </div>
    </Link>
  );
}