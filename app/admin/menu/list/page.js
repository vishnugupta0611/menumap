"use client";

import { useState } from "react";
import Link from "next/link";
import MaterialIcon from "@/components/stitch/MaterialIcon";

export default function MenuListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [items, setItems] = useState([
    { id: 1, name: "Truffle Arancini", category: "Starters", price: 14.0, veg: true },
    { id: 2, name: "Yellowtail Crudo", category: "Starters", price: 18.5, veg: false },
    { id: 3, name: "Dry-Aged Ribeye", category: "Mains", price: 48.0, veg: false },
    { id: 4, name: "Handmade Tagliatelle", category: "Mains", price: 24.0, veg: true },
  ]);

  const categories = ["All", "Starters", "Mains"];

  const deleteItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-background text-on-surface min-h-screen pb-32">
      {/* Header */}
      <div className="mb-lg space-y-xs">
        <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Our Menu (Text List)</h2>
        <p className="text-secondary font-body-md opacity-70">A compact checklist of your menu catalog.</p>
      </div>

      {/* Search & Actions */}
      <section className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <MaterialIcon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            className="w-full pl-12 pr-4 py-3 bg-surface-container border-none rounded-xl focus:ring-2 focus:ring-primary transition-all outline-none text-body-md"
            placeholder="Search menu items..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full font-label-sm text-label-sm whitespace-nowrap active:scale-95 transition-all cursor-pointer border-none ${
                selectedCategory === cat
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-container text-on-surface hover:bg-surface-variant"
              }`}
            >
              {cat}
            </button>
          ))}
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary-container/10 text-primary rounded-full font-label-sm text-label-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer border-none font-bold">
            <MaterialIcon name="add" className="text-primary text-[18px]" />
            Add Item
          </button>
        </div>
      </section>

      {/* Menu List Table */}
      <div className="bg-surface-container-lowest rounded-3xl p-sm shadow-[0px_10px_30px_rgba(0,0,0,0.04)] border border-surface-container overflow-hidden">
        <div className="divide-y divide-surface-container">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors duration-200"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-sm font-semibold text-on-surface-variant w-8">{index + 1}</span>
                  <span className={`w-2.5 h-2.5 rounded-full ${item.veg ? "bg-tertiary" : "bg-error"}`} />
                  <span className="font-bold text-on-surface truncate font-body-lg">{item.name}</span>
                  <span className="text-xs bg-surface-container px-2 py-0.5 rounded-md text-on-surface-variant">
                    {item.category}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="font-bold text-primary">${item.price.toFixed(2)}</span>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors cursor-pointer bg-transparent border-none">
                      <MaterialIcon name="edit" className="text-[20px]" />
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-2 rounded-lg hover:bg-error-container/20 text-error transition-colors cursor-pointer bg-transparent border-none"
                    >
                      <MaterialIcon name="delete" className="text-[20px]" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center text-on-surface-variant font-body-lg">
              No menu items found matching the queries.
            </div>
          )}
        </div>
      </div>

      {/* FAB for Quick Entry */}
      <Link
        href="/admin/menu/quick-entry"
        className="fixed bottom-24 right-6 md:bottom-12 md:right-12 w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 z-40 cursor-pointer border-none"
      >
        <MaterialIcon name="add" className="text-[32px] text-white" />
      </Link>
    </div>
  );
}
