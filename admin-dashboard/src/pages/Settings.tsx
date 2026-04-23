import React, { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Save,
  Truck,
  Globe,
  Phone,
  Mail,
  Store,
  Share2,
  Camera,
  Palette,
  ImagePlus,
  LayoutTemplate,
  UploadCloud,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    storeName: "",
    browserTitle: "",
    contactEmail: "",
    contactPhone: "",
    shippingInsideCity: 60,
    shippingOutsideCity: 120,
    logoUrl: "",
    faviconUrl: "",
    colors: { primary: "#2563eb", secondary: "#475569", optional: "#f59e0b" },
    socialLinks: { facebook: "", instagram: "" },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/settings`);
        const data = await res.json();

        if (res.ok && data.success && data.settings) {
          setFormData({
            storeName: data.settings.storeName || "",
            browserTitle: data.settings.browserTitle || "",
            contactEmail: data.settings.contactEmail || "",
            contactPhone: data.settings.contactPhone || "",
            shippingInsideCity: data.settings.shippingInsideCity || 60,
            shippingOutsideCity: data.settings.shippingOutsideCity || 120,
            logoUrl: data.settings.logoUrl || "",
            faviconUrl: data.settings.faviconUrl || "",
            colors: {
              primary: data.settings.colors?.primary || "#2563eb",
              secondary: data.settings.colors?.secondary || "#475569",
              optional: data.settings.colors?.optional || "#f59e0b",
            },
            socialLinks: {
              facebook: data.settings.socialLinks?.facebook || "",
              instagram: data.settings.socialLinks?.instagram || "",
            },
          });
        }
      } catch (error) {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading("Saving changes...");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          shippingInsideCity: Number(formData.shippingInsideCity),
          shippingOutsideCity: Number(formData.shippingOutsideCity),
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Settings updated successfully!", { id: toastId });
        // Optional: You can dynamically update browser tab title here
        document.title = formData.browserTitle;
      } else {
        toast.error(data.message || "Failed to update", { id: toastId });
      }
    } catch (error) {
      toast.error("Network error", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  // Simulated Image Upload Handler (Can be replaced with Cloudinary later)
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "favicon",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation based on type
    const isImage =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/x-icon" ||
      file.type === "image/svg+xml";
    if (!isImage) {
      toast.error("Invalid file type. Please upload PNG, JPG, or SVG.");
      return;
    }

    if (type === "logo" && file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be less than 2MB.");
      return;
    }
    if (type === "favicon" && file.size > 1 * 1024 * 1024) {
      toast.error("Favicon must be less than 1MB.");
      return;
    }

    // Simulating upload by converting to local blob URL (for immediate preview)
    // In real backend, upload this file using FormData to your server/Cloudinary
    toast.success(
      `${type === "logo" ? "Logo" : "Favicon"} selected! Click save to apply.`,
    );
    const localUrl = URL.createObjectURL(file);

    if (type === "logo") setFormData({ ...formData, logoUrl: localUrl });
    if (type === "favicon") setFormData({ ...formData, faviconUrl: localUrl });
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-slate-500 font-bold">
        Loading Store Settings...
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-blue-600" />
            System Settings
          </h1>
          <p className="text-slate-500 mt-1">
            Manage brand identity, colors, shipping, and core system info.
          </p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-70"
        >
          <Save className="h-5 w-5" />{" "}
          {saving ? "Saving..." : "Save All Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Brand & Theme */}
        <div className="lg:col-span-2 space-y-6">
          {/* Brand Identity & Assets */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
              <ImagePlus className="h-5 w-5 text-indigo-500" /> Brand Identity &
              Assets
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Main Logo */}
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center relative hover:bg-slate-50 transition-colors">
                <label className="cursor-pointer flex flex-col items-center justify-center h-full">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/svg+xml"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, "logo")}
                  />
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      alt="Logo Preview"
                      className="h-16 object-contain mb-3"
                    />
                  ) : (
                    <UploadCloud className="h-10 w-10 text-slate-400 mb-2" />
                  )}
                  <p className="text-sm font-bold text-slate-700">
                    Upload Main Logo
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    PNG, JPG or SVG (Max 2MB). Ideal size: 250x100px
                  </p>
                </label>
              </div>

              {/* Favicon */}
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center relative hover:bg-slate-50 transition-colors">
                <label className="cursor-pointer flex flex-col items-center justify-center h-full">
                  <input
                    type="file"
                    accept="image/png, image/x-icon"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, "favicon")}
                  />
                  {formData.faviconUrl ? (
                    <img
                      src={formData.faviconUrl}
                      alt="Favicon Preview"
                      className="h-10 w-10 object-contain mb-3"
                    />
                  ) : (
                    <LayoutTemplate className="h-10 w-10 text-slate-400 mb-2" />
                  )}
                  <p className="text-sm font-bold text-slate-700">
                    Upload Favicon
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    ICO or PNG (Max 1MB). Ideal size: 32x32px or 64x64px
                  </p>
                </label>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">
                Browser Tab Title (Menubar Name)
              </label>
              <input
                type="text"
                placeholder="e.g. My Awesome Store | Home"
                value={formData.browserTitle}
                onChange={(e) =>
                  setFormData({ ...formData, browserTitle: e.target.value })
                }
                className="w-full px-4 py-2 mt-1 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                This text appears on the user's browser tab.
              </p>
            </div>
          </div>

          {/* Theme Colors */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
              <Palette className="h-5 w-5 text-pink-500" /> Theme Colors
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">
                  Primary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.colors.primary}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        colors: { ...formData.colors, primary: e.target.value },
                      })
                    }
                    className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                  />
                  <span className="font-mono text-sm text-slate-600 uppercase">
                    {formData.colors.primary}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                  Main buttons, active links, header
                </p>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">
                  Secondary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.colors.secondary}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        colors: {
                          ...formData.colors,
                          secondary: e.target.value,
                        },
                      })
                    }
                    className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                  />
                  <span className="font-mono text-sm text-slate-600 uppercase">
                    {formData.colors.secondary}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                  Footers, borders, secondary text
                </p>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">
                  Optional / Accent Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.colors.optional}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        colors: {
                          ...formData.colors,
                          optional: e.target.value,
                        },
                      })
                    }
                    className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                  />
                  <span className="font-mono text-sm text-slate-600 uppercase">
                    {formData.colors.optional}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                  Badges, sales tags, warnings
                </p>
              </div>
            </div>
          </div>

          {/* General Information (Store name, Email, Phone) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
              <Store className="h-5 w-5 text-purple-500" /> General Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Store Name
                </label>
                <input
                  type="text"
                  value={formData.storeName}
                  onChange={(e) =>
                    setFormData({ ...formData, storeName: e.target.value })
                  }
                  className="w-full px-4 py-2 mt-1 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Support Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, contactEmail: e.target.value })
                    }
                    className="w-full px-4 py-2 mt-1 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Support Phone
                  </label>
                  <input
                    type="text"
                    value={formData.contactPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, contactPhone: e.target.value })
                    }
                    className="w-full px-4 py-2 mt-1 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Shipping & Socials */}
        <div className="space-y-6">
          {/* Shipping Rates */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
              <Truck className="h-5 w-5 text-amber-500" /> Shipping Rates
            </h2>

            <div className="space-y-5">
              <div className="relative">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Inside City (৳ / $)
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-bold">৳</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={formData.shippingInsideCity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shippingInsideCity: Number(e.target.value),
                      })
                    }
                    className="w-full pl-8 pr-4 py-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl focus:ring-2 focus:ring-amber-500 font-black text-lg"
                  />
                </div>
              </div>

              <div className="relative border-t border-slate-100 pt-5">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Outside City (৳ / $)
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-400 font-bold">৳</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={formData.shippingOutsideCity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shippingOutsideCity: Number(e.target.value),
                      })
                    }
                    className="w-full pl-8 pr-4 py-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl focus:ring-2 focus:ring-amber-500 font-black text-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" /> Social Presence
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Share2 className="h-3 w-3 text-blue-600" /> Facebook Page URL
                </label>
                <input
                  type="url"
                  placeholder="https://facebook.com/yourstore"
                  value={formData.socialLinks.facebook}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: {
                        ...formData.socialLinks,
                        facebook: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2 mt-1 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Camera className="h-3 w-3 text-pink-600" /> Instagram URL
                </label>
                <input
                  type="url"
                  placeholder="https://instagram.com/yourstore"
                  value={formData.socialLinks.instagram}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: {
                        ...formData.socialLinks,
                        instagram: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2 mt-1 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
