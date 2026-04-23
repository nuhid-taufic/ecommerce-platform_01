import React, { useState, useEffect } from "react";
import {
  UserCog,
  Shield,
  ShieldAlert,
  Briefcase,
  Mail,
  Edit2,
  X,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Staff() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [newRole, setNewRole] = useState("");

  const fetchStaff = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/staff`);
      const data = await res.json();
      if (res.ok && data.success) {
        setStaffList(data.staff);
      }
    } catch (error) {
      toast.error("Failed to fetch staff data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const openRoleModal = (staff: any) => {
    setSelectedStaff(staff);
    setNewRole(staff.role);
    setIsModalOpen(true);
  };

  const handleRoleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newRole === selectedStaff.role) {
      toast.error("User is already in this role!");
      return;
    }

    const toastId = toast.loading("Updating role...");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/staff/${selectedStaff._id}/role`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole }),
        },
      );
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Role updated successfully!", { id: toastId });
        setIsModalOpen(false);
        fetchStaff();
      } else {
        toast.error(data.message || "Failed to update role", { id: toastId });
      }
    } catch (error) {
      toast.error("Network error", { id: toastId });
    }
  };

  // Role Badge Helper
  const getRoleBadge = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return (
          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 w-max">
            <ShieldAlert className="h-3 w-3" /> Admin
          </span>
        );
      case "manager":
        return (
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 w-max">
            <Briefcase className="h-3 w-3" /> Manager
          </span>
        );
      case "support":
        return (
          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 w-max">
            <ShieldCheck className="h-3 w-3" /> Support
          </span>
        );
      default:
        return (
          <span className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 w-max">
            <UserCog className="h-3 w-3" /> {role}
          </span>
        );
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" /> Staff & Admins
          </h1>
          <p className="text-slate-500 mt-1">
            Manage team members, roles, and access permissions.
          </p>
        </div>
        {/* Optional button for future expansion */}
        <button
          onClick={() =>
            toast(
              "To add new staff, change a customer's role from the database or create an 'Invite' feature later!",
              { icon: "💡" },
            )
          }
          className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 px-5 py-2.5 rounded-xl font-bold transition-colors shadow-sm"
        >
          Learn How to Add Staff
        </button>
      </div>

      {/* Staff Grid */}
      {loading ? (
        <div className="text-center py-10 font-bold text-slate-500">
          Loading staff members...
        </div>
      ) : staffList.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
          <UserCog className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No Staff Found</h3>
          <p className="text-slate-500 text-sm mt-1">
            Currently, there are no users with staff/admin roles in the system.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffList.map((staff) => (
            <div
              key={staff._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative group overflow-hidden"
            >
              {/* Decorative background shape */}
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>

              <div className="relative z-10 flex justify-between items-start mb-4">
                <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-white shadow-md flex items-center justify-center text-slate-400 text-xl font-black uppercase">
                  {staff.name.charAt(0)}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getRoleBadge(staff.role)}
                </div>
              </div>

              <div className="relative z-10 mb-6">
                <h3 className="text-xl font-black text-slate-800 line-clamp-1">
                  {staff.name}
                </h3>
                <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mt-1">
                  <Mail className="h-3.5 w-3.5" /> {staff.email}
                </p>
              </div>

              <div className="relative z-10 border-t border-slate-100 pt-4">
                <button
                  onClick={() => openRoleModal(staff)}
                  className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-700 px-4 py-2.5 rounded-xl font-bold transition-colors"
                >
                  <Edit2 className="h-4 w-4" /> Change Role
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Change Role Modal */}
      {isModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" /> Manage Role
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-red-500 transition-colors bg-white p-2 rounded-full border border-slate-200 shadow-sm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRoleUpdate} className="p-6">
              <div className="mb-6 text-center">
                <p className="text-sm font-bold text-slate-400 uppercase">
                  Updating Access For
                </p>
                <p className="text-xl font-black text-slate-800">
                  {selectedStaff.name}
                </p>
              </div>

              <label className="text-xs font-bold text-slate-500 uppercase block mb-2">
                Select New Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 mb-6"
              >
                <option value="admin">Admin (Full Access)</option>
                <option value="manager">
                  Manager (Can manage products & orders)
                </option>
                <option value="support">
                  Support (Can manage tickets & reviews)
                </option>
                <option value="customer">Demote to Customer</option>
              </select>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-colors shadow-md"
              >
                Save Permissions
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
