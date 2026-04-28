import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useAppDispatch } from "../hooks/reduxHooks";
import { clearUser } from "../features/auth/authSlice";
import { useSettings } from "../context/SettingsProvider";

// LayoutGrid add kora hoice Category Control er jonno
import {
  LayoutDashboard,
  Box,
  Package,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Users,
  BarChart3,
  TicketPercent,
  Star,
  Settings,
  UserCog,
  Image,
  Headset,
  Zap,
  Truck,
  Sparkles,
  MonitorPlay,
  LayoutGrid,
  BookOpen,
  Mail,
} from "lucide-react";

export default function MainLayout() {
  const { settings } = useSettings();
  const dispatch = useAppDispatch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(clearUser());
    window.location.href = `${import.meta.env.VITE_API_URL?.replace("/api", "")}/auth/logout`;
  };

  // Ultimate Sidebar Menu List
  const navLinks = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    { title: "Orders", path: "/orders", icon: <Package className="h-5 w-5" /> },
    { title: "Products", path: "/products", icon: <Box className="h-5 w-5" /> },
    {
      title: "Customers",
      path: "/customers",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Analytics",
      path: "/analytics",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      title: "Coupons",
      path: "/coupons",
      icon: <TicketPercent className="h-5 w-5" />,
    },
    {
      title: "Flash Sales",
      path: "/flash-sales",
      icon: <Zap className="h-5 w-5" />,
    },
    { title: "Reviews", path: "/reviews", icon: <Star className="h-5 w-5" /> },
    {
      title: "Helpdesk",
      path: "/helpdesk",
      icon: <Headset className="h-5 w-5" />,
    },
    { title: "Media", path: "/media", icon: <Image className="h-5 w-5" /> },
    { title: "Staff", path: "/staff", icon: <UserCog className="h-5 w-5" /> },
    {
      title: "Hero Slider",
      path: "/hero-slider",
      icon: <MonitorPlay className="h-5 w-5" />,
    },
    {
      title: "Journal",
      path: "/journal",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      title: "Newsletter",
      path: "/newsletter",
      icon: <Mail className="h-5 w-5" />,
    },

    {
      title: "Categories Control",
      path: "/categories-control",
      icon: <LayoutGrid className="h-5 w-5" />,
    },
    {
      title: "Settings",
      path: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col bg-slate-900 text-white md:flex">
        <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6 font-bold text-xl shrink-0">
          {settings?.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt="Store Logo"
              className="h-8 max-w-[150px] object-contain"
            />
          ) : (
            <>
              <ShieldCheck
                className="h-6 w-6"
                style={{ color: "var(--primary-color, #3b82f6)" }}
              />
              <span>{settings?.storeName || "Enterprise"}</span>
            </>
          )}
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto custom-scrollbar">
          {navLinks.map((link) => (
            <NavLink
              key={link.title}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${isActive ? "text-white shadow-md" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`
              }
              style={({ isActive }) =>
                isActive
                  ? { backgroundColor: "var(--primary-color, #2563eb)" }
                  : {}
              }
            >
              {link.icon}
              {link.title}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-4 shrink-0">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-slate-400 transition-all hover:bg-red-500 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between bg-white px-4 shadow-sm md:hidden shrink-0">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
            <span>Enterprise</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-slate-600"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </header>

        {isMobileMenuOpen && (
          <div className="absolute top-16 z-50 w-full bg-slate-900 text-white shadow-lg md:hidden overflow-y-auto max-h-[calc(100vh-64px)]">
            <nav className="flex flex-col space-y-1 p-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.title}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-3 ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-slate-400 hover:bg-slate-800"
                    }`
                  }
                >
                  {link.icon}
                  {link.title}
                </NavLink>
              ))}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg mt-2 px-3 py-3 text-slate-400 hover:bg-red-500 hover:text-white border-t border-slate-800"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
