"use client";

import { useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import { galleryData } from "@/lib/galleryData";
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
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryFormName, setCategoryFormName] = useState("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
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

  const [showGallery, setShowGallery] = useState(false);
  const [galleryQuery, setGalleryQuery] = useState("");
  const [galleryResults, setGalleryResults] = useState([]);
  const [selectedGalleryCategory, setSelectedGalleryCategory] = useState(null);

  const fuse = useMemo(() => new Fuse(galleryData, {
    keys: ['termName'],
    threshold: 0.6,
    ignoreLocation: true,
    includeScore: true
  }), []);

  const defaultGalleryImages = useMemo(() => {
    const allImgs = [];
    galleryData.forEach(cat => cat.imageUrls.forEach(url => allImgs.push({ term: cat.termName, url })));
    return allImgs.sort(() => 0.5 - Math.random()).slice(0, 12);
  }, []);

  const handleGallerySearch = (query) => {
    setGalleryQuery(query);
    if (!query.trim()) {
      setGalleryResults([]);
      setSelectedGalleryCategory(null);
      return;
    }
    const results = fuse.search(query).map(r => r.item);
    setGalleryResults(results);
    if (results.length > 0) {
      setSelectedGalleryCategory(results[0]);
    }
  };

  const openGallery = () => {
    if (formData.name) {
      handleGallerySearch(formData.name);
    } else {
      handleGallerySearch("");
    }
    setShowGallery(true);
  };
  
  const handleSelectGalleryImage = (url) => {
    setImageBase64(url);
    setShowGallery(false);
  };

  const loadMenu = async () => {
    if (!user?.restaurantId) return;
    try {
      setRestaurantId(user.restaurantId);
      const [menuRes, catRes] = await Promise.all([
        api.get(`/api/restaurants/id/${user.restaurantId}/menu-items`),
        api.get(`/api/restaurants/id/${user.restaurantId}/categories`),
      ]);
      
      const fetchedItems = menuRes.data?.data || [];
      let fetchedCategories = catRes.data?.data || [];
      
      // Auto-sync missing categories from items (e.g. added by AI)
      const existingCatNames = new Set(fetchedCategories.map(c => c.name));
      const missingCats = [...new Set(fetchedItems.map(i => i.category).filter(c => c && !existingCatNames.has(c)))];
      
      if (missingCats.length > 0) {
        const newCats = await Promise.all(missingCats.map((name, index) => 
          api.post(`/api/restaurants/id/${user.restaurantId}/categories`, { 
            name, 
            sortOrder: fetchedCategories.length + index + 1 
          }).then(res => res.data.data)
        ));
        fetchedCategories = [...fetchedCategories, ...newCats];
      }
      
      setItems(fetchedItems);
      setCategories(fetchedCategories);
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

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryFormName.trim() || !restaurantId) return;
    try {
      await api.post(`/api/restaurants/id/${restaurantId}/categories`, { name: categoryFormName, sortOrder: categories.length + 1 });
      setCategoryFormName("");
      setShowCategoryModal(false);
      loadMenu();
    } catch (err) {
      alert("Error adding category");
    }
  };

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
    setShowDescription(false);
    setShowModal(true);
  };

  const openEditModal = (dish) => {
    setEditDish(dish);
    setFormData({ name: dish.name, price: dish.price, categoryId: dish.categoryId || categories[0]?._id || "", description: dish.description || "", veg: dish.veg !== undefined ? dish.veg : true });
    setImageBase64("");
    setShowDescription(!!dish.description);
    setShowModal(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!restaurantId || !formData.name || !formData.price) return;
    
    try {
      setIsUploading(true);
      let imageUrl = editDish ? editDish.image : "https://placehold.co/400x300?text=No+Image";
      
      if (imageBase64) {
        if (imageBase64.startsWith('http')) {
          imageUrl = imageBase64;
        } else {
          const { uploadImageToCloudinary } = await import("@/app/actions/upload-actions");
          const uploadRes = await uploadImageToCloudinary(imageBase64);
          imageUrl = uploadRes.url;
        }
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
      await api.delete(`/api/restaurants/categories/${cat._id}`);
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
      await api.patch(`/api/restaurants/categories/${cat._id}`, { name: newName });
      
      // We also need to update the string `category` on all items that had this category
      // to keep groupedItems working correctly since it relies on the string `category`
      const itemsToUpdate = items.filter(i => i.category === catName);
      await Promise.all(itemsToUpdate.map(item => 
        api.patch(`/api/restaurants/menu-items/${item._id}`, { category: newName })
      ));
      
      loadMenu();
    } catch (err) {
      alert("Error updating category");
    }
  };

  return (
    <>
      <section className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
        <SearchBar placeholder="Search menu items..." className="w-full md:max-w-md" />
        <div className="flex gap-2 w-full md:w-auto justify-end">
          <Button onClick={() => setShowCategoryModal(true)} variant="secondary" className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm shadow-sm hover:shadow-md transition-all cursor-pointer">
            <MdCreateNewFolder className="text-[18px]" />
            Category
          </Button>
          <Button onClick={openAddModal} className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm shadow-md hover:shadow-lg transition-all cursor-pointer">
            <MdAdd className="text-[18px]" />
            Item
          </Button>
        </div>
      </section>

      {/* Categories Row */}
      <div className="flex overflow-x-auto gap-3 pb-3 mb-6 no-scrollbar">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="px-5 py-2 rounded-xl font-bold whitespace-nowrap bg-primary text-white shadow-sm cursor-pointer border-none"
        >
          All
        </button>
        {categories.map(c => (
          <button 
            key={c._id}
            onClick={() => {
              const el = document.getElementById(`category-${c.name}`);
              if (el) {
                const y = el.getBoundingClientRect().top + window.scrollY - 100;
                window.scrollTo({ top: y, behavior: 'smooth' });
              }
            }}
            className="px-5 py-2 rounded-xl font-bold whitespace-nowrap bg-surface-container-low text-on-surface hover:bg-surface-container shadow-sm border border-outline-variant/30 cursor-pointer transition-colors"
          >
            {c.name}
          </button>
        ))}
      </div>

      {loadError && (
        <div className="mb-6 rounded-2xl border border-error-container bg-error-container/40 p-4 text-sm text-on-error-container">
          {loadError}
        </div>
      )}

      <div className="space-y-10">
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <div key={category} id={`category-${category}`}>
            <CategorySectionWithEdit 
              title={category} 
              itemCount={categoryItems.length}
              onEdit={() => handleEditCategory(category)}
              onDelete={() => handleDeleteCategory(category)}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-5">
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
          </div>
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
              <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
                <MaterialIcon name={editDish ? "edit" : "add"} className="text-primary" />
              </h3>
              <div className="flex items-center gap-3">
                {!showDescription && (
                  <button 
                    type="button" 
                    onClick={() => setShowDescription(true)}
                    className="text-primary text-[11px] sm:text-xs font-bold hover:underline bg-transparent border-none cursor-pointer flex items-center gap-0.5 p-0 mr-1 sm:mr-2 whitespace-nowrap"
                  >
                    <MaterialIcon name="add" className="text-[14px]" /> Add Desc
                  </button>
                )}
                <button
                  type="submit"
                  form="item-form"
                  disabled={isUploading}
                  className="px-4 py-1.5 bg-primary text-white rounded-full font-bold text-sm cursor-pointer hover:bg-primary/90 transition-all border-none outline-none disabled:opacity-50"
                >
                  {isUploading ? "..." : "Save"}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="material-symbols-outlined text-on-surface-variant bg-transparent border-none hover:scale-110 cursor-pointer"
                >
                  close
                </button>
              </div>
            </div>
            <form id="item-form" onSubmit={handleSaveItem} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Item Name</label>
                  <input
                    className="w-full h-10 px-3 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-body-md"
                    type="text"
                    placeholder="e.g. Samosa"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Price (INR)</label>
                  <input
                    className="w-full h-10 px-3 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-body-md"
                    type="number"
                    placeholder="250"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Category</label>
                  <div 
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    className="w-full h-10 px-3 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus-within:border-primary text-body-md flex items-center justify-between cursor-pointer transition-colors hover:bg-surface-container-low"
                  >
                    <span className={`truncate ${formData.categoryId ? "text-on-surface" : "text-on-surface-variant"}`}>
                      {categories.find(c => c._id === formData.categoryId)?.name || "Select Category"}
                    </span>
                    <MaterialIcon name="arrow_drop_down" className={`transition-transform text-on-surface-variant ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>
                  
                  {isCategoryDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsCategoryDropdownOpen(false)}></div>
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-outline-variant shadow-xl rounded-xl overflow-hidden z-50 max-h-48 overflow-y-auto custom-scrollbar animate-reveal origin-top">
                        {categories.map((c) => (
                          <div 
                            key={c._id}
                            onClick={() => { setFormData({ ...formData, categoryId: c._id }); setIsCategoryDropdownOpen(false); }}
                            className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${formData.categoryId === c._id ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-surface-container-low text-on-surface'}`}
                          >
                            {c.name}
                          </div>
                        ))}
                        {categories.length === 0 && (
                          <div className="px-4 py-3 text-sm text-on-surface-variant italic">No categories found</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <div className="flex flex-col justify-end">
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Type</label>
                  <div className="relative">
                    <select
                      value={formData.veg ? "veg" : "non-veg"}
                      onChange={(e) => setFormData({ ...formData, veg: e.target.value === "veg" })}
                      className="w-full h-10 px-3 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-body-md appearance-none cursor-pointer"
                    >
                      <option value="veg">Veg</option>
                      <option value="non-veg">Non-Veg</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-on-surface-variant">
                      <MaterialIcon name="expand_more" />
                    </div>
                  </div>
                </div>
              </div>

              {showDescription && (
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Description</label>
                  <textarea
                    className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-body-md resize-none"
                    rows="2"
                    placeholder="Brief description of the item"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Item Image</label>
                <div className="flex gap-2 mb-2">
                  <button 
                    type="button"
                    onClick={() => document.getElementById('image-upload').click()}
                    className="flex-1 py-2 px-2 rounded-xl border border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low transition-colors text-[10px] sm:text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-on-surface cursor-pointer"
                  >
                    <MaterialIcon name="upload" className="text-[16px]" /> Upload Image
                  </button>
                  <button 
                    type="button"
                    onClick={openGallery}
                    className="flex-1 py-2 px-2 rounded-xl border border-transparent bg-primary/10 hover:bg-primary/20 transition-colors text-[10px] sm:text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-primary cursor-pointer"
                  >
                    <MaterialIcon name="imagesmode" className="text-[16px]" /> Choose from Gallery
                  </button>
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                {(imageBase64 || editDish?.image) && (
                  <div className="mt-2 w-full h-40 rounded-lg overflow-hidden border border-outline-variant relative group">
                    <img src={imageBase64 || editDish.image} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImageBase64("")} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-error transition-colors cursor-pointer opacity-0 group-hover:opacity-100">
                      <MaterialIcon name="close" />
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full border border-surface-container shadow-2xl animate-reveal">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-on-surface flex items-center gap-2">
                <MaterialIcon name="create_new_folder" className="text-primary" />
                Add Category
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="material-symbols-outlined text-on-surface-variant bg-transparent border-none hover:scale-110 cursor-pointer"
              >
                close
              </button>
            </div>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Category Name</label>
                <input
                  className="w-full h-11 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-body-md"
                  type="text"
                  placeholder="e.g. Starters"
                  required
                  value={categoryFormName}
                  onChange={(e) => setCategoryFormName(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 bg-primary text-on-primary rounded-xl font-bold cursor-pointer hover:bg-primary/90 transition-all border-none outline-none mt-2 shadow-md"
              >
                Create Category
              </button>
            </form>
          </div>
        </div>
      )}
      {showGallery && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowGallery(false)}>
          <div 
            className="w-full h-[90vh] bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] animate-slide-up flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 md:p-6 border-b border-outline-variant/30 flex flex-col gap-4 bg-surface-container-lowest shrink-0">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-xl text-on-surface flex items-center gap-2">
                  <MaterialIcon name="image_search" className="text-primary" /> Inspiration Gallery
                </h3>
                <button
                  onClick={() => setShowGallery(false)}
                  className="material-symbols-outlined text-on-surface-variant bg-transparent border-none hover:scale-110 cursor-pointer"
                >
                  close
                </button>
              </div>
              <div className="relative">
                <MaterialIcon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input 
                  type="text" 
                  placeholder="Search for burger, pizza, momos..."
                  className="w-full h-12 pl-12 pr-4 rounded-full border border-outline-variant bg-surface-container-lowest outline-none focus:border-primary text-body-lg shadow-sm"
                  value={galleryQuery}
                  onChange={e => handleGallerySearch(e.target.value)}
                />
              </div>
              
              {galleryResults.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {galleryResults.slice(0, 8).map((match, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedGalleryCategory(match)}
                      className={`px-4 py-2 rounded-full border text-sm font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${selectedGalleryCategory?.termName === match.termName ? "bg-primary text-white border-primary" : "bg-surface-container-lowest text-on-surface hover:bg-surface-container-low border-outline-variant"}`}
                    >
                      <MaterialIcon name="search" className="text-[16px]" /> {match.termName}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-surface-container-lowest custom-scrollbar">
              {!galleryQuery && !selectedGalleryCategory && (
                <div className="mb-4 text-on-surface-variant font-medium">Daily Inspiration</div>
              )}
              {selectedGalleryCategory && (
                <div className="mb-4 text-on-surface-variant font-medium">Results for &quot;{selectedGalleryCategory.termName}&quot;</div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {(selectedGalleryCategory 
                  ? selectedGalleryCategory.imageUrls.map(url => ({ term: selectedGalleryCategory.termName, url }))
                  : defaultGalleryImages
                ).map((img, idx) => (
                  <div 
                    key={idx} 
                    className="relative aspect-[4/3] rounded-2xl overflow-hidden group cursor-pointer border border-outline-variant/30 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
                    onClick={() => handleSelectGalleryImage(img.url)}
                  >
                    <img src={img.url} alt={img.term} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-white text-xs font-bold truncate">{img.term}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {galleryQuery && galleryResults.length === 0 && (
                <div className="text-center py-10 text-on-surface-variant flex flex-col items-center">
                  <MaterialIcon name="image_not_supported" className="text-4xl mb-2 opacity-50" />
                  <p>No images found for &quot;{galleryQuery}&quot;</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
