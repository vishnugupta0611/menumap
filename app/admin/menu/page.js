"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SearchBar from "@/components/forms/SearchBar";
import FilterButton from "@/components/forms/FilterButton";
import CategorySection, { AddNewItemCard } from "@/components/display/CategorySection";
import DishCard from "@/components/cards/DishCard";
import FAB from "@/components/buttons/FAB";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { MdAdd } from "react-icons/md";
import MaterialIcon from "@/components/stitch/MaterialIcon";

export default function AdminMenuPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadError, setLoadError] = useState("");

  const [showItemModal, setShowItemModal] = useState(false);
  const [editDish, setEditDish] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "Starters",
    description: "",
    veg: true,
  });
  const [itemImageBase64, setItemImageBase64] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    async function loadMenu() {
      if (!user?.restaurantId) return;
      try {
        const [menuItemsRes, catsRes] = await Promise.all([
          api.get(`/api/restaurants/id/${user.restaurantId}/menu-items`),
          api.get(`/api/restaurants/id/${user.restaurantId}/categories`),
        ]);
        setItems(menuItemsRes.data?.data || []);
        setCategories(catsRes.data?.data || []);
      } catch {
        setLoadError("Menu manager could not load. Please check the API connection.");
      }
    }

    loadMenu();
  }, [user?.restaurantId]);

  const groupedItems = useMemo(() => {
    return items.reduce((groups, item) => {
      const category = item.category || "Uncategorized";
      return { ...groups, [category]: [...(groups[category] || []), item] };
    }, {});
  }, [items]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setItemImageBase64(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!user?.restaurantId || !formData.name || !formData.price || !formData.category) return;
    try {
      setIsUploading(true);
      let imageUrl = editDish ? editDish.image : "https://lh3.googleusercontent.com/aida-public/AB6AXuASppmYxdiLL7vF7CEWLnkfTFe12PocW63F6Y9F9EQzPleGi9VGgwLc6147SX0xQoh2d0cABi60x9zFYLC12wXQkD-8zW2LQ4h9nwT3PsowQ4ugRSeea1MBpZAIHNonwNZBEHcfj14zIG_eOwW57mPmNuziiYWmrS6zrTgGCwM8q8_kXGxqYGakW9ROUa8AffzgMlFvTav3olGu2p3YC5i1uPgMkrTONaSeDXwQIZrtnPxaYy8LF-QN";
      if (itemImageBase64) {
        const { uploadImageToCloudinary } = await import("@/app/actions/upload-actions");
        const uploadRes = await uploadImageToCloudinary(itemImageBase64);
        imageUrl = uploadRes.url;
      }

      const selectedCat = categories.find(c => c.name === formData.category);
      const payload = {
        name: formData.name,
        price: parseFloat(formData.price) || 0,
        category: formData.category,
        categoryId: selectedCat ? selectedCat._id : undefined,
        description: formData.description,
        veg: formData.veg !== undefined ? formData.veg : true,
        image: imageUrl,
      };

      if (editDish) {
        await api.patch(`/api/menu-items/${editDish._id}`, payload);
      } else {
        await api.post(`/api/restaurants/id/${user.restaurantId}/menu-items`, { ...payload, available: true });
      }

      // Reload menu
      const menuItemsRes = await api.get(`/api/restaurants/id/${user.restaurantId}/menu-items`);
      setItems(menuItemsRes.data?.data || []);
      setShowItemModal(false);
    } catch (err) {
      console.error(err);
      alert("Error saving menu item");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await api.delete(`/api/menu-items/${id}`);
      const menuItemsRes = await api.get(`/api/restaurants/id/${user.restaurantId}/menu-items`);
      setItems(menuItemsRes.data?.data || []);
      setShowItemModal(false);
    } catch (err) {
      alert("Error deleting item");
    }
  };

  const openAddModal = (defaultCategory) => {
    setEditDish(null);
    setFormData({ name: "", price: "", category: defaultCategory || "Starters", description: "", veg: true });
    setItemImageBase64("");
    setShowItemModal(true);
  };

  const openEditModal = (dish) => {
    setEditDish(dish);
    setFormData({ name: dish.name, price: dish.price, category: dish.category || "Uncategorized", description: dish.description || "", veg: dish.veg !== undefined ? dish.veg : true });
    setItemImageBase64("");
    setShowItemModal(true);
  };

  return (
    <>
      <section className="mb-lg">
        <div className="flex flex-col md:flex-row gap-sm items-center">
          <SearchBar placeholder="Search dishes, ingredients, or prices..." className="w-full max-w-2xl" />
          <FilterButton />
          {/* Removed Quick Entry link as requested */}
        </div>
      </section>

      {loadError && (
        <div className="mb-6 rounded-2xl border border-error-container bg-error-container/40 p-4 text-sm text-on-error-container">
          {loadError}
        </div>
      )}

      {Object.entries(groupedItems).map(([category, categoryItems]) => (
        <CategorySection key={category} title={category} itemCount={categoryItems.length}>
          <div className="flex gap-gutter overflow-x-auto no-scrollbar pb-xs snap-x">
            {categoryItems.map((dish) => (
              <div key={dish._id} onClick={() => openEditModal(dish)}>
                <DishCard dish={{ ...dish, id: dish._id }} variant="horizontal" />
              </div>
            ))}
            <div onClick={() => openAddModal(category)}>
              <AddNewItemCard label="New Item" />
            </div>
          </div>
        </CategorySection>
      ))}

      {!loadError && items.length === 0 && (
        <div className="rounded-3xl bg-white p-8 text-center text-on-surface-variant shadow-sm">
          No menu items found.
        </div>
      )}

      <div onClick={() => openAddModal(categories[0]?.name)}>
        <FAB>
          <MdAdd className="text-[32px]" />
        </FAB>
      </div>

      {/* Add Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-surface-container shadow-2xl animate-reveal">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-on-surface flex items-center gap-2">
                <MaterialIcon name={editDish ? "edit" : "add"} className="text-primary" />
                {editDish ? "Edit Menu Item" : "Add Menu Item"}
              </h3>
              <button
                onClick={() => setShowItemModal(false)}
                className="material-symbols-outlined text-on-surface-variant bg-transparent border-none hover:scale-110 cursor-pointer"
              >
                close
              </button>
            </div>
            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-2">Item Name</label>
                <input
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-body-md"
                  type="text"
                  placeholder="e.g. Samosa"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-2">Category</label>
                <select
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-body-md"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c.name}>{c.name}</option>
                  ))}
                  {categories.length === 0 && (
                    <option value="Uncategorized">Uncategorized</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-2">Price (INR)</label>
                <input
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-body-md"
                  type="number"
                  placeholder="250"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-2">Description</label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-body-md resize-none"
                  rows="3"
                  placeholder="Brief description of the item"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="veg-checkbox-menu"
                  checked={formData.veg}
                  onChange={(e) => setFormData({ ...formData, veg: e.target.checked })}
                  className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                />
                <label htmlFor="veg-checkbox-menu" className="text-sm font-bold text-on-surface flex items-center gap-1 cursor-pointer">
                  <span className={`w-4 h-4 rounded-full border-2 p-[2px] flex items-center justify-center ${formData.veg ? 'border-green-600' : 'border-red-600'}`}>
                    <span className={`w-2 h-2 rounded-full ${formData.veg ? 'bg-green-600' : 'bg-red-600'}`}></span>
                  </span>
                  {formData.veg ? 'Veg' : 'Non-Veg'}
                </label>
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-2">Item Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-container file:text-primary hover:file:bg-primary-container/80 cursor-pointer"
                />
                {(itemImageBase64 || editDish?.image) && (
                  <div className="mt-2 w-full h-24 rounded-lg overflow-hidden border border-outline-variant">
                    <img src={itemImageBase64 || editDish.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 mt-6">
                {editDish && (
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(editDish._id)}
                    className="flex-1 py-4 bg-error-container text-on-error-container rounded-xl font-bold cursor-pointer hover:opacity-90 transition-all border-none outline-none"
                  >
                    Delete
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-[2] py-4 bg-primary text-on-primary rounded-xl font-bold cursor-pointer hover:opacity-90 transition-all border-none outline-none disabled:opacity-50"
                >
                  {isUploading ? "Saving..." : "Save Menu Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
