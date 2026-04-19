import React, { useEffect, useState } from 'react';
import api from '../lib/axios';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Monitor, Calendar, Clock, Activity, ArrowUpRight } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    api.get('/dashboard').then(res => setData(res.data.data)).catch(console.error);
  }, []);

  if (!data) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <div className="text-gray-500 font-medium animate-pulse">Loading amazing insights...</div>
      </div>
    </div>
  );

  const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Welcome Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary to-purple-600 rounded-3xl p-8 sm:p-10 shadow-lg text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
              {greeting}, {user?.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-primary-100 text-lg max-w-xl">
              Here is what's happening across your organization today.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
            <Clock className="text-white opacity-80" size={24}/>
            <div>
              <div className="text-xs text-white/80 uppercase font-semibold tracking-wider">Today</div>
              <div className="font-bold">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
            </div>
          </div>
        </div>
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl mix-blend-overlay"></div>
        <div className="absolute bottom-0 right-40 w-60 h-60 bg-blue-400/20 rounded-full blur-3xl mix-blend-overlay"></div>
      </div>
      
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50 flex flex-col relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3.5 rounded-2xl text-white shadow-md group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <div className="flex items-center gap-1 text-green-500 text-sm font-semibold bg-green-50 px-2 py-1 rounded-full">
              <ArrowUpRight size={14} /> +4%
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-gray-900 mb-1">{data.stats.total_employees}</div>
            <div className="text-sm text-gray-500 font-medium">Company Headcount</div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50 flex flex-col relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-gradient-to-br from-teal-400 to-emerald-600 p-3.5 rounded-2xl text-white shadow-md group-hover:scale-110 transition-transform">
              <Monitor size={24} />
            </div>
            <div className="flex items-center gap-1 text-green-500 text-sm font-semibold bg-green-50 px-2 py-1 rounded-full">
              <Activity size={14} /> Active
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-gray-900 mb-1">{data.stats.total_equipment}</div>
            <div className="text-sm text-gray-500 font-medium">{user?.role === 'admin' ? 'Equipment Units Tracked' : 'Hardware Assigned To You'}</div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100/50 flex flex-col relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-gradient-to-br from-orange-400 to-red-500 p-3.5 rounded-2xl text-white shadow-md group-hover:scale-110 transition-transform">
              <Calendar size={24} />
            </div>
            {data.stats.pending_leave_requests > 0 && (
              <div className="flex items-center gap-1 text-amber-600 text-sm font-semibold bg-amber-50 px-2 py-1 rounded-full animate-pulse">
                Action Required
              </div>
            )}
          </div>
          <div>
            <div className="text-3xl font-extrabold text-gray-900 mb-1">{data.stats.pending_leave_requests}</div>
            <div className="text-sm text-gray-500 font-medium">{user?.role === 'admin' ? 'Pending Leave Approvals' : 'Your Pending Leaves'}</div>
          </div>
        </div>
      </div>

      {/* Advanced Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/80 backdrop-blur-sm p-7 rounded-3xl shadow-sm border border-gray-100/50 transition-shadow hover:shadow-lg">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Workforce Demographics</h2>
              <p className="text-gray-500 text-sm mt-1">Employees categorized by department cluster</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts.employees_by_department} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 500}} dy={15}/>
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 500}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px 20px', fontWeight: 'bold' }} 
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={45}>
                  {data.charts.employees_by_department.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-7 rounded-3xl shadow-sm border border-gray-100/50 transition-shadow hover:shadow-lg">
           <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Equipment Health</h2>
              <p className="text-gray-500 text-sm mt-1">Status distribution of all active inventory</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={data.charts.equipment_by_status} 
                  cx="50%" cy="50%" 
                  innerRadius={80} outerRadius={110} 
                  paddingAngle={6} 
                  dataKey="count"
                  nameKey="status"
                  stroke='none'
                >
                  {data.charts.equipment_by_status.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.status === 'in use' ? '#14b8a6' : entry.status === 'available' ? '#6366f1' : '#f43f5e'} 
                      className="hover:opacity-80 transition-opacity outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px 20px', fontWeight: 'bold' }} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', fontWeight: 500, paddingTop: '20px' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
