"use client";

import { useEffect, useState } from "react";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import MaterialIcon from "@/components/stitch/MaterialIcon";

export default function HistoryPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Date Filters
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30); // Default last 30 days
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!user?.restaurantId) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        // Fetch all Completed and Cancelled orders
        // In a real production app, we would pass date filters to the backend, 
        // but since the current backend pagination doesn't support date ranges, we will fetch and filter in frontend for now.
        const resCompleted = await api.get(`/api/orders?restaurantId=${user.restaurantId}&status=Completed&limit=1000`);
        const resCancelled = await api.get(`/api/orders?restaurantId=${user.restaurantId}&status=Cancelled&limit=1000`);
        
        const allOrders = [...(resCompleted.data.data || []), ...(resCancelled.data.data || [])];
        
        // Filter by date range
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        const filtered = allOrders.filter(order => {
          const date = new Date(order.createdAt);
          return date >= start && date <= end;
        });
        
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(filtered);
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user?.restaurantId, startDate, endDate]);

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-surface-variant text-on-surface-variant border-outline-variant';
    }
  };

  const totalRevenue = orders.filter(o => o.status === 'Completed').reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalCompleted = orders.filter(o => o.status === 'Completed').length;
  const totalCancelled = orders.filter(o => o.status === 'Cancelled').length;

  return (
    <AdminPanel title="Order History" eyebrow="Revenue & Reports" icon="history">
      
      {/* Filters and Stats Summary */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="col-span-1 md:col-span-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm flex flex-col sm:flex-row gap-4 items-end justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div>
              <label className="text-xs font-bold text-on-surface-variant mb-1 block">Start Date</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-outline-variant rounded-lg bg-white text-sm outline-none focus:border-primary w-full sm:w-auto" 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-on-surface-variant mb-1 block">End Date</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-outline-variant rounded-lg bg-white text-sm outline-none focus:border-primary w-full sm:w-auto" 
              />
            </div>
          </div>
          <div className="text-sm font-medium text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/50 w-full sm:w-auto text-center sm:text-left">
            Showing {orders.length} Orders
          </div>
        </div>

        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex flex-col justify-center shadow-sm">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">Total Revenue</span>
          <span className="text-2xl font-black text-primary">Rs {totalRevenue}</span>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col justify-center shadow-sm">
          <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Completed Orders</span>
          <span className="text-2xl font-black text-green-800">{totalCompleted}</span>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col justify-center shadow-sm">
          <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Cancelled Orders</span>
          <span className="text-2xl font-black text-red-800">{totalCancelled}</span>
        </div>
        <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 flex flex-col justify-center shadow-sm">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Avg Order Value</span>
          <span className="text-2xl font-black text-on-surface">Rs {totalCompleted > 0 ? (totalRevenue / totalCompleted).toFixed(0) : 0}</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col items-center">
          <MaterialIcon name="receipt_long" className="text-5xl text-outline mb-3" />
          <h3 className="text-lg font-bold text-on-surface">No history found</h3>
          <p className="text-sm text-on-surface-variant max-w-sm mt-1">Try adjusting the date filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-outline-variant">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-sm text-on-surface-variant">
                <th className="py-3 px-4 font-bold uppercase tracking-wider">Order ID</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider">Date & Time</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider">Customer / Table</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider">Items</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-right">Total</th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="py-3 px-4 font-bold text-sm text-primary">#{order._id.slice(-6).toUpperCase()}</td>
                  <td className="py-3 px-4">
                    <div className="text-sm font-semibold">{new Date(order.createdAt).toLocaleDateString()}</div>
                    <div className="text-xs text-on-surface-variant">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm font-semibold">{order.customerName || 'Walk-in'}</div>
                    {order.tableNumber && <div className="text-xs text-on-surface-variant">Table {order.tableNumber}</div>}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-xs max-w-[250px] truncate text-on-surface-variant" title={order.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}>
                      {order.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-sm text-right">Rs {order.totalAmount}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${getStatusBadgeColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminPanel>
  );
}
