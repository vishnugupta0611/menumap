"use client";

import { useState } from "react";
import { MdEdit, MdDelete } from "react-icons/md";
import { cn } from "@/lib/utils";

export default function MenuItemCard({ dish, onToggleAvailability, onEdit, onDelete }) {
  const [available, setAvailable] = useState(dish.available);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (loading || !onToggleAvailability) return;
    setLoading(true);
    try {
      await onToggleAvailability(dish.id, !available);
      setAvailable(!available);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(
      "glass-card rounded-xl overflow-hidden custom-shadow hover:translate-y-[-4px] transition-all duration-300",
      !available && "opacity-70"
    )}>
      <div className="h-40 w-full relative">
        <img
          src={dish.image || "https://placehold.co/400x300?text=No+Image"}
          alt={dish.name}
          className={cn("w-full h-full object-cover", !available && "grayscale")}
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-primary font-bold shadow-sm">
          ₹{dish.price.toFixed(2)}
        </div>
        {!available && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <span className="bg-white/90 text-on-background px-4 py-1 rounded-full font-bold text-sm">
              Sold Out
            </span>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className={`w-4 h-4 flex-shrink-0 rounded-sm border-2 p-[2px] flex items-center justify-center ${dish.veg ? 'border-green-600' : 'border-red-600'}`}>
              <span className={`w-2 h-2 rounded-full ${dish.veg ? 'bg-green-600' : 'bg-red-600'}`}></span>
            </span>
            <h3 className="font-headline-md text-[18px]">{dish.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-label-sm text-on-surface-variant">Available</span>
            <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200 ease-in">
              <input
                type="checkbox"
                checked={available}
                onChange={handleToggle}
                disabled={loading}
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-surface-variant checked:bg-primary"
                id={`toggle-${dish.id}`}
              />
              <label
                className="toggle-label block overflow-hidden h-6 rounded-full bg-surface-variant cursor-pointer"
                htmlFor={`toggle-${dish.id}`}
              />
            </div>
          </div>
        </div>
        <p className="text-on-surface-variant text-sm mb-4 line-clamp-2">
          {dish.description}
        </p>
        <div className="flex justify-end gap-2 border-t border-surface-variant pt-4">
          <button onClick={() => onEdit?.(dish)} className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors cursor-pointer border-none bg-transparent">
            <MdEdit className="text-[20px]" />
          </button>
          <button onClick={() => onDelete?.(dish.id)} className="p-2 rounded-lg hover:bg-error-container/20 text-error transition-colors cursor-pointer border-none bg-transparent">
            <MdDelete className="text-[20px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
