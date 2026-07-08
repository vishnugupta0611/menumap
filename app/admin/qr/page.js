"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { AdminPanel } from "@/components/admin/AdminPanel";
import MaterialIcon from "@/components/stitch/MaterialIcon";

export default function QrCodePage() {
  const { user } = useAuth();
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.restaurantId) return;

    api.get(`/api/qr/restaurants/${user.restaurantId}`)
      .then(res => {
        setQrData(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch QR code", err);
        setError("Failed to generate QR Code. Please check API connection.");
        setLoading(false);
      });
  }, [user?.restaurantId]);

  const handleDownload = () => {
    if (!qrData?.dataUrl) return;
    const a = document.createElement("a");
    a.href = qrData.dataUrl;
    a.download = `menumap-qr-${user.restaurantId}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-8 pb-16">
      <div>
        <p className="font-label-sm text-label-sm uppercase text-secondary">Restaurant OS</p>
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary md:font-display-lg md:text-display-lg">QR Code Generator</h1>
      </div>

      {error && (
        <div className="rounded-2xl border border-error-container bg-error-container/20 p-4 text-sm text-on-error-container">
          {error}
        </div>
      )}

      <AdminPanel title="Your Smart Menu QR" eyebrow="Print & Place" icon="qr_code_scanner">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-primary font-bold animate-pulse">Generating QR...</div>
          </div>
        ) : qrData ? (
          <div className="flex flex-col items-center p-8 bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm max-w-md mx-auto">
            <div className="p-4 bg-white rounded-xl shadow-inner border border-surface-container mb-6">
              <img src={qrData.dataUrl} alt="Restaurant QR Code" className="w-64 h-64 object-contain" />
            </div>
            
            <p className="text-center font-bold mb-2">Scan to view menu</p>
            <p className="text-center text-xs text-on-surface-variant mb-6 bg-surface-container px-3 py-1.5 rounded-full break-all">
              {qrData.url}
            </p>

            <button
              onClick={handleDownload}
              className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold cursor-pointer hover:opacity-90 transition-all border-none outline-none flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              <MaterialIcon name="download" />
              Download High-Res PNG
            </button>
          </div>
        ) : (
          <div className="text-center py-12 text-on-surface-variant font-bold">
            QR Code data is unavailable.
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
