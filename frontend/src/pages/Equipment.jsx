import React, { useState, useEffect } from 'react';
import api from '../lib/axios';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit2, Trash2, Search, Filter, Monitor, Box, Smartphone, Hash, UserCheck } from 'lucide-react';

export default function Equipment() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [equipmentList, setEquipmentList] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const initialForm = {
    name: '', category: 'Electronics', serial_number: '', assigned_to: '', status: 'available'
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    try {
      const [eqRes, empRes] = await Promise.all([
        api.get('/equipment', {
          params: {
            search: searchQuery || undefined,
            category: filterCat !== 'All' ? filterCat : undefined
          }
        }),
        isAdmin ? api.get('/employees') : Promise.resolve({data:{data:[]}})
      ]);
      setEquipmentList(eqRes.data.data);
      if (isAdmin) setEmployees(empRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, filterCat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.assigned_to) payload.assigned_to = null;

      if (editingId) {
        await api.put(`/equipment/${editingId}`, payload);
      } else {
        await api.post('/equipment', payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || 'Error occurred');
    }
  };

  const handleEdit = (eq) => {
    setFormData({
      name: eq.name,
      category: eq.category,
      serial_number: eq.serial_number,
      assigned_to: eq.assigned_to || '',
      status: eq.status
    });
    setEditingId(eq.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this hardware record?')) return;
    try {
      await api.delete(`/equipment/${id}`);
      fetchData();
    } catch (e) {
      alert('Error deleting equipment');
    }
  };

  const categories = ['All', 'Electronics', 'Furniture', 'Accessories'];

  const getStatusColor = (status) => {
    if (status === 'available') return 'bg-emerald-50 text-emerald-600 ring-emerald-500/20';
    if (status === 'in use') return 'bg-blue-50 text-blue-600 ring-blue-500/20';
    return 'bg-rose-50 text-rose-600 ring-rose-500/20';
  };

  const getCategoryIcon = (cat) => {
    if (cat === 'Electronics') return <Monitor size={28} className="text-indigo-500"/>;
    if (cat === 'Smartphone' || cat === 'Accessories') return <Smartphone size={28} className="text-pink-500"/>;
    return <Box size={28} className="text-amber-500"/>;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-gray-100/50">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Hardware Assets</h1>
          <p className="text-gray-500 mt-2 font-medium relative top-1">Track physical devices and assignments.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or S/N..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-72 bg-gray-50 border-0 outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-purple-500 rounded-full pl-12 pr-4 py-3 text-sm font-medium transition-all"
            />
          </div>
          
          {isAdmin && (
            <button onClick={() => { setFormData(initialForm); setEditingId(null); setIsModalOpen(true); }} 
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-full font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
              <Plus size={20} /> Add Asset
            </button>
          )}
        </div>
      </div>

      {/* Categories Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-2 text-gray-400 mr-2 font-medium text-sm">
          <Filter size={16} /> Category:
        </div>
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => setFilterCat(cat)}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all ${
              filterCat === cat 
                ? 'bg-gray-900 text-white shadow-md' 
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid Layout */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 font-medium">Scanning inventory blocks...</div>
      ) : equipmentList.length === 0 ? (
        <div className="text-center py-20 bg-white/50 border border-dashed border-gray-300 rounded-3xl">
          <div className="text-gray-400">No hardware found matching this criteria.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {equipmentList.map(eq => (
            <div key={eq.id} className="group bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-purple-200/50 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-gray-50 rounded-2xl group-hover:scale-110 group-hover:bg-purple-50 transition-all duration-300">
                  {getCategoryIcon(eq.category)}
                </div>
                <div className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase ring-1 ring-inset ${getStatusColor(eq.status)}`}>
                  {eq.status}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-extrabold text-xl text-gray-900 mb-1 leading-tight group-hover:text-purple-600 transition-colors">{eq.name}</h3>
                <div className="text-gray-400 text-sm font-medium">{eq.category}</div>
              </div>

              <div className="space-y-3 mb-6 bg-gray-50 block rounded-2xl p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 font-mono font-medium">
                  <Hash size={16} className="text-gray-400" />
                  <span className="truncate">{eq.serial_number}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <UserCheck size={16} className={eq.employee ? 'text-green-500' : 'text-gray-400'} />
                  {eq.employee ? (
                    <span className="font-bold text-gray-900 truncate">{eq.employee.user?.name}</span>
                  ) : (
                    <span className="text-gray-400 italic">Unassigned</span>
                  )}
                </div>
              </div>

              {isAdmin && (
                <div className="pt-2 flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(eq)} className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all">
                    <Edit2 size={16} /> Edit
                  </button>
                  <button onClick={() => handleDelete(eq.id)} className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 size={16} /> Disable
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal is fundamentally same style as employee modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 my-8 border border-white/20">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-8">{editingId ? 'Modify Assest' : 'Register Asset'}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Equipment Name</label>
                <input type="text" required className="w-full bg-gray-50 border-0 ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-purple-500 rounded-xl p-3 px-4 font-medium" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Category</label>
                  <select required className="w-full bg-gray-50 border-0 ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-purple-500 rounded-xl p-3 px-4 font-medium" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {categories.filter(c=>c!=='All').map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Tag / Serial Number</label>
                  <input type="text" required className="w-full bg-gray-50 border-0 ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-purple-500 rounded-xl p-3 px-4 font-medium font-mono" value={formData.serial_number} onChange={e => setFormData({...formData, serial_number: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Assigned Owner</label>
                <select className="w-full bg-gray-50 border-0 ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-purple-500 rounded-xl p-3 px-4 font-medium" value={formData.assigned_to} onChange={e => setFormData({...formData, assigned_to: e.target.value})}>
                  <option value="">-- Storage / Unassigned --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.user?.name} ({emp.department})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Current Integrity Status</label>
                <select className="w-full bg-gray-50 border-0 ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-purple-500 rounded-xl p-3 px-4 font-medium" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="available">Ready for Issue</option>
                  <option value="in use">Currently In Use</option>
                  <option value="maintenance">Pending Maintenance</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors">Discard</button>
                <button type="submit" className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-md hover:shadow-lg transition-all">{editingId ? 'Update Asset' : 'Log Asset'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
