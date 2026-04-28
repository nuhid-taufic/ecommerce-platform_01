import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  MousePointer2,
  UserCheck,
  Calendar,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

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
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Calibrating Analytics Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
            <BarChart3 className="h-10 w-10 text-blue-600" />
            Performance Intel
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Monitoring site traffic and revenue streams in real-time.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Calendar size={20} />
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Snapshot Date</p>
                <p className="font-black text-slate-800">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            </div>
        </div>
      </div>

      {/* High-Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          title="Gross Revenue"
          value={`৳${data.stats.totalRevenue.toLocaleString()}`}
          sub="Delivered orders only"
          icon={<DollarSign size={24} />}
          color="emerald"
        />
        <StatCard
          title="Total Traffic"
          value={data.stats.totalVisits.toLocaleString()}
          sub="Lifetime site visits"
          icon={<MousePointer2 size={24} />}
          color="blue"
        />
        <StatCard
          title="Unique Visitors"
          value={data.stats.uniqueVisitors.toLocaleString()}
          sub="Identified distinct users"
          icon={<UserCheck size={24} />}
          color="purple"
        />
        <StatCard
          title="Conversion"
          value={`${((data.stats.totalOrders / (data.stats.uniqueVisitors || 1)) * 100).toFixed(1)}%`}
          sub="Orders per unique visitor"
          icon={<Activity size={24} />}
          color="amber"
        />
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Traffic Intelligence */}
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Daily Traffic Flow</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Last 7 Days Activity</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-600" />
                            <span className="text-[10px] font-black text-slate-400 uppercase">Visits</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-200" />
                            <span className="text-[10px] font-black text-slate-400 uppercase">Unique</span>
                        </div>
                    </div>
                </div>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.trafficData.daily}>
                            <defs>
                                <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="date" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                                dy={10}
                                tickFormatter={(str) => str.split('-').slice(1).reverse().join('/')}
                            />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                            <Tooltip 
                                contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px'}}
                                itemStyle={{fontWeight: 900, fontSize: '12px'}}
                            />
                            <Area type="monotone" dataKey="visits" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorVisits)" />
                            <Area type="monotone" dataKey="unique" stroke="#93c5fd" strokeWidth={2} fill="none" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Revenue Stream</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Monthly Financial Growth</p>
                    </div>
                </div>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.monthlySales}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                                dy={10}
                            />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} tickFormatter={(v) => `৳${v/1000}k`} />
                            <Tooltip 
                                contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px'}}
                                itemStyle={{fontWeight: 900, fontSize: '12px'}}
                            />
                            <Line type="stepAfter" dataKey="revenue" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Inventory & Potential Data */}
        <div className="space-y-8">
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Inventory Split</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data.categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={90}
                                paddingAngle={8}
                                dataKey="value"
                            >
                                {data.categoryData.map((_: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-8 space-y-3">
                    {data.categoryData.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                <span className="text-xs font-bold text-slate-600">{entry.name}</span>
                            </div>
                            <span className="text-xs font-black text-slate-900">{entry.value} Items</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Potential Data Tracking */}
            <div className="bg-slate-900 rounded-[40px] p-8 text-white">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-black tracking-tight">Visitor Insights</h3>
                    <span className="bg-blue-600 text-[8px] font-black uppercase px-2 py-1 rounded-full">New Beta</span>
                </div>
                <div className="space-y-6">
                    <div className="p-5 rounded-3xl bg-white/5 border border-white/10">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Device Segmentation</p>
                        <div className="space-y-4">
                            <DeviceMetric label="Desktop" value={data.trafficData.devices?.desktop || 0} color="blue-500" />
                            <DeviceMetric label="Mobile" value={data.trafficData.devices?.mobile || 0} color="emerald-500" />
                            <DeviceMetric label="Tablet" value={data.trafficData.devices?.tablet || 0} color="amber-500" />
                        </div>
                    </div>
                    
                    <div className="p-5 rounded-3xl bg-white/5 border border-white/10">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Traffic Sources</p>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-bold">Direct Access</span>
                                <span className="font-black">{data.trafficData.platforms?.direct || 0}%</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-bold">Search Engines</span>
                                <span className="font-black">{data.trafficData.platforms?.search || 0}%</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-bold">Social Media</span>
                                <span className="font-black">{data.trafficData.platforms?.social || 0}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}

function DeviceMetric({ label, value, color }: { label: string, value: number, color: string }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-300">{label}</span>
                <span className="text-xs font-black text-white">{value}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full bg-${color}`} style={{ width: `${value}%` }} />
            </div>
        </div>
    )
}

function StatCard({ title, value, sub, icon, color }: any) {
  const colorMap: any = {
    emerald: "bg-emerald-50 text-emerald-600 shadow-emerald-100",
    blue: "bg-blue-50 text-blue-600 shadow-blue-100",
    purple: "bg-purple-50 text-purple-600 shadow-purple-100",
    amber: "bg-amber-50 text-amber-600 shadow-amber-100",
  };

  return (
    <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex items-center justify-between group hover:shadow-xl hover:-translate-y-1 transition-all">
      <div className="space-y-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
        <p className="text-[10px] font-bold text-slate-300">{sub}</p>
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${colorMap[color]}`}>
        {icon}
      </div>
    </div>
  );
}
