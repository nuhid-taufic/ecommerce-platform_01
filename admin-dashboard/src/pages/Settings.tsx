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
  ShieldAlert,
  Megaphone,
  Search,
  MapPin,
  FileText,
  DollarSign,
  Percent,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSettings } from "../context/SettingsProvider";

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const [formData, setFormData] = useState({
    // General
    storeName: "",
    browserTitle: "",
    contactEmail: "",
    contactPhone: "",
    storeAddress: "",
    
    // Brand
    logoUrl: "",
    faviconUrl: "",
    colors: { primary: "#2563eb", secondary: "#475569", optional: "#f59e0b" },
    
    // Config
    isMaintenanceMode: false,
    currencySymbol: "৳",
    currencyCode: "BDT",
    taxRate: 0,
    shippingInsideCity: 60,
    shippingOutsideCity: 120,

    // Marketing & SEO
    showAnnouncement: false,
    announcementText: "",
    announcementLink: "",
    showMarquee: true,
    marqueeText: "",
    seoDescription: "",
    seoKeywords: "",
    
    // Social & Legal
    socialLinks: { facebook: "", instagram: "" },
    footerText: "",
    refundPolicyUrl: "",
    privacyPolicyUrl: "",
    termsUrl: "",

    // Payment Numbers
    bkashNumber: "",
    nagadNumber: "",
    rocketNumber: "",
  });

  const { setSettings } = useSettings();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/settings`);
        const data = await res.json();

        if (res.ok && data.success && data.settings) {
          const s = data.settings;
          setFormData({
            storeName: s.storeName || "",
            browserTitle: s.browserTitle || "",
            contactEmail: s.contactEmail || "",
            contactPhone: s.contactPhone || "",
            storeAddress: s.storeAddress || "",
            
            logoUrl: s.logoUrl || "",
            faviconUrl: s.faviconUrl || "",
            colors: {
              primary: s.colors?.primary || "#2563eb",
              secondary: s.colors?.secondary || "#475569",
              optional: s.colors?.optional || "#f59e0b",
            },
            
            isMaintenanceMode: s.isMaintenanceMode || false,
            currencySymbol: s.currencySymbol || "৳",
            currencyCode: s.currencyCode || "BDT",
            taxRate: s.taxRate || 0,
            shippingInsideCity: s.shippingInsideCity || 60,
            shippingOutsideCity: s.shippingOutsideCity || 120,

            showAnnouncement: s.showAnnouncement || false,
            announcementText: s.announcementText || "",
            announcementLink: s.announcementLink || "",
            showMarquee: s.showMarquee !== undefined ? s.showMarquee : true,
            marqueeText: s.marqueeText || "",
            seoDescription: s.seoDescription || "",
            seoKeywords: s.seoKeywords || "",
            
            socialLinks: {
              facebook: s.socialLinks?.facebook || "",
              instagram: s.socialLinks?.instagram || "",
            },
            footerText: s.footerText || "",
            refundPolicyUrl: s.refundPolicyUrl || "",
            privacyPolicyUrl: s.privacyPolicyUrl || "",
            termsUrl: s.termsUrl || "",
            bkashNumber: s.bkashNumber || "",
            nagadNumber: s.nagadNumber || "",
            rocketNumber: s.rocketNumber || "",
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
    const toastId = toast.loading("Saving configuration to database...");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          shippingInsideCity: Number(formData.shippingInsideCity),
          shippingOutsideCity: Number(formData.shippingOutsideCity),
          taxRate: Number(formData.taxRate),
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("All systems updated successfully!", { id: toastId });
        document.title = formData.browserTitle;
        setSettings(data.settings); // Update global admin context
        
        // Update CSS vars immediately
        const root = document.documentElement;
        root.style.setProperty("--primary-color", formData.colors.primary);
        root.style.setProperty("--secondary-color", formData.colors.secondary);
        root.style.setProperty("--optional-color", formData.colors.optional);
        
        if (formData.faviconUrl) {
           let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
           if (!link) {
             link = document.createElement("link");
             link.rel = "icon";
             document.head.appendChild(link);
           }
           link.href = formData.faviconUrl;
        }
      } else {
        toast.error(data.message || "Failed to update", { id: toastId });
      }
    } catch (error) {
      toast.error("Network error", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "favicon") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = ["image/jpeg", "image/png", "image/x-icon", "image/svg+xml", "image/webp"].includes(file.type);
    if (!isImage) return toast.error("Invalid file type.");

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (type === "logo") setFormData(prev => ({ ...prev, logoUrl: base64String }));
      if (type === "favicon") setFormData(prev => ({ ...prev, faviconUrl: base64String }));
      toast.success(`Image staged. Save to commit changes.`);
    };
    reader.readAsDataURL(file);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: "general", label: "General", icon: <Store size={16} /> },
    { id: "branding", label: "Branding", icon: <Palette size={16} /> },
    { id: "commerce", label: "Commerce", icon: <DollarSign size={16} /> },
    { id: "marketing", label: "Marketing & SEO", icon: <Megaphone size={16} /> },
    { id: "legal", label: "Legal & Social", icon: <FileText size={16} /> },
  ];

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <SettingsIcon className="text-blue-600" /> Control Center
                </h1>
                <p className="text-sm font-medium text-slate-500 mt-1">Global configuration for storefront and operations.</p>
            </div>
            <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-lg active:scale-95 disabled:opacity-50"
            >
                <Save size={18} /> {saving ? "Synchronizing..." : "Save Configuration"}
            </button>
        </div>

        {/* Global Maintenance Banner */}
        <div className={`mb-8 p-5 rounded-2xl border flex items-center justify-between transition-colors ${formData.isMaintenanceMode ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${formData.isMaintenanceMode ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'}`}>
                    <ShieldAlert size={24} />
                </div>
                <div>
                    <h3 className={`font-black text-lg ${formData.isMaintenanceMode ? 'text-red-900' : 'text-slate-900'}`}>Maintenance Mode</h3>
                    <p className={`text-sm font-medium ${formData.isMaintenanceMode ? 'text-red-700' : 'text-slate-500'}`}>
                        {formData.isMaintenanceMode ? 'Storefront is currently hidden from public.' : 'Storefront is live and accepting orders.'}
                    </p>
                </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={formData.isMaintenanceMode} 
                    onChange={(e) => setFormData({...formData, isMaintenanceMode: e.target.checked})}
                />
                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500"></div>
            </label>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 mb-8 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                    {tab.icon} {tab.label}
                </button>
            ))}
        </div>

        {/* Tab Content Areas */}
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-8">
            
            {/* 1. GENERAL TAB */}
            {activeTab === "general" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2"><Store size={14} /> Identity</h3>
                            <div className="space-y-4">
                                <FormInput label="Store Name" value={formData.storeName} onChange={(e) => handleTextChange(e, 'storeName')} placeholder="e.g. My Awesome Store" />
                                <FormInput label="Browser Tab Title" value={formData.browserTitle} onChange={(e) => handleTextChange(e, 'browserTitle')} placeholder="Appears in browser tab" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2"><Mail size={14} /> Contact Details</h3>
                            <div className="space-y-4">
                                <FormInput label="Support Email" type="email" value={formData.contactEmail} onChange={(e) => handleTextChange(e, 'contactEmail')} />
                                <FormInput label="Support Phone" value={formData.contactPhone} onChange={(e) => handleTextChange(e, 'contactPhone')} />
                                <div>
                                    <label className="text-xs font-bold text-slate-600 block mb-1.5">Physical Address</label>
                                    <textarea 
                                        value={formData.storeAddress} 
                                        onChange={(e) => handleTextChange(e, 'storeAddress')} 
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm min-h-[100px]"
                                        placeholder="Full store address for invoices and footer"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. BRANDING TAB */}
            {activeTab === "branding" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2"><ImagePlus size={14} /> Visual Assets</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {/* Logo Upload */}
                        <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center relative hover:bg-slate-50 transition-colors group">
                            <label className="cursor-pointer flex flex-col items-center justify-center h-full">
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "logo")} />
                                {formData.logoUrl ? (
                                    <div className="bg-slate-100 p-4 rounded-2xl mb-4 group-hover:scale-105 transition-transform"><img src={formData.logoUrl} alt="Logo" className="h-16 object-contain" /></div>
                                ) : (
                                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4"><UploadCloud size={24} /></div>
                                )}
                                <p className="font-bold text-slate-800">Primary Logo</p>
                                <p className="text-xs font-medium text-slate-400 mt-1">Recommended: 250x100px transparent PNG</p>
                            </label>
                        </div>
                        {/* Favicon Upload */}
                        <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center relative hover:bg-slate-50 transition-colors group">
                            <label className="cursor-pointer flex flex-col items-center justify-center h-full">
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, "favicon")} />
                                {formData.faviconUrl ? (
                                    <div className="bg-slate-100 p-4 rounded-2xl mb-4 group-hover:scale-105 transition-transform"><img src={formData.faviconUrl} alt="Favicon" className="h-12 w-12 object-contain" /></div>
                                ) : (
                                    <div className="w-16 h-16 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mb-4"><LayoutTemplate size={24} /></div>
                                )}
                                <p className="font-bold text-slate-800">Browser Favicon</p>
                                <p className="text-xs font-medium text-slate-400 mt-1">Recommended: 32x32px ICO or PNG</p>
                            </label>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2"><Palette size={14} /> Theme Palette</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <ColorPicker label="Primary Color" value={formData.colors.primary} onChange={(v) => setFormData({ ...formData, colors: { ...formData.colors, primary: v }})} desc="Buttons & active states" />
                            <ColorPicker label="Secondary Color" value={formData.colors.secondary} onChange={(v) => setFormData({ ...formData, colors: { ...formData.colors, secondary: v }})} desc="Footers & subtle elements" />
                            <ColorPicker label="Accent Color" value={formData.colors.optional} onChange={(v) => setFormData({ ...formData, colors: { ...formData.colors, optional: v }})} desc="Badges & warnings" />
                        </div>
                    </div>
                </div>
            )}

            {/* 3. COMMERCE TAB */}
            {activeTab === "commerce" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2"><DollarSign size={14} /> Financial</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormInput label="Currency Symbol" value={formData.currencySymbol} onChange={(e) => handleTextChange(e, 'currencySymbol')} />
                                    <FormInput label="Currency Code" value={formData.currencyCode} onChange={(e) => handleTextChange(e, 'currencyCode')} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-600 block mb-1.5">Default Tax / VAT Rate (%)</label>
                                    <div className="relative">
                                        <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input type="number" value={formData.taxRate} onChange={(e) => handleTextChange(e, 'taxRate')} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2"><Truck size={14} /> Shipping Rates</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-600 block mb-1.5">Inside City Delivery</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{formData.currencySymbol}</span>
                                        <input type="number" value={formData.shippingInsideCity} onChange={(e) => handleTextChange(e, 'shippingInsideCity')} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-600 block mb-1.5">Outside City Delivery</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{formData.currencySymbol}</span>
                                        <input type="number" value={formData.shippingOutsideCity} onChange={(e) => handleTextChange(e, 'shippingOutsideCity')} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2"><Phone size={14} /> Mobile Payment Numbers</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormInput label="bKash Personal Number" value={formData.bkashNumber} onChange={(e: any) => handleTextChange(e, 'bkashNumber')} placeholder="e.g. 017xxxxxxxx" />
                            <FormInput label="Nagad Personal Number" value={formData.nagadNumber} onChange={(e: any) => handleTextChange(e, 'nagadNumber')} placeholder="e.g. 017xxxxxxxx" />
                            <FormInput label="Rocket Personal Number" value={formData.rocketNumber} onChange={(e: any) => handleTextChange(e, 'rocketNumber')} placeholder="e.g. 017xxxxxxxx" />
                        </div>
                    </div>
                </div>
            )}

            {/* 4. MARKETING & SEO TAB */}
            {activeTab === "marketing" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2"><Megaphone size={14} /> Global Announcement Bar (Static)</h3>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={formData.showAnnouncement} onChange={(e) => setFormData({...formData, showAnnouncement: e.target.checked})} />
                                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                            <div className={`space-y-4 ${!formData.showAnnouncement && 'opacity-50 pointer-events-none'}`}>
                                <FormInput label="Announcement Text" value={formData.announcementText} onChange={(e: any) => handleTextChange(e, 'announcementText')} placeholder="e.g. Free shipping on orders over $50!" />
                                <FormInput label="Banner Link (Optional)" value={formData.announcementLink} onChange={(e: any) => handleTextChange(e, 'announcementLink')} placeholder="e.g. /flash-sales" />
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2"><LayoutTemplate size={14} /> Infinite Marquee (Scrolling)</h3>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={formData.showMarquee} onChange={(e) => setFormData({...formData, showMarquee: e.target.checked})} />
                                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                            <div className={`space-y-4 ${!formData.showMarquee && 'opacity-50 pointer-events-none'}`}>
                                <div>
                                    <label className="text-xs font-bold text-slate-600 block mb-1.5">Marquee Message</label>
                                    <textarea 
                                        value={formData.marqueeText} 
                                        onChange={(e) => handleTextChange(e, 'marqueeText')} 
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm min-h-[80px]" 
                                        placeholder="Enter the scrolling message..."
                                    />
                                    <p className="text-[10px] text-slate-400 mt-2">This text will loop infinitely across the top of your homepage.</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-100">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2"><Search size={14} /> Search Engine Optimization</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-600 block mb-1.5">Meta Description</label>
                                    <textarea value={formData.seoDescription} onChange={(e) => handleTextChange(e, 'seoDescription')} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm min-h-[80px]" placeholder="Brief description of your store for Google results" />
                                </div>
                                <FormInput label="Meta Keywords" value={formData.seoKeywords} onChange={(e: any) => handleTextChange(e, 'seoKeywords')} placeholder="e.g. ecommerce, fashion, online store" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 5. LEGAL & SOCIAL TAB */}
            {activeTab === "legal" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2"><Share2 size={14} /> Social Connections</h3>
                            <div className="space-y-4">
                                <FormInput label="Facebook Page URL" value={formData.socialLinks.facebook} onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, facebook: e.target.value}})} placeholder="https://facebook.com/..." />
                                <FormInput label="Instagram URL" value={formData.socialLinks.instagram} onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, instagram: e.target.value}})} placeholder="https://instagram.com/..." />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2"><FileText size={14} /> Legal Pages & Footer</h3>
                            <div className="space-y-4">
                                <FormInput label="Footer Copyright Text" value={formData.footerText} onChange={(e) => handleTextChange(e, 'footerText')} placeholder="© 2024 Your Store. All rights reserved." />
                                <FormInput label="Privacy Policy URL" value={formData.privacyPolicyUrl} onChange={(e) => handleTextChange(e, 'privacyPolicyUrl')} placeholder="/privacy-policy" />
                                <FormInput label="Terms of Service URL" value={formData.termsUrl} onChange={(e) => handleTextChange(e, 'termsUrl')} placeholder="/terms" />
                                <FormInput label="Refund Policy URL" value={formData.refundPolicyUrl} onChange={(e) => handleTextChange(e, 'refundPolicyUrl')} placeholder="/refund-policy" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
}

// Helper Components
function FormInput({ label, type = "text", value, onChange, placeholder }: any) {
    return (
        <div>
            <label className="text-xs font-bold text-slate-600 block mb-1.5">{label}</label>
            <input 
                type={type} 
                value={value} 
                onChange={onChange} 
                placeholder={placeholder}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-sm transition-all"
            />
        </div>
    )
}

function ColorPicker({ label, value, onChange, desc }: any) {
    return (
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-sm border border-slate-200">
                <input 
                    type="color" 
                    value={value} 
                    onChange={(e) => onChange(e.target.value)}
                    className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                />
            </div>
            <div>
                <p className="text-sm font-bold text-slate-800">{label}</p>
                <p className="text-xs font-black text-slate-500 font-mono uppercase">{value}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-1">{desc}</p>
            </div>
        </div>
    )
}
