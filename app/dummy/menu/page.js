"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import DummyHeader from "@/components/dummy/DummyHeader";
import DummyMenuList from "@/components/dummy/DummyMenuList";

function DummyMenuContent() {
  const searchParams = useSearchParams();
  const number = searchParams.get("number");
  
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!number) {
      setError("Please provide a mobile number in the URL (?number=xxx)");
      setLoading(false);
      return;
    }

    api.get(`/api/dummy?number=${encodeURIComponent(number)}`)
      .then(res => {
        setData(res.data.data);
      })
      .catch(err => {
        console.error(err);
        setError("Restaurant not found or error loading dummy data.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [number]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-primary">Loading Menu Preview...</div>;
  }

  if (error || !data) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-error">{error || "Failed to load"}</div>;
  }

  const { restaurant, menu } = data;
  const settings = restaurant.menuUiSettings || { colorPalette: "clay", font: "jakarta", showTabs: true };

  return (
    <div className={`min-h-screen bg-background pb-8 text-on-surface theme-${settings.colorPalette} font-theme-${settings.font}`}>
      <DummyHeader restaurant={restaurant} />
      <div className="pt-[65px]">
        <DummyMenuList restaurant={restaurant} menu={menu} offers={[]} />
      </div>
    </div>
  );
}

export default function DummyMenuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold">Loading...</div>}>
      <DummyMenuContent />
    </Suspense>
  );
}
