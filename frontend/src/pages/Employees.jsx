import React, { useState, useEffect } from 'react';
import api from '../lib/axios';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit2, Trash2, Search, Filter, Mail, Phone, Briefcase, Calendar } from 'lucide-react';

export default function Employees() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const initialForm = {
    name: '', email: '', password: '', phone: '', department: 'IT', position: 'Developer', hire_date: '', status: 'active'
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees', {
        params: {
          search: searchQuery || undefined,
          department: filterDept !== 'All' ? filterDept : undefined
        }
      });
      setEmployees(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    const delayDebounceFn = setTimeout(() => {
      fetchEmployees();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, filterDept, isAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/employees/${editingId}`, formData);
      } else {
        await api.post('/employees', formData);
      }
      setIsModalOpen(false);
      if (!isAdmin) {
        window.location.reload(); // Refresh Auth User data
      } else {
        fetchEmployees();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Error occurred');
    }
  };

  const handleEdit = (emp) => {
    setFormData({
      name: emp.user.name,
      email: emp.user.email,
      password: '',
      phone: emp.phone || '',
      department: emp.department,
      position: emp.position,
      hire_date: emp.hire_date,
      status: emp.status
    });
    setEditingId(emp.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this employee?')) return;
    try {
      await api.delete(`/employees/${id}`);
      fetchEmployees();
    } catch (e) {
      alert('Error deleting employee');
    }
  };

  const departments = ['All', 'IT', 'HR', 'Engineering', 'Sales'];

  if (!isAdmin) {
    const emp = user?.employee;
    if (!emp) return <div className="p-8 text-center text-gray-500">No profile found.</div>;
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-gray-100/50">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Profile</h1>
          <p className="text-gray-500 mt-2 font-medium">Manage your personal information.</p>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-start">
          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name)}&background=random&color=fff&size=200`} className="rounded-2xl shadow-md ring-4 ring-gray-50 w-32 h-32 md:w-48 md:h-48" />
          <div className="flex-1 space-y-4">
            <h2 className="text-2xl font-bold">{user?.name}</h2>
            <div className="text-gray-500 font-medium bg-gray-50 inline-block px-3 py-1 rounded-lg">{emp.position} - {emp.department}</div>
            <div className="pt-4 space-y-3 text-sm text-gray-600">
               <div className="flex items-center gap-2"><Mail size={18} className="text-gray-400"/> {user?.email}</div>
               <div className="flex items-center gap-2"><Phone size={18} className="text-gray-400"/> {emp.phone || 'No phone recorded'}</div>
               <div className="flex items-center gap-2"><Calendar size={18} className="text-gray-400"/> Hired: {new Date(emp.hire_date).toDateString()}</div>
            </div>
            <div className="pt-6">
              <button 
                onClick={() => {
                  setFormData({
                    name: user.name, email: user.email, password: '', phone: emp.phone||'', department: emp.department, position: emp.position, hire_date: emp.hire_date, status: emp.status
                  });
                  setEditingId(emp.id);
                  setIsModalOpen(true);
                }}
                className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black hover:shadow-lg transition-all"
              >
                Edit Mobile & Name
              </button>
            </div>
          </div>
        </div>
        
        {/* Profile Editor Modal */}
        {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 my-8 border border-white/20">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Update Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
                  <input type="text" required className="w-full bg-gray-50 border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-primary rounded-xl p-3" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
               </div>
               <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Mobile Phone</label>
                  <input type="text" className="w-full bg-gray-50 border-0 ring-1 ring-gray-200 focus:ring-2 focus:ring-primary rounded-xl p-3" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
               </div>
               <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                 <button type="submit" className="px-6 py-3 font-bold bg-gray-900 text-white rounded-xl hover:bg-black hover:shadow-md transition-all">Save Changes</button>
               </div>
            </form>
           </div>
        </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-gray-100/50">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Team Directory</h1>
          <p className="text-gray-500 mt-2 font-medium relative top-1">Manage all organization members and profiles.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-72 bg-gray-50 border-0 outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-primary rounded-full pl-12 pr-4 py-3 text-sm font-medium transition-all"
            />
          </div>
          
          {isAdmin && (
            <button onClick={() => { setFormData(initialForm); setEditingId(null); setIsModalOpen(true); }} 
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-hover hover:to-indigo-700 text-white px-6 py-3 rounded-full font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
              <Plus size={20} /> Add Member
            </button>
          )}
        </div>
      </div>

      {/* Tabs / Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-2 text-gray-400 mr-2 font-medium text-sm">
          <Filter size={16} /> Filter:
        </div>
        {departments.map(dept => (
          <button 
            key={dept} 
            onClick={() => setFilterDept(dept)}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-all ${
              filterDept === dept 
                ? 'bg-gray-900 text-white shadow-md' 
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Modern List View */}
      {loading ? (
        <div className="text-center py-20 text-gray-400 font-medium">Loading roster...</div>
      ) : employees.length === 0 ? (
        <div className="text-center py-20 bg-white/50 border border-dashed border-gray-300 rounded-3xl">
          <div className="text-gray-400 mb-2">No employees match this criteria</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {employees.map(emp => (
            <div key={emp.id} className="group bg-white hover:bg-gray-50/50 p-5 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              <div className="flex items-center gap-5 flex-1 w-full max-w-sm">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(emp.user?.name)}&background=random&color=fff&size=128&bold=true`} 
                  alt={emp.user?.name}
                  className="w-14 h-14 rounded-full shadow-sm ring-2 ring-gray-100 group-hover:ring-primary/20 transition-all"
                />
                <div>
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">{emp.user?.name}</h3>
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                    <Briefcase size={14} /> {emp.position}
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-[200px] flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={16} className="text-gray-400" /> {emp.user?.email}
                </div>
                {emp.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={16} className="text-gray-400" /> {emp.phone}
                  </div>
                )}
              </div>

              <div className="hidden lg:flex flex-col gap-2 min-w-[150px]">
                <div className="text-sm font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-md w-max">
                  {emp.department}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                  <Calendar size={14} /> Hired {new Date(emp.hire_date).getFullYear()}
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 min-w-[140px]">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  emp.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {emp.status}
                </span>

                {isAdmin && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(emp)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(emp.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 my-8 border border-white/20">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-8">{editingId ? 'Edit Profile' : 'Add New Member'}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
                  <input type="text" required className="w-full bg-gray-50 border-0 ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-primary rounded-xl p-3 px-4 font-medium" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
                  <input type="email" required className="w-full bg-gray-50 border-0 ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-primary rounded-xl p-3 px-4 font-medium" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Password {editingId && <span className="text-xs font-normal text-gray-400">(Optional)</span>}</label>
                  <input type="password" required={!editingId} className="w-full bg-gray-50 border-0 ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-primary rounded-xl p-3 px-4 font-medium" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone</label>
                  <input type="text" className="w-full bg-gray-50 border-0 ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-primary rounded-xl p-3 px-4 font-medium" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Department</label>
                  <select required className="w-full bg-gray-50 border-0 ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-primary rounded-xl p-3 px-4 font-medium" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                     {departments.filter(d=>d!=='All').map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Job Position</label>
                  <input type="text" required className="w-full bg-gray-50 border-0 ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-primary rounded-xl p-3 px-4 font-medium" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Hire Date</label>
                  <input type="date" required className="w-full bg-gray-50 border-0 ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-primary rounded-xl p-3 px-4 font-medium" value={formData.hire_date} onChange={e => setFormData({...formData, hire_date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Account Status</label>
                  <select className="w-full bg-gray-50 border-0 ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-primary rounded-xl p-3 px-4 font-medium text-gray-900" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black hover:shadow-lg transition-all">{editingId ? 'Save Changes' : 'Create Member'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
