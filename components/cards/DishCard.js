import Image from "next/image";
import { cn } from "@/lib/utils";

export default function DishCard({ dish, variant = "default", className }) {
  if (variant === "horizontal") {
    return (
      <div className={cn("w-full min-w-0 snap-start dish-card-hover bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 overflow-hidden cursor-pointer", className)}>
        <div className="h-32 w-full relative">
          <img
            src={dish.image}
            alt={dish.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 flex-shrink-0 rounded-sm border-[1.5px] p-[1.5px] flex items-center justify-center ${dish.veg ? 'border-green-600' : 'border-red-600'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${dish.veg ? 'bg-green-600' : 'bg-red-600'}`}></span>
            </span>
            <h3 className="font-body-md font-semibold text-on-surface truncate">{dish.name}</h3>
          </div>
          <p className="text-primary font-bold mt-1">${dish.price.toFixed(2)}</p>
        </div>
      </div>
    );
  }

  // Default larger card
  return (
    <div className={cn("min-w-[240px] md:min-w-[280px] snap-start dish-card-hover bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 overflow-hidden cursor-pointer", className)}>
      <div className="h-40 w-full relative">
        <img
          src={dish.image}
          alt={dish.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <span className={`w-4 h-4 flex-shrink-0 rounded-sm border-2 p-[2px] flex items-center justify-center ${dish.veg ? 'border-green-600' : 'border-red-600'}`}>
              <span className={`w-2 h-2 rounded-full ${dish.veg ? 'bg-green-600' : 'bg-red-600'}`}></span>
            </span>
            <h3 className="font-headline-md text-on-surface text-lg">{dish.name}</h3>
          </div>
          {dish.isPopular && (
            <span className="bg-tertiary/10 text-tertiary text-[10px] px-2 py-1 rounded-full font-bold uppercase">
              Popular
            </span>
          )}
        </div>
        <p className="text-on-surface-variant text-body-md mt-1 line-clamp-1">
          {dish.description}
        </p>
        <p className="text-primary font-bold mt-2 text-lg">${dish.price.toFixed(2)}</p>
      </div>
    </div>
  );
}
