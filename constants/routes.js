export const publicRoutes = {
  home: "/",
  search: "/search",
  restaurant: (city = "kanpur", slug = "food-villa") => `/${city}/${slug}`,
  menu: (city = "kanpur", slug = "food-villa") => `/${city}/${slug}/menu`,
};

export const adminRoutes = [
  { href: "/admin/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/admin/orders", icon: "notifications_active", label: "Live Orders" },
  { href: "/admin/menu", icon: "restaurant_menu", label: "Manage Menu" },
  { href: "/admin/menu/ocr", icon: "document_scanner", label: "AI Menu OCR" },
  { href: "/admin/gallery", icon: "photo_library", label: "Gallery" },
  { href: "/admin/offers", icon: "local_offer", label: "Offers" },
  { href: "/admin/menu-ui", icon: "palette", label: "Menu UI" },
  { href: "/admin/settings", icon: "tune", label: "Settings" },
  { href: "/admin/qr", icon: "qr_code_2", label: "QR Code" },
  { href: "/admin/roles", icon: "manage_accounts", label: "Roles", ownerOnly: true },
];
