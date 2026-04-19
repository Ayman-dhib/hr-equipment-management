import React, { useState, useEffect } from 'react';
import api from '../lib/axios';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Check, X, Trash2, CalendarHeart, Clock, FileText, Filter } from 'lucide-react';

export default function LeaveRequests() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [requests, setRequests] = useState([]);
  const [filterType, setFilterType] = useState('All');
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ type: 'Sick Leave', start_date: '', end_date: '', reason: '' });

  const fetchRequests = async () => {
    try {
      const res = await api.get('/leave-requests');
      setRequests(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leave-requests', formData);
      setIsModalOpen(false);
      fetchRequests();
      setFormData({ type: 'Sick Leave', start_date: '', end_date: '', reason: '' });
    } catch (e) {
      alert(e.response?.data?.message || 'Error occurred');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/leave-requests/${id}/status`, { status });
      fetchRequests();
    } catch (e) {
      alert(e.response?.data?.message || 'Error occurred');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;
    try {
      await api.delete(`/leave-requests/${id}`);
      fetchRequests();
    } catch (e) {
      alert('Error withdrawing request');
    }
  };

  const types = ['All', 'Sick Leave', 'Vacation', 'Personal'];
  const filteredRequests = requests.filter(req => filterType === 'All' || req.type === filterType);

  const pending = filteredRequests.filter(r => r.status === 'Pending');
  const approved = filteredRequests.filter(r => r.status === 'Approved');
  const rejected = filteredRequests.filter(r => r.status === 'Rejected');

  const Column = ({ title, colorClass, items }) => (
    <div className="flex flex-col gap-4 bg-gray-50/50 rounded-3xl p-5 border border-gray-100 min-h-[500px]">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-extrabold tracking-tight text-gray-800">{title}</h2>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${colorClass.badge}`}>
          {items.length}
        </span>
      </div>
      
      <div className="flex flex-col gap-4 flex-1">
        {items.length === 0 ? (
          <div className="h-full border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center text-gray-400 text-sm font-medium">
            Empty queue
          </div>
        ) : items.map(req => (
          <div key={req.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100/80 hover:shadow-md transition-all hover:-translate-y-0.5 group">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{req.type}</span>
              {isAdmin && req.status === 'Pending' && (
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleStatusUpdate(req.id, 'Approved')} className="p-1.5 bg-green-50 text-green-600 hover:bg-green-500 hover:text-white rounded-lg transition-all" title="Approve">
                    <Check size={16}/>
                  </button>
                  <button onClick={() => handleStatusUpdate(req.id, 'Rejected')} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-all" title="Reject">
                    <X size={16}/>
                  </button>
                </div>
              )}
              {!isAdmin && req.status === 'Pending' && (
                <button onClick={() => handleDelete(req.id)} className="p-1.5 opacity-0 group-hover:opacity-100 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-all" title="Withdraw Request">
                  <Trash2 size={16}/>
                </button>
              )}
            </div>
            
            <div className="mb-4">
              <div className="font-bold text-gray-900 leading-tight">
                {isAdmin ? req.employee?.user?.name : 'My Application'}
              </div>
              <div className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                "{req.reason}"
              </div>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
              <Clock size={16} className="text-gray-400" />
              <div className="text-xs font-medium text-gray-600">
                {new Date(req.start_date).toLocaleDateString(undefined, {month:'short', day:'numeric'})} - {new Date(req.end_date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 h-full flex flex-col">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-gray-100/50 shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Time Off Requests</h1>
          <p className="text-gray-500 mt-2 font-medium relative top-1">Manage absences and vacation planning.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 p-1 rounded-full overflow-x-auto scrollbar-none">
            {types.map(type => (
               <button 
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  filterType === type ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
               >
                 {type}
               </button>
            ))}
          </div>
          
          {!isAdmin && (
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-full font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 whitespace-nowrap">
              <CalendarHeart size={20} /> Request Leave
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
           <div className="text-gray-400 font-medium">Syncing leave schedules...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
          <Column title="Needs Review" items={pending} colorClass={{badge: 'bg-amber-100 text-amber-700'}} />
          <Column title="Approved" items={approved} colorClass={{badge: 'bg-green-100 text-green-700'}} />
          <Column title="Declined" items={rejected} colorClass={{badge: 'bg-rose-100 text-rose-700'}} />
        </div>
      )}

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 my-8 border border-white/20">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-8">Submit Time Off</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Leave Category</label>
                <select className="w-full bg-gray-50 border-0 ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-amber-500 rounded-xl p-3 px-4 font-medium" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option>Sick Leave</option>
                  <option>Vacation</option>
                  <option>Personal</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">First Day Off</label>
                  <input type="date" required className="w-full bg-gray-50 border-0 ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-amber-500 rounded-xl p-3 px-4 font-medium" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Last Day Off</label>
                  <input type="date" required className="w-full bg-gray-50 border-0 ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-amber-500 rounded-xl p-3 px-4 font-medium" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Reason for leave</label>
                <textarea required rows="4" placeholder="Briefly describe why you are requesting time off..." className="w-full bg-gray-50 border-0 ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-amber-500 rounded-xl p-3 px-4 font-medium resize-none" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
              </div>
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 hover:shadow-lg transition-all shadow-md">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
