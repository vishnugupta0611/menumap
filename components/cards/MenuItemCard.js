"use client";

import { useState } from "react";
import { MdEdit, MdDelete, MdPowerSettingsNew } from "react-icons/md";
import { cn } from "@/lib/utils";

export default function MenuItemCard({ dish, onToggleAvailability, onEdit, onDelete }) {
  const [available, setAvailable] = useState(dish.available !== false); // default to true if undefined
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (loading || !onToggleAvailability) return;
    setLoading(true);
    try {
      await onToggleAvailability(dish.id || dish._id, !available);
      setAvailable(!available);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(
      "bg-white rounded-2xl overflow-hidden shadow-sm border border-outline-variant/30 hover:shadow-md transition-all duration-300 flex flex-col h-full relative",
      !available && "opacity-80 grayscale-[40%]"
    )}>
      {/* Image Container */}
      <div className="w-full aspect-square relative bg-surface-container-lowest shrink-0">
        <img
          src={dish.image || "https://placehold.co/400x400?text=No+Image"}
          alt={dish.name}
          className="w-full h-full object-cover"
        />
        
        {/* Delete Button Overlay (Top Left) */}
        <button 
          onClick={() => onDelete?.(dish.id || dish._id)} 
          className="absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center bg-black/50 text-white/90 hover:bg-error/90 hover:text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-sm z-10"
          title="Delete Item"
        >
          <MdDelete className="text-lg" />
        </button>
        
        {/* Availability Toggle Overlay (Top Right) */}
        <button 
          onClick={handleToggle}
          disabled={loading}
          className={cn(
            "absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-all cursor-pointer shadow-sm z-10",
            available 
              ? "bg-white/90 border-green-500/30 text-green-600 hover:bg-white" 
              : "bg-black/60 border-white/20 text-white hover:bg-black/80"
          )}
          title={available ? "Mark as Unavailable" : "Mark as Available"}
        >
          {loading ? (
             <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <MdPowerSettingsNew className="text-lg" />
          )}
        </button>

        {!available && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
            <span className="bg-error/90 text-white px-3 py-1 rounded-full font-bold text-[11px] uppercase tracking-wider shadow-md backdrop-blur-sm">
              Sold Out
            </span>
          </div>
        )}

        {/* Title Overlay at the bottom of the image */}
        <div className="absolute bottom-0 left-0 right-0 p-3 pt-12 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-end gap-2">
          <span className={cn(
            "w-3.5 h-3.5 flex-shrink-0 rounded-[3px] border-2 p-[2px] flex items-center justify-center bg-white/10 backdrop-blur-sm border-white",
            dish.veg ? "border-green-400" : "border-red-400"
          )}>
            <span className={cn("w-full h-full rounded-full", dish.veg ? "bg-green-500" : "bg-red-500")}></span>
          </span>
          <h3 className="font-bold text-white text-[15px] leading-tight line-clamp-2 drop-shadow-md">
            {dish.name}
          </h3>
        </div>
      </div>

      {/* Content Container (Bottom row for Price and Edit) */}
      <div className="p-3 flex items-center justify-between flex-1 bg-white">
        <div className="flex flex-col leading-tight">
          <span className="text-[#9A3412] font-semibold text-[11px]">Rs</span>
          <span className="text-[#9A3412] font-bold text-[15px]">{dish.price}</span>
        </div>
        
        <button 
          onClick={() => onEdit?.(dish)} 
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-surface-container-lowest text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer border border-outline-variant/30"
          title="Edit Item"
        >
          <MdEdit className="text-[16px]" />
        </button>
      </div>
    </div>
  );
}
