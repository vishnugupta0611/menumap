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
      "bg-white rounded-2xl overflow-hidden shadow-sm border border-outline-variant/30 hover:shadow-md transition-all duration-300 flex flex-col",
      !available && "opacity-75 grayscale-[50%]"
    )}>
      {/* Image Container */}
      <div className="w-full aspect-square relative bg-surface-container-lowest">
        <img
          src={dish.image || "https://placehold.co/400x400?text=No+Image"}
          alt={dish.name}
          className="w-full h-full object-cover"
        />
        
        {/* Availability Toggle Overlay */}
        <button 
          onClick={handleToggle}
          disabled={loading}
          className={cn(
            "absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-all cursor-pointer shadow-sm",
            available 
              ? "bg-white/80 border-green-500/30 text-green-600 hover:bg-white" 
              : "bg-black/50 border-white/20 text-white hover:bg-black/70"
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
          <div className="absolute top-2 left-2 bg-error/90 text-white px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider shadow-sm backdrop-blur-sm">
            Sold Out
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-3 flex flex-col flex-1">
        {/* Title and Veg/Non-veg */}
        <div className="flex items-start gap-2 mb-1">
          <span className={cn(
            "mt-1 w-3 h-3 flex-shrink-0 rounded-[3px] border p-[1.5px] flex items-center justify-center bg-white",
            dish.veg ? "border-green-600" : "border-red-600"
          )}>
            <span className={cn("w-full h-full rounded-full", dish.veg ? "bg-green-600" : "bg-red-600")}></span>
          </span>
          <h3 className="font-bold text-on-surface text-[15px] leading-tight line-clamp-2">
            {dish.name}
          </h3>
        </div>

        {/* Spacer to push bottom row down if title is short */}
        <div className="flex-1"></div>

        {/* Bottom Row: Price & Actions */}
        <div className="flex justify-between items-end mt-3 pt-2 border-t border-outline-variant/20">
          <div className="flex flex-col leading-tight">
            <span className="text-[#9A3412] font-bold text-[13px]">Rs</span>
            <span className="text-[#9A3412] font-bold text-lg">{dish.price}</span>
          </div>
          
          <div className="flex gap-1">
            <button 
              onClick={() => onEdit?.(dish)} 
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-surface-container-lowest text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer border border-outline-variant/30"
              title="Edit Item"
            >
              <MdEdit className="text-[16px]" />
            </button>
            <button 
              onClick={() => onDelete?.(dish.id || dish._id)} 
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-surface-container-lowest text-error/80 hover:bg-error/10 hover:text-error transition-colors cursor-pointer border border-error/20"
              title="Delete Item"
            >
              <MdDelete className="text-[16px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
