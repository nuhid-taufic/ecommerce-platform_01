import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Package,
  DollarSign,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import toast from "react-hot-toast";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

export default function Analytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/analytics`);
        const result = await res.json();

        if (res.ok && result.success) {
          setData(result);
        }
      } catch (error) {
        toast.error("Failed to fetch analytics data");

        setData({
          stats: {
            totalRevenue: 12500,
            totalOrders: 145,
            totalProducts: 48,
            totalCustomers: 89,
          },
          monthlySales: [
            { name: "Jan", revenue: 4000, orders: 24 },
            { name: "Feb", revenue: 3000, orders: 18 },
            { name: "Mar", revenue: 5500, orders: 35 },
            { name: "Apr", revenue: 4500, orders: 28 },
          ],
          categoryData: [
            { name: "Electronics", value: 20 },
            { name: "Clothing", value: 15 },
            { name: "Accessories", value: 13 },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-10 text-center text-slate-500 font-bold">
        Loading Analytics Dashboard...
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          Store Analytics
        </h1>
        <p className="text-slate-500 mt-1">
          Detailed overview of your store's performance and growth.
        </p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={`৳${data.stats.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="h-6 w-6 text-emerald-600" />}
          bg="bg-emerald-100"
        />
        <StatCard
          title="Total Orders"
          value={data.stats.totalOrders}
          icon={<TrendingUp className="h-6 w-6 text-blue-600" />}
          bg="bg-blue-100"
        />
        <StatCard
          title="Total Products"
          value={data.stats.totalProducts}
          icon={<Package className="h-6 w-6 text-purple-600" />}
          bg="bg-purple-100"
        />
        <StatCard
          title="Total Customers"
          value={data.stats.totalCustomers}
          icon={<Users className="h-6 w-6 text-amber-600" />}
          bg="bg-amber-100"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart: Revenue Trend */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-6">
            Revenue Trend (Monthly)
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.monthlySales}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickFormatter={(value) => `৳${value}`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Products by Category */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">
            Products by Category
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.categoryData.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Pie Chart Legend */}
          <div className="mt-4 flex flex-wrap gap-3 justify-center">
            {data.categoryData.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-1.5 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-slate-600 font-medium">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Stat Card Component
function StatCard({
  title,
  value,
  icon,
  bg,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bg: string;
}) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center ${bg}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-slate-400 uppercase">{title}</p>
        <p className="text-2xl font-black text-slate-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}
