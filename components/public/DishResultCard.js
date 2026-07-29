import Link from "next/link";
import MaterialIcon from "@/components/stitch/MaterialIcon";

export default function DishResultCard({ dish }) {
  const displayRating = dish.rating > 0 ? dish.rating : dish.restaurant?.rating || "New";

  return (
    <Link
      href={`/${dish.restaurant.city}/${dish.restaurant.slug}/${dish.id}`}
      className="group grid grid-cols-[110px_1fr] md:grid-cols-[140px_1fr] gap-4 rounded-3xl border border-outline-variant/30 bg-surface p-3 hover:border-primary/40 hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      <div className="relative h-28 w-full md:h-32 rounded-2xl overflow-hidden shrink-0 shadow-sm bg-surface-variant/30">
        <img
          alt={dish.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={dish.image || '/placeholder-food.jpg'}
        />
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
           <span className={`h-2.5 w-2.5 rounded-sm ${dish.veg ? "bg-tertiary" : "bg-error"}`} />
        </div>
      </div>
      
      <div className="flex min-w-0 flex-col justify-between py-1 pr-1">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
             <span className="font-label-sm text-[10px] md:text-xs uppercase tracking-wider text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
               {dish.category}
             </span>
             <span className="flex items-center gap-1 text-xs font-bold text-on-surface bg-surface-variant/50 px-2 py-1 rounded-lg shadow-sm group-hover:bg-primary/10 group-hover:text-primary transition-colors">
               <MaterialIcon name="star" fill className="text-[12px] text-orange-500" /> {displayRating}
             </span>
          </div>
          <h3 className="font-headline-md text-body-lg md:text-lg text-on-surface group-hover:text-primary transition-colors truncate">{dish.name}</h3>
          <p className="line-clamp-1 text-xs text-on-surface-variant/80 mt-0.5 flex items-center gap-1">
            <MaterialIcon name="storefront" className="text-[12px]" />
            {dish.restaurant?.name || "HeyRestro Partner"}
          </p>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <span className="font-headline-md text-[16px] md:text-lg font-black text-on-surface">₹{dish.price}</span>
          <span className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center bg-primary text-white rounded-full group-hover:scale-110 transition-transform shadow-sm">
             <MaterialIcon name="arrow_forward" className="text-sm md:text-base text-white" />
          </span>
        </div>
      </div>
    </Link>
  );
}