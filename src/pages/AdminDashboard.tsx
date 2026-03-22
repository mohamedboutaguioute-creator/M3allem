import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  ShieldAlert, 
  Search, 
  MoreVertical, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Filter,
  Download
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { AdminSidebar } from '../components/AdminSidebar';
import { Handyman, Transaction, AdminStats } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

// Mock Data for Dashboard
const MOCK_STATS: AdminStats = {
  total_handymen: 1240,
  mrr: 45200,
  pending_verifications: 18,
  growth_data: [
    { date: 'Mar 01', count: 850 },
    { date: 'Mar 05', count: 920 },
    { date: 'Mar 10', count: 1050 },
    { date: 'Mar 15', count: 1120 },
    { date: 'Mar 20', count: 1240 },
  ],
  category_distribution: [
    { name: 'Electricity', value: 450 },
    { name: 'Plumbing', value: 380 },
    { name: 'Construction', value: 290 },
    { name: 'Painting', value: 120 },
  ]
};

const MOCK_HANDYMEN: Handyman[] = [
  {
    id: '1',
    full_name: 'Ahmed El Mansouri',
    avatar_url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=100&h=100&fit=crop',
    category: 'Electricity',
    city: 'Casablanca',
    rating: 4.9,
    review_count: 124,
    is_verified: true,
    subscription_status: 'Premium',
    bio: 'Expert electrician...',
    whatsapp_number: '+212600000000',
    created_at: '2024-01-15'
  },
  {
    id: '2',
    full_name: 'Youssef Benali',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    category: 'Plumbing',
    city: 'Marrakech',
    rating: 4.8,
    review_count: 89,
    is_verified: false,
    subscription_status: 'Free',
    bio: 'Plumber...',
    whatsapp_number: '+212600000001',
    created_at: '2024-02-10'
  }
];

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    handyman_id: '1',
    handyman_name: 'Ahmed El Mansouri',
    amount: 299,
    date: '2024-03-20',
    method: 'Stripe',
    status: 'Confirmed'
  },
  {
    id: 't2',
    handyman_id: '3',
    handyman_name: 'Mustapha Alami',
    amount: 299,
    date: '2024-03-21',
    method: 'Bank Transfer',
    status: 'Pending'
  }
];

const COLORS = ['#1E3A8A', '#F59E0B', '#10B981', '#6366F1'];

export const AdminDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'handymen' | 'payments'>('overview');

  // Logic for Supabase Realtime would go here
  // useEffect(() => {
  //   const subscription = supabase
  //     .channel('handymen_changes')
  //     .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'handymen' }, payload => {
  //       // Update stats in real-time
  //     })
  //     .subscribe();
  //   return () => { subscription.unsubscribe(); };
  // }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard Overview</h1>
            <p className="text-slate-500 font-medium">Welcome back, Admin. Here's what's happening today.</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 flex items-center gap-2 hover:bg-slate-50 transition-all">
              <Download className="w-4 h-4" /> Export Report
            </button>
            <div className="w-10 h-10 bg-slate-200 rounded-full border-2 border-white shadow-sm overflow-hidden">
              <img src="https://picsum.photos/seed/admin/100/100" alt="Admin" />
            </div>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <MetricCard 
            title="Total Handymen" 
            value={MOCK_STATS.total_handymen.toLocaleString()} 
            icon={Users} 
            trend="+12% this month"
            color="blue"
          />
          <MetricCard 
            title="Monthly Revenue (MRR)" 
            value={`${MOCK_STATS.mrr.toLocaleString()} MAD`} 
            icon={DollarSign} 
            trend="+8.4% vs last month"
            color="amber"
          />
          <MetricCard 
            title="Pending Verifications" 
            value={MOCK_STATS.pending_verifications.toString()} 
            icon={ShieldAlert} 
            trend="Needs attention"
            color="rose"
            urgent={MOCK_STATS.pending_verifications > 10}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Growth Chart */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-slate-900">User Growth</h3>
              <select className="bg-slate-50 border-none rounded-lg text-xs font-bold text-slate-500 px-3 py-1.5">
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_STATS.growth_data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#1E3A8A" 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: '#1E3A8A', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-8">Specialty Distribution</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MOCK_STATS.category_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {MOCK_STATS.category_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 mt-4">
              {MOCK_STATS.category_distribution.map((cat, idx) => (
                <div key={cat.name} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-sm font-bold text-slate-600">{cat.name}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{cat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Handyman Management Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-10">
          <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="text-xl font-black text-slate-900">Handyman Management</h3>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search pros..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#1E3A8A]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="p-2 bg-slate-50 rounded-xl text-slate-500 hover:bg-slate-100 transition-all">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Handyman</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Specialty</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">City</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Subscription</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {MOCK_HANDYMEN.map((pro) => (
                  <tr key={pro.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <img src={pro.avatar_url} className="w-10 h-10 rounded-xl object-cover" alt="" />
                        <div>
                          <p className="font-bold text-slate-900">{pro.full_name}</p>
                          <p className="text-xs text-slate-400">Joined {pro.created_at}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-blue-50 text-[#1E3A8A] rounded-lg text-xs font-bold">{pro.category}</span>
                    </td>
                    <td className="px-8 py-5 text-sm font-semibold text-slate-600">{pro.city}</td>
                    <td className="px-8 py-5">
                      {pro.is_verified ? (
                        <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                          <CheckCircle className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-amber-600 text-xs font-bold">
                          <ShieldAlert className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                          pro.subscription_status === 'Premium' ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                        )}>
                          {pro.subscription_status}
                        </span>
                        <button className="text-[10px] font-bold text-[#1E3A8A] hover:underline">Toggle</button>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-all">
                        <MoreVertical className="w-5 h-5 text-slate-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payments Tracker */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50">
            <h3 className="text-xl font-black text-slate-900">Recent Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Handyman</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Method</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {MOCK_TRANSACTIONS.map((tx) => (
                  <tr key={tx.id}>
                    <td className="px-8 py-5 font-bold text-slate-900">{tx.handyman_name}</td>
                    <td className="px-8 py-5 text-sm text-slate-500">{tx.date}</td>
                    <td className="px-8 py-5 font-black text-slate-900">{tx.amount} MAD</td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-bold text-slate-600">{tx.method}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                        tx.status === 'Confirmed' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      {tx.status === 'Pending' && (
                        <button className="bg-[#1E3A8A] text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-[#162a63] transition-all">
                          Confirm Transfer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  trend: string;
  color: 'blue' | 'amber' | 'rose';
  urgent?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, trend, color, urgent }) => {
  const colors = {
    blue: 'bg-blue-50 text-[#1E3A8A]',
    amber: 'bg-amber-50 text-[#F59E0B]',
    rose: 'bg-rose-50 text-rose-600'
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={cn(
        "bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden",
        urgent && "ring-2 ring-rose-500 ring-offset-2"
      )}
    >
      <div className="flex justify-between items-start mb-6">
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", colors[color])}>
          <Icon className="w-7 h-7" />
        </div>
        <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs">
          <TrendingUp className="w-3 h-3" />
          {trend}
        </div>
      </div>
      <h4 className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-1">{title}</h4>
      <p className="text-3xl font-black text-slate-900">{value}</p>
      
      {urgent && (
        <div className="absolute top-0 right-0 p-2">
          <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
        </div>
      )}
    </motion.div>
  );
};
