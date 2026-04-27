import { useEffect, useState } from "react";
import { useAppSelector } from "../hooks/reduxHooks";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DollarSign, ShoppingBag, Users, Box, Trophy } from "lucide-react"; // Trophy icon add kora hoyeche

export default function Dashboard() {
  const { user } = useAppSelector((state) => state.auth);

  // State e notun field gulo add kora holo
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    chartData: [],
    last7DaysOrders: 0,
    last7DaysRevenue: 0,
    newCustomers7Days: 0,
    topProducts: [] as any[],
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/stats`);
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }
    };

    fetchDashboardStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return `৳${new Intl.NumberFormat("en-BD", {
      maximumFractionDigits: 0,
    }).format(amount)}`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {user?.avatar && (
          <img
            src={user.avatar}
            alt="Profile"
            className="h-16 w-16 rounded-full border-4 border-white shadow-md object-cover"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Overview
          </h1>
          <p className="text-slate-500">
            Welcome back,{" "}
            <span className="font-semibold text-slate-800">
              {user?.name || "Admin"}
            </span>
            . Here is your enterprise summary.
          </p>
        </div>
      </div>

      {/* Top Cards - Trend e Last 7 days er data bosano holo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={<DollarSign className="h-5 w-5 text-primary" />}
          trend={`+${formatCurrency(stats.last7DaysRevenue)} in last 7 days`}
        />
        <MetricCard
          title="Total Orders"
          value={formatNumber(stats.totalOrders)}
          icon={<ShoppingBag className="h-5 w-5 text-primary" />}
          trend={`+${stats.last7DaysOrders} orders this week`}
        />
        <MetricCard
          title="Total Customers"
          value={formatNumber(stats.totalCustomers)}
          icon={<Users className="h-5 w-5 text-primary" />}
          trend={`+${stats.newCustomers7Days} new this week`}
        />
        <MetricCard
          title="Total Products"
          value={formatNumber(stats.totalProducts)}
          icon={<Box className="h-5 w-5 text-primary" />}
          trend="Available in database"
        />
      </div>

      {/* Main Content: Chart (Left) & Top Products (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart (2 columns width on large screens) */}
        <div className="lg:col-span-2 rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-foreground">
            Revenue Over Time (Last 6 Months)
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats.chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `৳${value}`}
                />
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                  }}
                  itemStyle={{
                    color: "hsl(var(--foreground))",
                    fontWeight: "bold",
                  }}
                  formatter={(value: number) => [`৳${value}`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 10 Trending Products (1 column width) */}
        <div className="rounded-lg border bg-card p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Top Trending Products
          </h2>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {stats.topProducts && stats.topProducts.length > 0 ? (
              stats.topProducts.map((product, index) => (
                <div
                  key={product._id}
                  className="flex justify-between items-center pb-3 border-b border-slate-100 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-black text-sm ${index === 0 ? "text-amber-500" : index === 1 ? "text-slate-400" : index === 2 ? "text-amber-700" : "text-slate-300"}`}
                    >
                      #{index + 1}
                    </span>
                    <span className="font-medium text-slate-700 line-clamp-1 max-w-[120px] sm:max-w-[150px]">
                      {product.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">
                      {product.totalSold} sold
                    </p>
                    <p className="text-xs font-semibold text-emerald-600">
                      {formatCurrency(product.totalRevenue)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                No sales data yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string;
  value: string;
  icon: any;
  trend: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between pb-2">
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        <div className="p-2 bg-primary/10 rounded-full">{icon}</div>
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs font-semibold text-emerald-600 mt-1">{trend}</p>
      </div>
    </div>
  );
}
