"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import MaterialIcon from "@/components/stitch/MaterialIcon";

const PERMISSIONS_LIST = [
  { id: "Dashboard", label: "Dashboard", defaultChecked: true },
  { id: "Live Orders", label: "Live Orders", defaultChecked: false },
  { id: "Manage Menu", label: "Manage Menu", defaultChecked: false },
  { id: "AI Menu OCR", label: "AI Menu OCR", defaultChecked: false },
  { id: "Gallery", label: "Gallery", defaultChecked: false },
  { id: "Offers", label: "Offers", defaultChecked: false },
  { id: "Menu UI", label: "Menu UI", defaultChecked: false },
  { id: "Settings", label: "Settings", defaultChecked: false },
  { id: "QR Code", label: "QR Code", defaultChecked: false },
];

export default function RolesPage() {
  const { user } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [category, setCategory] = useState("Waiter");
  const [permissions, setPermissions] = useState(["Dashboard"]); // default dashboard

  useEffect(() => {
    fetchStaff();
  }, [user?.restaurantId]);

  const fetchStaff = async () => {
    if (!user?.restaurantId) return;
    try {
      setLoading(true);
      const { data } = await api.get(`/api/restaurants/id/${user.restaurantId}/staff`);
      setStaffList(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setStep(1);
    setName("");
    setUsername("");
    setPassword("");
    setCategory("Waiter");
    setPermissions(["Dashboard"]);
    setError("");
    setIsModalOpen(true);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!name || !username || !password) {
        return setError("Please fill in all fields.");
      }
      if (password.length < 6) {
        return setError("Password must be at least 6 characters.");
      }
    }
    setError("");
    setStep(step + 1);
  };

  const handleTogglePermission = (id) => {
    if (permissions.includes(id)) {
      setPermissions(permissions.filter(p => p !== id));
    } else {
      setPermissions([...permissions, id]);
    }
  };

  const handleSubmit = async () => {
    if (permissions.length === 0) {
      return setError("Please select at least one permission.");
    }
    setSubmitting(true);
    setError("");
    try {
      await api.post(`/api/restaurants/id/${user.restaurantId}/staff`, {
        name,
        username,
        password,
        role: category,
        permissions,
        status: "Active"
      });
      setIsModalOpen(false);
      fetchStaff();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create subadmin.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (staffId) => {
    if (!confirm("Are you sure you want to completely remove this employee?")) return;
    try {
      await api.delete(`/api/restaurants/staff/${staffId}`);
      fetchStaff();
    } catch (err) {
      alert("Failed to delete employee");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="font-label-sm text-label-sm uppercase text-secondary">Employee Management</p>
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary md:font-display-lg md:text-display-lg">Roles & Subadmins</h1>
        </div>
        <button 
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-6 h-12 rounded-full bg-primary text-white font-bold transition-all hover:bg-primary/90 shadow-md whitespace-nowrap"
        >
          <MaterialIcon name="person_add" />
          Create Subadmin
        </button>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl overflow-hidden shadow-sm">
        {staffList.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant flex flex-col items-center">
            <MaterialIcon name="groups" className="text-6xl mb-4 opacity-20" />
            <h3 className="text-xl font-bold text-on-surface mb-2">No Employees Yet</h3>
            <p className="max-w-md">Create your first subadmin to give them restricted access to the dashboard.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container/50 border-b border-outline-variant">
                  <th className="px-6 py-4 font-bold text-sm text-on-surface-variant">Employee Name</th>
                  <th className="px-6 py-4 font-bold text-sm text-on-surface-variant">Username</th>
                  <th className="px-6 py-4 font-bold text-sm text-on-surface-variant">Category</th>
                  <th className="px-6 py-4 font-bold text-sm text-on-surface-variant">Permissions</th>
                  <th className="px-6 py-4 font-bold text-sm text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {staffList.map((staff) => (
                  <tr key={staff._id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-on-surface">{staff.name}</div>
                      <div className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${staff.status === 'Active' ? 'bg-success' : 'bg-error'}`}></span>
                        {staff.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant font-medium">@{staff.username || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-primary-container text-on-primary-container rounded-full text-xs font-bold">
                        {staff.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {staff.permissions && staff.permissions.map(p => (
                          <span key={p} className="px-2 py-0.5 bg-surface-variant text-on-surface-variant rounded-md text-[10px] font-bold border border-outline-variant/30">{p}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(staff._id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-error hover:bg-error-container transition-colors ml-auto"
                        title="Remove Employee"
                      >
                        <MaterialIcon name="delete" className="text-[18px]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Subadmin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !submitting && setIsModalOpen(false)}></div>
          <div className="relative bg-surface-container-lowest w-full max-w-lg rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-reveal">
            
            <div className="px-6 py-4 border-b border-surface-container flex items-center justify-between bg-white z-10 shrink-0">
              <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <MaterialIcon name="person_add" className="text-primary" />
                Create Subadmin
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-variant/50 transition-colors text-on-surface-variant disabled:opacity-50"
              >
                <MaterialIcon name="close" className="text-2xl" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              
              {/* Stepper Indicator */}
              <div className="flex items-center justify-center mb-8">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= s ? 'bg-primary text-white' : 'bg-surface-variant text-on-surface-variant'}`}>
                      {s}
                    </div>
                    {s < 3 && (
                      <div className={`w-12 h-1 mx-2 rounded-full transition-colors ${step > s ? 'bg-primary' : 'bg-surface-variant'}`}></div>
                    )}
                  </div>
                ))}
              </div>

              {error && (
                <div className="p-3 mb-6 text-sm bg-error-container/20 border border-error-container text-error rounded-xl font-bold">
                  {error}
                </div>
              )}

              {/* Step 1: Basic Details */}
              {step === 1 && (
                <div className="space-y-4 animate-fadeInUp">
                  <h3 className="font-bold text-lg text-on-surface mb-2">Step 1: Account Details</h3>
                  
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase">Full Name</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="e.g. John Doe"
                      className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-white focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase">Username</label>
                    <input 
                      type="text" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))} 
                      placeholder="e.g. johndoe"
                      className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-white focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase">Password</label>
                    <input 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="••••••••"
                      className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-white focus:border-primary outline-none"
                    />
                    <p className="text-xs text-on-surface-variant mt-1">Must be at least 6 characters.</p>
                  </div>
                </div>
              )}

              {/* Step 2: Category */}
              {step === 2 && (
                <div className="space-y-4 animate-fadeInUp">
                  <h3 className="font-bold text-lg text-on-surface mb-4">Step 2: Role Category</h3>
                  
                  <div className="space-y-3">
                    {["Manager", "Chef", "Waiter"].map((cat) => (
                      <label 
                        key={cat} 
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${category === cat ? 'border-primary bg-primary/5' : 'border-outline-variant bg-white hover:border-primary/50'}`}
                      >
                        <input 
                          type="radio" 
                          name="category" 
                          value={cat} 
                          checked={category === cat} 
                          onChange={() => setCategory(cat)}
                          className="w-5 h-5 accent-primary"
                        />
                        <span className="font-bold text-on-surface">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Permissions */}
              {step === 3 && (
                <div className="space-y-4 animate-fadeInUp">
                  <h3 className="font-bold text-lg text-on-surface mb-2">Step 3: Page Permissions</h3>
                  <p className="text-sm text-on-surface-variant mb-4">Select which sections of the dashboard this employee can access.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto p-1 custom-scrollbar">
                    {PERMISSIONS_LIST.map((perm) => (
                      <label 
                        key={perm.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${permissions.includes(perm.id) ? 'border-primary bg-primary/5 shadow-sm' : 'border-outline-variant bg-white hover:bg-surface-container-lowest'}`}
                      >
                        <input 
                          type="checkbox" 
                          checked={permissions.includes(perm.id)}
                          onChange={() => handleTogglePermission(perm.id)}
                          disabled={perm.id === "Dashboard"} // Dashboard is always required for them to have a landing page
                          className="w-5 h-5 rounded accent-primary disabled:opacity-50"
                        />
                        <span className="font-bold text-sm text-on-surface">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-surface-container/50 border-t border-outline-variant flex justify-between items-center z-10 shrink-0">
              {step > 1 ? (
                <button 
                  onClick={() => setStep(step - 1)}
                  disabled={submitting}
                  className="px-6 h-10 rounded-full border border-outline-variant text-on-surface font-bold hover:bg-white transition-colors"
                >
                  Back
                </button>
              ) : <div></div>}
              
              {step < 3 ? (
                <button 
                  onClick={handleNextStep}
                  className="px-6 h-10 rounded-full bg-primary text-white font-bold hover:bg-primary/90 transition-colors shadow-md"
                >
                  Next
                </button>
              ) : (
                <button 
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-8 h-10 rounded-full bg-primary text-white font-bold hover:bg-primary/90 transition-colors shadow-md flex items-center gap-2"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <MaterialIcon name="check" className="text-[18px]" />
                  )}
                  {submitting ? "Creating..." : "Create Employee"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
