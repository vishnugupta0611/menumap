"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const categories = ["All Items", "Starters", "Main Course", "Beverages", "Desserts", "Signature"];

export default function CategoryPills({ onCategoryChange }) {
  const [active, setActive] = useState("All Items");

  const handleClick = (category) => {
    setActive(category);
    if (onCategoryChange) onCategoryChange(category);
  };

  return (
    <div className="overflow-x-auto no-scrollbar -mx-margin-mobile px-margin-mobile">
      <div className="flex gap-xs whitespace-nowrap">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleClick(category)}
            className={cn(
              "px-md py-xs rounded-full font-label-sm transition-all",
              active === category
                ? "bg-primary text-on-primary shadow-md"
                : "bg-surface-container-low text-secondary hover:bg-surface-container-high"
            )}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
