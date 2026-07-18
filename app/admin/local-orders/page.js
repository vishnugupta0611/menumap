"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useLocalOrdersStore, toItemId } from "@/stores/local-orders-store";
import MaterialIcon from "@/components/stitch/MaterialIcon";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function LocalOrdersPage() {
  const { user } = useAuth();
  const { pendingQueue, addLocalOrder, removeLocalOrder, updateLocalOrder, syncToServer, isSyncing } =
    useLocalOrdersStore();

  const [menuItems, setMenuItems] = useState([]);
  const [itemDocs, setItemDocs] = useState([]); // array of LocalOrder docs from server
  const [loading, setLoading] = useState(true);

  const [isHistoryView, setIsHistoryView] = useState(false);
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [filter, setFilter] = useState("All"); // All | served | pending

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    qty: 1,
    status: "served",
    menuItemId: null,
  });

  // History state
  const [historyStart, setHistoryStart] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split("T")[0];
  });
  const [historyEnd, setHistoryEnd] = useState(today);
  const [historyDocs, setHistoryDocs] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Load menu items
  useEffect(() => {
    if (user?.restaurantId) {
      api
        .get(`/api/restaurants/id/${user.restaurantId}/menu-items`)
        .then((res) => setMenuItems(res.data.data || []))
        .catch(console.error);
    }
  }, [user]);

  // Load today's orders
  const loadOrders = useCallback(async () => {
    if (!user?.restaurantId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/local-orders?date=${today}`);
      setItemDocs(res.data.data || []);
    } catch (err) {
      console.error(err);
      setItemDocs([]);
    } finally {
      setLoading(false);
    }
  }, [user, today]);

  useEffect(() => {
    if (!isHistoryView) loadOrders();
  }, [isHistoryView, loadOrders]);

  // Load history
  const loadHistory = useCallback(async () => {
    if (!user?.restaurantId) return;
    setHistoryLoading(true);
    try {
      const res = await api.get(
        `/api/local-orders/history?startDate=${historyStart}&endDate=${historyEnd}`
      );
      setHistoryDocs(res.data.data || []);
    } catch (err) {
      console.error(err);
      setHistoryDocs([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [user, historyStart, historyEnd]);

  useEffect(() => {
    if (isHistoryView) loadHistory();
  }, [isHistoryView, loadHistory]);

  // Form handlers
  const handleNameChange = (e) => {
    const val = e.target.value;
    const found = menuItems.find((i) => i.name.toLowerCase() === val.toLowerCase());
    setFormData((prev) => ({
      ...prev,
      name: val,
      menuItemId: found ? found._id : null,
      price: found ? found.price : prev.price,
    }));
  };

  const handleAddOrder = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || formData.qty < 1) return;

    const itemId = formData.menuItemId?.toString() || toItemId(formData.name);

    await addLocalOrder({
      date: today,
      itemId,
      itemName: formData.name,
      qty: Number(formData.qty),
      price: Number(formData.price),
      status: formData.status,
    });

    setFormData({ name: "", price: "", qty: 1, status: "served", menuItemId: null });
    setIsAddOrderOpen(false);

    if (useLocalOrdersStore.getState().pendingQueue.length === 0) {
      loadOrders();
    }
  };

  const handleManualSync = async () => {
    const ok = await syncToServer();
    if (ok) loadOrders();
  };

  // Update an individual order entry on the server
  const handleUpdateOrder = async (docId, orderId, updates) => {
    try {
      await api.patch(`/api/local-orders/${docId}/orders/${orderId}`, updates);
      setItemDocs((prev) =>
        prev.map((doc) => {
          if (doc._id !== docId) return doc;
          return {
            ...doc,
            orders: doc.orders.map((o) =>
              o._id === orderId ? { ...o, ...updates } : o
            ),
          };
        })
      );
    } catch (err) {
      console.error("Failed to update order", err);
    }
  };

  // Delete a specific order entry
  const handleDeleteOrder = async (docId, orderId) => {
    if (!confirm("Delete this order entry?")) return;
    try {
      await api.delete(`/api/local-orders/${docId}/orders/${orderId}`);
      setItemDocs((prev) => {
        return prev
          .map((doc) => {
            if (doc._id !== docId) return doc;
            return { ...doc, orders: doc.orders.filter((o) => o._id !== orderId) };
          })
          .filter((doc) => doc.orders.length > 0); // remove empty docs
      });
    } catch (err) {
      console.error("Failed to delete order", err);
    }
  };

  // Build a FLAT chronological list — newest first
  // Each entry: { key, docId, itemId, itemName, orderId, qty, price, status, source, localId?, sortTs }
  const flatOrders = useMemo(() => {
    const rows = [];

    // Server orders — flatten all docs
    itemDocs.forEach((doc) => {
      doc.orders.forEach((o) => {
        rows.push({
          key: o._id,
          docId: doc._id,
          itemId: doc.itemId,
          itemName: doc.itemName,
          orderId: o._id,
          qty: o.qty,
          price: o.price,
          status: o.status,
          source: "server",
          // createdAt may be undefined on older docs — fallback to doc createdAt
          sortTs: o.createdAt ? new Date(o.createdAt).getTime() : new Date(doc.createdAt).getTime(),
        });
      });
    });

    // Local queue (only today's unsynced)
    pendingQueue
      .filter((q) => q.date === today)
      .forEach((q) => {
        // localId starts with Date.now() string
        const ts = parseInt(q.localId, 10) || Date.now();
        rows.push({
          key: q.localId,
          docId: null,
          itemId: q.itemId,
          itemName: q.itemName,
          orderId: null,
          qty: q.qty,
          price: q.price,
          status: q.status,
          source: "local",
          localId: q.localId,
          sortTs: ts,
        });
      });

    // Sort newest first
    rows.sort((a, b) => b.sortTs - a.sortTs);
    return rows;
  }, [itemDocs, pendingQueue, today]);

  const filteredOrders = useMemo(() => {
    if (filter === "All") return flatOrders;
    return flatOrders.filter((o) => o.status === filter);
  }, [flatOrders, filter]);

  const totalServed = useMemo(
    () => flatOrders.filter((o) => o.status === "served").reduce((s, o) => s + o.qty * o.price, 0),
    [flatOrders]
  );

  const totalPending = useMemo(
    () => flatOrders.filter((o) => o.status === "pending").reduce((s, o) => s + o.qty * o.price, 0),
    [flatOrders]
  );


  // History computations
  const historyAggregated = useMemo(() => {
    const dailyMap = {}; // date -> { served, pending }
    const itemMap = {}; // itemName -> { qty, revenue }

    historyDocs.forEach((doc) => {
      if (!dailyMap[doc.date]) dailyMap[doc.date] = { served: 0, pending: 0 };
      doc.orders.forEach((o) => {
        const val = o.qty * o.price;
        if (o.status === "served") {
          dailyMap[doc.date].served += val;
          if (!itemMap[doc.itemName]) itemMap[doc.itemName] = { qty: 0, revenue: 0 };
          itemMap[doc.itemName].qty += o.qty;
          itemMap[doc.itemName].revenue += val;
        } else {
          dailyMap[doc.date].pending += val;
        }
      });
    });

    const dailyData = Object.entries(dailyMap)
      .map(([date, vals]) => ({ date, ...vals }))
      .sort((a, b) => (a.date < b.date ? 1 : -1));

    const itemData = Object.entries(itemMap)
      .map(([name, vals]) => ({ name, ...vals }))
      .sort((a, b) => b.revenue - a.revenue);

    const grandServed = dailyData.reduce((s, d) => s + d.served, 0);
    const grandPending = dailyData.reduce((s, d) => s + d.pending, 0);

    return { dailyData, itemData, grandServed, grandPending };
  }, [historyDocs]);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Sales Report", 14, 20);
    doc.setFontSize(10);
    doc.text(`Range: ${historyStart} → ${historyEnd}`, 14, 28);
    doc.text(`Total Served: Rs ${historyAggregated.grandServed}`, 14, 34);
    doc.text(`Total Pending: Rs ${historyAggregated.grandPending}`, 14, 40);

    doc.setFontSize(13);
    doc.text("Daily Summary", 14, 52);
    autoTable(doc, {
      startY: 56,
      head: [["Date", "Served (Rs)", "Pending (Rs)"]],
      body: historyAggregated.dailyData.map((d) => [
        new Date(d.date).toLocaleDateString(),
        d.served,
        d.pending,
      ]),
      theme: "grid",
      headStyles: { fillColor: [79, 70, 229] },
    });

    const y2 = doc.lastAutoTable.finalY + 14;
    doc.setFontSize(13);
    doc.text("Item-wise Breakdown", 14, y2);
    autoTable(doc, {
      startY: y2 + 4,
      head: [["Item", "Total Qty", "Revenue (Rs)"]],
      body: historyAggregated.itemData.map((i) => [i.name, i.qty, i.revenue]),
      theme: "grid",
      headStyles: { fillColor: [79, 70, 229] },
    });

    doc.save(`Sales_${historyStart}_${historyEnd}.pdf`);
  };

  const totalOrderCount = flatOrders.length;

  return (
    <div className="w-full max-w-7xl mx-auto pb-24 pt-2 px-2 md:px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-outline-variant/30">
        <span className="font-bold text-sm text-on-surface">
          {isHistoryView ? "History Report" : "Today's Orders"}
        </span>

        <div className="flex items-center gap-2">
          {!isHistoryView && pendingQueue.length > 0 && (
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="flex items-center gap-1 bg-primary text-white px-3 py-1.5 rounded-lg font-bold text-[11px] uppercase tracking-wider hover:bg-primary/90 transition-none disabled:opacity-50 shadow-sm"
            >
              <MaterialIcon name="cloud_upload" className="text-[14px]" />
              {isSyncing ? "Syncing..." : `Sync (${pendingQueue.length})`}
            </button>
          )}
          <button
            onClick={() => setIsHistoryView((v) => !v)}
            className="flex items-center gap-1 bg-surface-container-lowest border border-outline-variant/50 text-on-surface-variant px-3 py-1.5 rounded-lg font-bold text-[11px] uppercase tracking-wider hover:bg-surface-variant transition-none shadow-sm"
          >
            <MaterialIcon
              name={isHistoryView ? "arrow_back" : "history"}
              className="text-[14px]"
            />
            {isHistoryView ? "Back" : "History"}
          </button>
        </div>
      </div>

      {/* TODAY'S VIEW */}
      {!isHistoryView && (
        <div>
          {/* Stats filter cards */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "All Orders", val: totalOrderCount, key: "All", activeClass: "bg-primary border-primary text-white", hoverClass: "hover:bg-surface-variant" },
              { label: "Paid Sales", val: `Rs ${totalServed}`, key: "served", activeClass: "bg-green-600 border-green-600 text-white", hoverClass: "hover:bg-green-50" },
              { label: "Pending", val: `Rs ${totalPending}`, key: "pending", activeClass: "bg-orange-500 border-orange-500 text-white", hoverClass: "hover:bg-orange-50" },
            ].map(({ label, val, key, activeClass, hoverClass }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-none ${
                  filter === key
                    ? activeClass + " shadow-sm"
                    : `bg-surface-container-lowest text-on-surface-variant border-outline-variant/30 ${hoverClass}`
                }`}
              >
                <span className="text-[9px] font-bold uppercase tracking-wider opacity-90 mb-0.5">
                  {label}
                </span>
                <span className="text-base font-black leading-none">{val}</span>
              </button>
            ))}
          </div>

          {/* Flat chronological orders list */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-2 min-h-[400px]">
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-10">
                <MaterialIcon name="receipt_long" className="text-3xl text-outline mb-2 opacity-40" />
                <h4 className="font-bold text-xs text-on-surface">No orders today</h4>
                <p className="text-[10px] text-on-surface-variant mt-1">Tap + to add</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {filteredOrders.map((order) => (
                  <div
                    key={order.key}
                    className="flex items-center justify-between px-3 py-2.5 bg-white border border-outline-variant/20 rounded-xl hover:shadow-sm transition-none"
                  >
                    {/* Left: item info */}
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-bold text-[13px] text-on-surface truncate leading-tight">
                          {order.itemName}
                        </span>
                        {order.source === "local" && (
                          <span className="text-[7px] font-black bg-surface-variant text-on-surface-variant px-1 rounded uppercase shrink-0">
                            Unsynced
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant">
                        <span>{order.qty} × Rs {order.price}</span>
                        <span className="text-primary font-black">Rs {order.qty * order.price}</span>
                      </div>
                    </div>

                    {/* Right: status + delete */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {order.source === "server" ? (
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleUpdateOrder(order.docId, order.orderId, { status: e.target.value })
                          }
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border outline-none cursor-pointer ${
                            order.status === "served"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-orange-50 text-orange-700 border-orange-200"
                          }`}
                        >
                          <option value="served">Paid</option>
                          <option value="pending">Pending</option>
                        </select>
                      ) : (
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateLocalOrder(order.localId, { status: e.target.value })
                          }
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border outline-none cursor-pointer ${
                            order.status === "served"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-orange-50 text-orange-700 border-orange-200"
                          }`}
                        >
                          <option value="served">Paid</option>
                          <option value="pending">Pending</option>
                        </select>
                      )}

                      {order.source === "server" ? (
                        <button
                          onClick={() => handleDeleteOrder(order.docId, order.orderId)}
                          className="w-6 h-6 flex items-center justify-center rounded-md bg-red-50 text-red-500 hover:bg-red-100 transition-none"
                        >
                          <MaterialIcon name="delete" className="text-[13px]" />
                        </button>
                      ) : (
                        <button
                          onClick={() => removeLocalOrder(order.localId)}
                          className="w-6 h-6 flex items-center justify-center rounded-md bg-red-50 text-red-500 hover:bg-red-100 transition-none"
                        >
                          <MaterialIcon name="delete" className="text-[13px]" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Floating Action Button */}
          <button
            onClick={() => setIsAddOrderOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-[0_4px_20px_rgba(var(--color-primary-rgb),0.5)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-40 cursor-pointer"
          >
            <MaterialIcon name="add" className="text-[28px]" />
          </button>

          {/* Bottom Sheet */}
          {isAddOrderOpen && (
            <div
              className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center"
              onClick={(e) => e.target === e.currentTarget && setIsAddOrderOpen(false)}
            >
              <div className="w-full sm:max-w-md bg-surface rounded-t-3xl sm:rounded-3xl shadow-2xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                    <MaterialIcon name="add_circle" className="text-primary text-[18px]" />
                    Quick Entry
                  </h3>
                  <button
                    onClick={() => setIsAddOrderOpen(false)}
                    className="w-7 h-7 flex items-center justify-center bg-surface-variant text-on-surface-variant rounded-full cursor-pointer"
                  >
                    <MaterialIcon name="close" className="text-[16px]" />
                  </button>
                </div>

                <form onSubmit={handleAddOrder} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                      Item Name
                    </label>
                    <input
                      type="text"
                      list="menu-items-list"
                      value={formData.name}
                      onChange={handleNameChange}
                      placeholder="e.g. Samosa"
                      required
                      className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-3 py-2 outline-none focus:border-primary text-xs font-bold"
                    />
                    <datalist id="menu-items-list">
                      {menuItems.map((item) => (
                        <option key={item._id} value={item.name} />
                      ))}
                    </datalist>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                        Price (Rs)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0"
                        required
                        className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-3 py-2 outline-none focus:border-primary text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                        Qty
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.qty}
                        onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
                        required
                        className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-xl px-3 py-2 outline-none focus:border-primary text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
                      Status
                    </label>
                    <div className="flex bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-1">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, status: "served" })}
                        className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-none ${
                          formData.status === "served"
                            ? "bg-primary text-white shadow-sm"
                            : "text-on-surface-variant hover:bg-surface-variant"
                        }`}
                      >
                        Paid
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, status: "pending" })}
                        className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-none ${
                          formData.status === "pending"
                            ? "bg-orange-500 text-white shadow-sm"
                            : "text-on-surface-variant hover:bg-surface-variant"
                        }`}
                      >
                        Pending
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 bg-primary text-white py-3 rounded-xl font-bold shadow-sm active:scale-95 transition-transform flex items-center justify-center gap-1.5 text-xs cursor-pointer"
                  >
                    <MaterialIcon name="save" className="text-[16px]" />
                    Save Order
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* HISTORY VIEW */}
      {isHistoryView && (
        <div className="mt-2">
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-sm mb-4 flex flex-col md:flex-row gap-3 md:items-end justify-between">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="flex flex-col flex-1">
                <label className="text-[9px] font-bold text-on-surface-variant uppercase mb-1">Start</label>
                <input
                  type="date"
                  value={historyStart}
                  onChange={(e) => setHistoryStart(e.target.value)}
                  className="bg-white border border-outline-variant/50 rounded-lg px-2 py-1.5 outline-none focus:border-primary text-xs font-bold"
                />
              </div>
              <div className="flex flex-col flex-1">
                <label className="text-[9px] font-bold text-on-surface-variant uppercase mb-1">End</label>
                <input
                  type="date"
                  value={historyEnd}
                  onChange={(e) => setHistoryEnd(e.target.value)}
                  className="bg-white border border-outline-variant/50 rounded-lg px-2 py-1.5 outline-none focus:border-primary text-xs font-bold"
                />
              </div>
            </div>
            <button
              onClick={generatePDF}
              disabled={historyDocs.length === 0}
              className="w-full md:w-auto flex items-center justify-center gap-1.5 bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-[11px] shadow-sm hover:bg-slate-700 transition-none disabled:opacity-50 cursor-pointer"
            >
              <MaterialIcon name="picture_as_pdf" className="text-[14px]" />
              Export PDF
            </button>
          </div>

          {historyLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-surface-container-lowest p-3 border-b border-outline-variant/30">
                  <h4 className="font-bold text-xs text-on-surface">Daily Summary</h4>
                </div>
                <div className="p-3 space-y-2 max-h-[350px] overflow-auto">
                  {historyAggregated.dailyData.length === 0 ? (
                    <p className="text-center text-xs text-on-surface-variant py-4">No data.</p>
                  ) : (
                    historyAggregated.dailyData.map((d, i) => (
                      <div key={i} className="flex justify-between items-center p-2.5 bg-surface-container-lowest/60 rounded-lg border border-outline-variant/20">
                        <span className="font-bold text-[11px]">{new Date(d.date).toLocaleDateString()}</span>
                        <div className="text-right">
                          <div className="text-[10px] font-bold text-green-700">Paid: Rs {d.served}</div>
                          <div className="text-[9px] font-bold text-orange-600 mt-0.5">Pending: Rs {d.pending}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-surface-container-lowest p-3 border-b border-outline-variant/30">
                  <h4 className="font-bold text-xs text-on-surface">Item-wise Sales</h4>
                </div>
                <div className="p-3 space-y-2 max-h-[350px] overflow-auto">
                  {historyAggregated.itemData.length === 0 ? (
                    <p className="text-center text-xs text-on-surface-variant py-4">No data.</p>
                  ) : (
                    historyAggregated.itemData.map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-2.5 bg-surface-container-lowest/60 rounded-lg border border-outline-variant/20">
                        <div>
                          <span className="font-bold text-[11px] block">{item.name}</span>
                          <span className="text-[8px] text-on-surface-variant font-bold uppercase">{item.qty} units</span>
                        </div>
                        <span className="font-black text-primary text-[11px]">Rs {item.revenue}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
