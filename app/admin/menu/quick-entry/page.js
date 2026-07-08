"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MaterialIcon from "@/components/stitch/MaterialIcon";

export default function QuickEntryPage() {
  const router = useRouter();
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [isVeg, setIsVeg] = useState(true);

  const [addedItems, setAddedItems] = useState([
    {
      id: 1,
      name: "Wild Mushroom Risotto",
      description: "Arborio rice, porcini mushrooms, parmesan zest.",
      price: 24.0,
      veg: true,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDHAcGyQ7ZOghyR5VS-Nk43U5UmU6QQOrGApRbHoODsFXpw-KfkjSRHWAhLb60Z0EOBeRg9xmGMrJL6jSm-utd11fN4RYct3ndu-1NoToBFg2YlbrB3dRuTQs48mR7g1qwXRL9MnKz-AOcU6BAP6VVICcILVUclJ9DdMWr1Wk5YrGGi6jGS0j9sL0dC0pxUdNvq4ZeWY1DeY8eRtTpX94qFVDFwMgUVy2ccaqYZyAuqAJg5VgBO-8kI",
    },
    {
      id: 2,
      name: "Wagyu Ribeye",
      description: "A5 Grade Wagyu, charred asparagus, bordelaise sauce.",
      price: 85.0,
      veg: false,
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAereizXa4qWgOLfWW10bCg5tTdlCn1L_gb_IcTRWxzQnla7jHa12--7DtLgTXblDCaTIsBnGuQT9BBdnnNb5nsSF2onF23xO1qAdKZNJuJNVjS05IM3N6A6bjJVMH6ke1RiBxaKJX4379Ugjgbsunbd6oh8I34B3e5JIFbAwar74QbXh9CQ8DySc7D4Zhwg85M8Q1DgMio5MmlK6ehdtZCYdofVqZ6Ys4KFAOSh0nsxxMo12gr70-T",
    },
  ]);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!itemName || !price) return;
    const newItem = {
      id: Date.now(),
      name: itemName,
      description: isVeg ? "Fresh vegetarian culinary dish." : "Premium non-vegetarian selection.",
      price: parseFloat(price) || 0,
      veg: isVeg,
      image: isVeg
        ? "https://lh3.googleusercontent.com/aida-public/AB6AXuBeQJVKyPdL8rwL3RQyw1hmoJqOUqMRMAt-yR6HDkXuxG5LjVOn8DJiW2H6Cb4M5ahKO4jJLla39QIG4X_Qcu8wvyDBalFgVGnkefCDwQOJx7Tv-lFfb49h8K4IHntpt4QWPUYBJxlcqsOZSR9oGGXeXUB5Lr5e-H-79vHKg9Wo0pmQbZladQRgInTtM33IW5Xgr35sCxEXGOEJtzyaZo6In6_b3uZ9KGPAnw-Pb5GyBU1MZMpjiU9q"
        : "https://lh3.googleusercontent.com/aida-public/AB6AXuDyYO09px36gSA6uFH5L_gJKYRjZCDlbPGDQKsgD1uJYA_RAIxFD9dOKBFm-zHnBdyLKtjYgu4DzaaefUPqRy1J2xpCbIzDWMkGnoNQpHQakSpqaOX6ohEqYdFvnK1-1ql55yQopOYZ__44snbYPdE1tFbUSmmd4jYJUitT7M--cNzgAL_YiSHDCPJhJXYxF2gIbD1LXxsMgBOIeSd0-Ht8BKdBGBsB7n7IGTAY4Z8m8gIy2Ua8P-3z",
    };
    setAddedItems((prev) => [newItem, ...prev]);
    setItemName("");
    setPrice("");
  };

  const deleteItem = (id) => {
    setAddedItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen flex flex-col items-center pb-12 w-full">
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl shadow-sm left-0 md:left-72">
        <div className="flex justify-between items-center px-margin-mobile py-md w-full max-w-7xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary-container/10 transition-colors active:scale-90 duration-200 cursor-pointer text-primary border-none bg-transparent"
          >
            <MaterialIcon name="arrow_back" />
          </button>
          <h1 className="font-headline-md text-headline-md text-primary tracking-tight">Quick Menu Entry</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-lg mt-24 px-margin-mobile">
        <section className="sticky top-[88px] z-40 mb-lg">
          <form
            onSubmit={handleAddItem}
            className="glass-card border border-outline/10 shadow-[0px_10px_30px_rgba(0,0,0,0.04)] rounded-xl p-md bg-white"
          >
            <div className="flex flex-col gap-sm">
              <div className="flex gap-sm">
                <div className="flex-1">
                  <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Item Name</label>
                  <input
                    className="w-full bg-surface-container-low border-none rounded-lg p-sm focus:ring-2 focus:ring-primary transition-all text-body-md outline-none"
                    placeholder="e.g. Truffle Gnocchi"
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                  />
                </div>
                <div className="w-24">
                  <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Price</label>
                  <input
                    className="w-full bg-surface-container-low border-none rounded-lg p-sm focus:ring-2 focus:ring-primary transition-all text-body-md outline-none"
                    placeholder="$ 0.00"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-xs">
                  <button
                    type="button"
                    onClick={() => setIsVeg(true)}
                    className={`flex items-center gap-1 px-sm py-xs rounded-full font-label-sm text-label-sm active:scale-95 transition-transform cursor-pointer border-none ${
                      isVeg
                        ? "bg-primary-container/10 text-primary"
                        : "bg-surface-variant text-on-surface-variant"
                    }`}
                  >
                    <MaterialIcon name="eco" className="text-[18px]" />
                    Veg
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsVeg(false)}
                    className={`flex items-center gap-1 px-sm py-xs rounded-full font-label-sm text-label-sm active:scale-95 transition-transform cursor-pointer border-none ${
                      !isVeg
                        ? "bg-primary-container/10 text-primary"
                        : "bg-surface-variant text-on-surface-variant"
                    }`}
                  >
                    <MaterialIcon name="restaurant" className="text-[18px]" />
                    Non-Veg
                  </button>
                </div>
                <button
                  type="submit"
                  className="bg-primary text-on-primary px-lg py-sm rounded-full font-label-sm text-label-sm flex items-center gap-xs shadow-md active:scale-95 transition-all cursor-pointer border-none outline-none"
                >
                  <MaterialIcon name="add" className="text-white" />
                  Add Item
                </button>
              </div>
            </div>
          </form>
        </section>

        <section className="flex flex-col gap-sm">
          <h2 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest px-1">
            Added Items ({addedItems.length})
          </h2>
          <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col divide-y divide-surface-container border border-surface-container">
            {addedItems.map((item) => (
              <div key={item.id} className="p-md flex gap-sm items-start hover:bg-surface-container-low transition-colors group">
                <div className="w-16 h-16 rounded-xl bg-surface-container overflow-hidden shrink-0">
                  <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    alt={item.name}
                    src={item.image}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-headline-md text-[18px] text-on-surface truncate">{item.name}</h3>
                      <p className="font-body-md text-label-sm text-on-surface-variant line-clamp-1">{item.description}</p>
                    </div>
                    <span className="font-headline-md text-[16px] text-primary shrink-0">${item.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-sm">
                    <span className={`flex items-center gap-1 font-label-sm text-label-sm ${item.veg ? "text-tertiary" : "text-on-surface-variant"}`}>
                      <MaterialIcon name={item.veg ? "eco" : "restaurant"} className="text-[16px]" />
                      {item.veg ? "Vegetarian" : "Non-Vegetarian"}
                    </span>
                    <div className="flex gap-base">
                      <button className="w-8 h-8 flex items-center justify-center rounded-full text-secondary hover:bg-secondary-container active:scale-90 transition-all cursor-pointer bg-transparent border-none">
                        <MaterialIcon name="edit" className="text-[20px]" />
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-error hover:bg-error-container active:scale-90 transition-all cursor-pointer bg-transparent border-none"
                      >
                        <MaterialIcon name="delete" className="text-[20px]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="w-full max-w-lg mx-auto bg-white rounded-3xl border border-outline/5 shadow-[0px_10px_30px_rgba(0,0,0,0.04)] p-margin-mobile">
          <div className="flex gap-sm w-full">
            <button className="flex-grow py-md bg-secondary-container text-on-secondary-container rounded-xl font-label-sm text-label-sm flex items-center justify-center gap-xs active:scale-95 transition-all shadow-sm cursor-pointer border-none">
              <MaterialIcon name="add_circle" />
              New Category
            </button>
            <button className="flex-[2] py-md bg-primary text-on-primary rounded-xl font-label-sm text-label-sm flex items-center justify-center gap-xs active:scale-95 transition-all shadow-lg shadow-primary/20 cursor-pointer border-none">
              <MaterialIcon name="save" className="text-white" />
              Save Menu
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
