"use client";

import { useEffect, useMemo, useState } from "react";
import SearchBar from "@/components/forms/SearchBar";
import Button from "@/components/buttons/Button";
import MenuItemCard from "@/components/cards/MenuItemCard";
import FAB from "@/components/buttons/FAB";
import { CategorySectionWithEdit } from "@/components/display/CategorySection";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { MdAdd, MdCreateNewFolder } from "react-icons/md";
import MaterialIcon from "@/components/stitch/MaterialIcon";

export default function ManageMenuPage() {
  const { user } = useAuth();
  const [restaurantId, setRestaurantId] = useState("");
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadError, setLoadError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editDish, setEditDish] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    categoryId: "",
    description: "",
    veg: true,
  });
  const [imageBase64, setImageBase64] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const loadMenu = async () => {
    if (!user?.restaurantId) return;
    try {
      setRestaurantId(user.restaurantId);
      const [menuRes, catRes] = await Promise.all([
        api.get(`/api/restaurants/id/${user.restaurantId}/menu-items`),
        api.get(`/api/restaurants/id/${user.restaurantId}/categories`),
      ]);
      setItems(menuRes.data?.data || []);
      setCategories(catRes.data?.data || []);
    } catch {
      setLoadError("Menu data could not load. Please check the API connection.");
    }
  };

  useEffect(() => {
    loadMenu();
  }, [user?.restaurantId]);

  const groupedItems = useMemo(() => {
    return items.reduce((groups, item) => {
      const category = item.category || "Uncategorized";
      return { ...groups, [category]: [...(groups[category] || []), item] };
    }, {});
  }, [items]);

  async function addCategory() {
    const name = prompt("Enter category name");
    if (!name || !restaurantId) return;
    try {
      await api.post(`/api/restaurants/id/${restaurantId}/categories`, { name, sortOrder: categories.length + 1 });
      loadMenu();
    } catch (err) {
      alert("Error adding category");
    }
  }

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageBase64(reader.result);
    reader.readAsDataURL(file);
  };

  const openAddModal = () => {
    setEditDish(null);
    setFormData({ name: "", price: "", categoryId: categories[0]?._id || "", description: "", veg: true });
    setImageBase64("");
    setShowModal(true);
  };

  const openEditModal = (dish) => {
    setEditDish(dish);
    setFormData({ name: dish.name, price: dish.price, categoryId: dish.categoryId || categories[0]?._id || "", description: dish.description || "", veg: dish.veg !== undefined ? dish.veg : true });
    setImageBase64("");
    setShowModal(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!restaurantId || !formData.name || !formData.price) return;
    
    try {
      setIsUploading(true);
      let imageUrl = editDish ? editDish.image : "https://placehold.co/400x300?text=No+Image";
      
      if (imageBase64) {
        const { uploadImageToCloudinary } = await import("@/app/actions/upload-actions");
        const uploadRes = await uploadImageToCloudinary(imageBase64);
        imageUrl = uploadRes.url;
      }

      const selectedCat = categories.find((c) => c._id === formData.categoryId);
      const payload = {
        name: formData.name,
        price: parseFloat(formData.price),
        categoryId: formData.categoryId,
        category: selectedCat ? selectedCat.name : undefined,
        description: formData.description,
        image: imageUrl,
        veg: formData.veg !== undefined ? formData.veg : true,
      };

      if (editDish) {
        await api.patch(`/api/restaurants/menu-items/${editDish.id}`, payload);
      } else {
        await api.post(`/api/restaurants/id/${restaurantId}/menu-items`, { ...payload, available: true, veg: true });
      }

      setShowModal(false);
      loadMenu();
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
      await api.delete(`/api/restaurants/menu-items/${id}`);
      loadMenu();
    } catch (err) {
      alert("Error deleting item");
    }
  };

  const handleToggleAvailability = async (id, available) => {
    await api.patch(`/api/restaurants/menu-items/${id}`, { available });
  };

  const handleDeleteCategory = async (catName) => {
    const cat = categories.find(c => c.name === catName);
    if (!cat) return;
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return;
    try {
      await api.delete(`/api/categories/${cat._id}`);
      loadMenu();
    } catch (err) {
      alert("Error deleting category");
    }
  };

  const handleEditCategory = async (catName) => {
    const cat = categories.find(c => c.name === catName);
    if (!cat) return;
    const newName = prompt("Enter new category name", catName);
    if (!newName || newName === catName) return;
    try {
      await api.patch(`/api/categories/${cat._id}`, { name: newName });
      loadMenu();
    } catch (err) {
      alert("Error updating category");
    }
  };

  return (
    <>
      <section className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
        <SearchBar placeholder="Search menu items..." className="w-full md:max-w-md" />
        <div className="flex gap-3 w-full md:w-auto">
          <Button onClick={addCategory} variant="secondary" className="flex-1 md:flex-none flex items-center gap-2">
            <MdCreateNewFolder className="text-[20px]" />
            Add Category
          </Button>
          <Button onClick={openAddModal} className="flex-1 md:flex-none flex items-center gap-2">
            <MdAdd className="text-[20px]" />
            Add Menu Item
          </Button>
        </div>
      </section>

      {loadError && (
        <div className="mb-6 rounded-2xl border border-error-container bg-error-container/40 p-4 text-sm text-on-error-container">
          {loadError}
        </div>
      )}

      <div className="space-y-10">
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <CategorySectionWithEdit 
            key={category} 
            title={category} 
            itemCount={categoryItems.length}
            onEdit={() => handleEditCategory(category)}
            onDelete={() => handleDeleteCategory(category)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryItems.map((dish) => (
                <MenuItemCard 
                  key={dish._id} 
                  dish={{ ...dish, id: dish._id }}
                  onEdit={openEditModal}
                  onDelete={handleDeleteItem}
                  onToggleAvailability={handleToggleAvailability}
                />
              ))}
            </div>
          </CategorySectionWithEdit>
        ))}
      </div>

      {!loadError && items.length === 0 && (
        <div className="rounded-3xl bg-white p-8 text-center text-on-surface-variant shadow-sm">
          No menu items found.
        </div>
      )}

      <div onClick={openAddModal}>
        <FAB>
          <MdAdd className="text-[32px]" />
        </FAB>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-surface-container shadow-2xl animate-reveal max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-on-surface flex items-center gap-2">
                <MaterialIcon name={editDish ? "edit" : "add"} className="text-primary" />
                {editDish ? "Edit Menu Item" : "Add Menu Item"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
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
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                  {categories.length === 0 && (
                    <option value="">No categories found</option>
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
                  id="veg-checkbox"
                  checked={formData.veg}
                  onChange={(e) => setFormData({ ...formData, veg: e.target.checked })}
                  className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
                />
                <label htmlFor="veg-checkbox" className="text-sm font-bold text-on-surface flex items-center gap-1">
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
                {(imageBase64 || editDish?.image) && (
                  <div className="mt-2 w-full h-24 rounded-lg overflow-hidden border border-outline-variant">
                    <img src={imageBase64 || editDish.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold cursor-pointer hover:opacity-90 transition-all border-none outline-none mt-6 disabled:opacity-50"
              >
                {isUploading ? "Uploading..." : "Save Menu Item"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
