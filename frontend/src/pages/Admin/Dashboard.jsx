import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LayoutDashboard, Utensils, Table as TableIcon, CalendarDays, ShoppingBag, Plus, Trash2, CheckCircle2, XCircle, X, Lock, Settings, LogOut, MessageSquare, BarChart, Layers, Tag, Pencil, AlertCircle } from 'lucide-react';
import AdminFeedback from './AdminFeedback';
import ReportsPage from './ReportsPage';
import FooterSettingsCard from './FooterSettingsCard';
import FooterSettingsModal from './FooterSettingsModal';

const AdminDashboard = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState({
    bookings: [],
    menu: [],
    tables: [],
    preorders: [],
    categories: []
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showFooterModal, setShowFooterModal] = useState(false);

  // API Configuration - Hardcoded to localhost:5050 for simplicity as per project structure
  const API_BASE_URL = 'http://localhost:5050/api';

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: '', type: '' }), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    const authStatus = localStorage.getItem('kuki_admin_auth');
    if (authStatus === 'true') {
      setIsAuthorized(true);
      fetchAll();
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') {
      localStorage.setItem('kuki_admin_auth', 'true');
      setIsAuthorized(true);
      fetchAll();
    } else {
      alert("Invalid Admin Password");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kuki_admin_auth');
    setIsAuthorized(false);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bookings, menu, tables, preorders, categories] = await Promise.all([
        axios.get(`${API_BASE_URL}/bookings`),
        axios.get(`${API_BASE_URL}/menu`),
        axios.get(`${API_BASE_URL}/tables`),
        axios.get(`${API_BASE_URL}/preorders`),
        axios.get(`${API_BASE_URL}/categories`)
      ]);
      setData({
        bookings: bookings.data || [],
        menu: menu.data || [],
        tables: tables.data || [],
        preorders: preorders.data || [],
        categories: categories.data || []
      });
    } catch (err) {
      console.error("Fetch Error:", err);
      setMessage({ text: 'Sync Error: Check if backend is running on port 5050', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Determine correct endpoint based on active tab
      let endpoint = activeTab;

      // Fallback/Correction logic for endpoints
      if (activeTab === 'overview') endpoint = 'tables'; // Should not happen but safe check

      // Verify endpoint is pluralized as per requirement (except menu)
      const validEndpoints = ['menu', 'categories', 'tables', 'bookings', 'preorders', 'feedback'];
      if (!validEndpoints.includes(endpoint)) {
        endpoint = 'tables';
      }

      const url = isEditing && editingId
        ? `${API_BASE_URL}/${endpoint}/${editingId}`
        : `${API_BASE_URL}/${endpoint}`;

      const method = isEditing ? 'put' : 'post';

      await axios[method](url, formData);

      const actionText = isEditing ? 'updated' : 'added';
      const typeText = activeTab === 'categories' ? 'Category' : activeTab.slice(0, -1);

      setMessage({ text: `${typeText} ${actionText} successfully!`, type: 'success' });
      setShowModal(false);
      setFormData({});
      setIsEditing(false);
      setEditingId(null);
      fetchAll();
    } catch (err) {
      console.error("Submit Error:", err);
      const errorMsg = err.response?.data?.message || err.message;
      setMessage({ text: `Failed: ${errorMsg}`, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setIsEditing(true);
    setEditingId(item._id);

    // Map data to form based on type
    if (activeTab === 'menu') {
      setFormData({
        categoryId: item.categoryId?._id || item.categoryId,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        availability: item.availability
      });
    } else if (activeTab === 'categories') {
      setFormData({
        name: item.name,
        description: item.description
      });
    } else if (activeTab === 'tables') {
      setFormData({
        tableNumber: item.tableNumber,
        capacity: item.capacity
      });
    }
    setShowModal(true);
  };

  // Backend Handlers
  const updateBookingStatus = async (id, status) => {
    try { await axios.put(`${API_BASE_URL}/bookings/${id}`, { status }); fetchAll(); } catch (err) { alert("Failed"); }
  };
  const updatePreOrderStatus = async (id, status) => {
    try { await axios.put(`${API_BASE_URL}/preorders/${id}`, { status }); fetchAll(); } catch (err) { alert("Failed"); }
  };
  const deleteMenuItem = async (id) => {
    if (window.confirm("Delete this menu item?")) { try { await axios.delete(`${API_BASE_URL}/menu/${id}`); fetchAll(); } catch (err) { alert("Failed"); } }
  };
  const deleteBooking = async (id) => {
    if (window.confirm("Remove booking?")) { try { await axios.delete(`${API_BASE_URL}/bookings/${id}`); fetchAll(); } catch (err) { alert("Failed"); } }
  };
  const deleteTable = async (id) => {
    if (window.confirm("Delete this table?")) { try { await axios.delete(`${API_BASE_URL}/tables/${id}`); fetchAll(); setMessage({ text: 'Table deleted', type: 'success' }); } catch (err) { setMessage({ text: 'Delete failed', type: 'error' }); } }
  };
  const deleteCategory = async (id) => {
    if (window.confirm("Delete this category? Associated menu items will also be removed.")) {
      try {
        await axios.delete(`${API_BASE_URL}/categories/${id}`);
        fetchAll();
        setMessage({ text: 'Category deleted', type: 'success' });
      } catch (err) {
        setMessage({ text: 'Delete failed', type: 'error' });
      }
    }
  };

  // Stats
  const totalDishes = data.menu.length;
  const pendingReservations = data.bookings.filter(b => b.status === "Pending").length;

  if (!isAuthorized) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex justify-center items-center bg-background-ivory">
        <div className="bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-border-neutral rounded-xl p-10 text-center w-[400px]">
          <div className="flex justify-center mb-6">
            <Lock size={48} className="text-primary" />
          </div>
          <h2 className="serif-heading text-3xl mb-2 text-charcoal">Admin Access</h2>
          <p className="text-soft-grey text-sm mb-8">Please enter the administrator password to manage KUKI.</p>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-border-neutral rounded-sm p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-background-ivory"
              required
            />
            <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-sm font-bold uppercase tracking-widest text-xs transition-colors">
              Unlock Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f4efec] text-[#2b2b2b]">
      {/* Sidebar */}
      <aside className="w-[260px] flex-shrink-0 flex flex-col border-r border-[#e3dbd4] bg-[#f4efec] py-8 px-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            <Layers size={22} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="serif-heading text-xl leading-none text-charcoal tracking-widest">KUKI</h2>
            <p className="text-[8px] uppercase tracking-widest text-[#c68991] font-bold mt-1">Rose Edition</p>
            <p className="text-[8px] uppercase tracking-widest text-soft-grey font-bold">Admin</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarLink icon={<LayoutDashboard size={18} />} label="Dashboard" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <SidebarLink icon={<Utensils size={18} />} label="Menu Management" active={activeTab === 'menu'} onClick={() => setActiveTab('menu')} />
          <SidebarLink icon={<Tag size={18} />} label="Menu Categories" active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} />
          <SidebarLink icon={<CalendarDays size={18} />} label="Reservations" active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} />
          <SidebarLink icon={<MessageSquare size={18} />} label="Feedback" active={activeTab === 'feedback'} onClick={() => setActiveTab('feedback')} />
          <SidebarLink icon={<BarChart size={18} />} label="Reports" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
          <SidebarLink icon={<TableIcon size={18} />} label="Table Slots" active={activeTab === 'tables'} onClick={() => setActiveTab('tables')} />
        </nav>

        <div className="mt-8 border-t border-primary/10 pt-8">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-primary hover:bg-primary/5 transition-colors font-medium text-sm">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-10 py-8 scroll-smooth">
        <header className="flex justify-between items-start mb-10">
          <div>
            <div className="text-[10px] font-bold tracking-[0.2em] text-[#a89d96] mb-2 uppercase">ADMIN / {activeTab}</div>
            <h1 className="serif-heading text-4xl text-charcoal">Admin Dashboard</h1>
            <p className="text-soft-grey mt-1 text-sm">Manage your restaurant operations from one place.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => { setActiveTab('categories'); setFormData({}); setIsEditing(false); setShowModal(true); }}
                className="px-4 py-2 border border-primary/20 text-primary bg-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-primary/5 transition-all flex items-center gap-2"
              >
                <Tag size={14} /> Category
              </button>
              <button
                onClick={() => { setActiveTab('menu'); setFormData({ availability: true }); setIsEditing(false); setShowModal(true); }}
                className="px-4 py-2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-primary-hover transition-all flex items-center gap-2 shadow-sm"
              >
                <Plus size={14} /> Menu Item
              </button>
            </div>
          </div>
        </header>

        {/* Global Toast Message */}
        {message.text && (
          <div className={`fixed top-10 right-10 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl animate-fade-in border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <p className="font-bold text-sm tracking-wide">{message.text}</p>
          </div>
        )}

        {activeTab === 'overview' ? (
          <div className="animate-fade-in">
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <StatCard title="Total Dishes" value={totalDishes} icon="restaurant" trend="+2% this week" />
              <StatCard title="Pending Bookings" value={pendingReservations} icon="event_seat" trend="Requires attention" />
              <StatCard title="Customer Reviews" value="08" icon="rate_review" trend="Avg 4.9 stars" />
            </section>

            <h4 className="serif-heading font-bold text-charcoal mb-6 text-2xl">Quick Access</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              <ModuleCard title="Manage Categories" desc="Organize your menu with custom categories." icon={<Tag />} onClick={() => setActiveTab('categories')} />
              <ModuleCard title="Manage Menu" desc="Update your dishes, prices and availability." icon={<Utensils />} onClick={() => setActiveTab('menu')} />
              <ModuleCard title="Reservations" desc="Approve or manage customer table bookings." icon={<CalendarDays />} onClick={() => setActiveTab('bookings')} />
              <FooterSettingsCard onClick={() => setShowFooterModal(true)} />
            </div>
          </div>
        ) : activeTab === 'feedback' ? (
          <AdminFeedback />
        ) : activeTab === 'reports' ? (
          <ReportsPage />
        ) : (
          <div className="animate-fade-in">
            {loading ? (
              <div className="text-center py-20 text-soft-grey animate-pulse">Synchronizing with server...</div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-border-neutral overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-background-ivory/50 border-b border-border-neutral">
                    <tr>
                      <th className="p-5 text-[10px] uppercase tracking-widest text-[#a89d96] font-bold">
                        {activeTab === 'menu' ? 'Item / Category' : activeTab === 'categories' ? 'Category Details' : 'Info'}
                      </th>
                      <th className="p-5 text-[10px] uppercase tracking-widest text-[#a89d96] font-bold">
                        {activeTab === 'menu' ? 'Price' : activeTab === 'categories' ? 'Created' : 'Details'}
                      </th>
                      <th className="p-5 text-[10px] uppercase tracking-widest text-[#a89d96] font-bold">Status</th>
                      <th className="p-5 text-[10px] uppercase tracking-widest text-[#a89d96] font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-neutral">
                    {data[activeTab]?.map((item) => (
                      <tr key={item._id} className="hover:bg-primary/5 transition-colors">
                        <td className="p-5 text-sm">
                          {activeTab === 'menu' && (
                            <div className="flex items-center gap-3">
                              {item.image && <img src={item.image} alt="" className="w-10 h-10 rounded object-cover border border-border-neutral" />}
                              <div>
                                <span className="font-bold text-charcoal">{item.name}</span> <br />
                                <span className="text-primary text-[10px] font-bold uppercase tracking-widest">{item.categoryId?.name || 'Standard'}</span>
                              </div>
                            </div>
                          )}
                          {activeTab === 'categories' && <div><span className="font-bold text-charcoal">{item.name}</span> <br /> <span className="text-soft-grey text-xs line-clamp-1">{item.description}</span></div>}
                          {activeTab === 'bookings' && <div><span className="font-bold text-charcoal">Table {item.tableId?.tableNumber}</span> <br /> <span className="text-soft-grey text-xs">{item.date?.split('T')[0]} @ {item.time}</span></div>}
                          {activeTab === 'tables' && <div><span className="font-bold text-charcoal">Table {item.tableNumber}</span> <br /> <span className="text-soft-grey text-xs">Cap: {item.capacity}</span></div>}
                        </td>
                        <td className="p-5 text-sm">
                          {activeTab === 'menu' && <div className="font-bold text-primary">₹{item.price}</div>}
                          {activeTab === 'categories' && <div className="text-soft-grey italic">{new Date(item.createdAt).toLocaleDateString()}</div>}
                          {activeTab === 'bookings' && <div>{item.customerId?.name} <br /> <span className="text-soft-grey text-[10px]">{item.customerId?.phone}</span></div>}
                          {activeTab === 'tables' && <div>{item.capacity} Persons</div>}
                        </td>
                        <td className="p-5 text-sm">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-current ${activeTab === 'menu' ? (item.availability ? 'text-green-600 border-green-200 bg-green-50' : 'text-red-600 border-red-200 bg-red-50') : getStatusColorClass(item.status)}`}>
                            {activeTab === 'menu' ? (item.availability ? 'Available' : 'Out of Stock') : (item.status || 'Active')}
                          </span>
                        </td>
                        <td className="p-5">
                          <div className="flex gap-2 text-soft-grey">
                            {['menu', 'categories', 'tables'].includes(activeTab) && (
                              <button onClick={() => handleEdit(item)} className="p-2 hover:bg-primary/10 hover:text-primary rounded-lg transition-all"><Pencil size={18} /></button>
                            )}
                            <button
                              onClick={() => activeTab === 'menu' ? deleteMenuItem(item._id) : activeTab === 'categories' ? deleteCategory(item._id) : activeTab === 'tables' ? deleteTable(item._id) : deleteBooking(item._id)}
                              className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(!data[activeTab] || data[activeTab].length === 0) && (
                      <tr>
                        <td colSpan="4" className="p-20 text-center text-soft-grey italic text-sm">No data found in this category.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm flex justify-center items-center z-[1000] p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative p-8">
            <button onClick={() => { setShowModal(false); setFormData({}); setIsEditing(false); }} className="absolute top-6 right-6 text-soft-grey hover:text-primary transition-colors"><X size={24} /></button>
            <h3 className="serif-heading text-2xl mb-6 text-charcoal">{isEditing ? 'Edit' : 'Add New'} {activeTab === 'categories' ? 'Category' : activeTab.slice(0, -1)}</h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {activeTab === 'menu' ? (
                <>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#a89d96] mb-2 block">Category</label>
                    <select required value={formData.categoryId || ''} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} className="w-full border border-border-neutral rounded-lg p-3 text-sm focus:border-primary transition-all bg-background-ivory">
                      <option value="">Select Category</option>
                      {data.categories.map(cat => (<option key={cat._id} value={cat._id}>{cat.name}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#a89d96] mb-2 block">Item Name</label>
                    <input type="text" required value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border border-border-neutral rounded-lg p-3 text-sm focus:border-primary transition-all bg-background-ivory" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#a89d96] mb-2 block">Price (₹)</label>
                      <input type="number" required value={formData.price || ''} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full border border-border-neutral rounded-lg p-3 text-sm focus:border-primary transition-all bg-background-ivory" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#a89d96] mb-2 block">Image URL</label>
                      <input type="text" value={formData.image || ''} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className="w-full border border-border-neutral rounded-lg p-3 text-sm focus:border-primary transition-all bg-background-ivory" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#a89d96] mb-2 block">Description</label>
                    <textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full border border-border-neutral rounded-lg p-3 text-sm focus:border-primary transition-all bg-background-ivory h-24 resize-none" />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer p-3 bg-background-ivory rounded-lg border border-border-neutral">
                    <input type="checkbox" checked={formData.availability} onChange={(e) => setFormData({ ...formData, availability: e.target.checked })} className="size-4 accent-primary" />
                    <span className="text-xs text-charcoal font-bold uppercase tracking-widest">In Stock / Available</span>
                  </label>
                </>
              ) : activeTab === 'categories' ? (
                <>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#a89d96] mb-2 block">Category Name</label>
                    <input type="text" required value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border border-border-neutral rounded-lg p-3 text-sm focus:border-primary transition-all bg-background-ivory" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#a89d96] mb-2 block">Description</label>
                    <textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full border border-border-neutral rounded-lg p-3 text-sm focus:border-primary transition-all bg-background-ivory h-24 resize-none" />
                  </div>
                </>
              ) : (
                <>
                  <input type="number" placeholder="Table Number" required value={formData.tableNumber || ''} onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })} className="w-full border border-border-neutral rounded-lg p-3 text-sm focus:border-primary transition-all bg-background-ivory" />
                  <input type="number" placeholder="Capacity" required value={formData.capacity || ''} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} className="w-full border border-border-neutral rounded-lg p-3 text-sm focus:border-primary transition-all bg-background-ivory" />
                </>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-4 bg-primary hover:bg-primary-hover text-white py-4 rounded-lg font-bold uppercase tracking-[0.2em] text-xs transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Processing...' : (isEditing ? 'Update ' : 'Create ') + (activeTab === 'categories' ? 'Category' : activeTab.slice(0, -1))}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer Settings Modal */}
      <FooterSettingsModal
        isOpen={showFooterModal}
        onClose={() => setShowFooterModal(false)}
        onSave={() => setMessage({ text: 'Footer settings updated successfully!', type: 'success' })}
      />
    </div>
  );
};

const SidebarLink = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium ${active ? 'bg-[#c68991] text-white shadow-md shadow-primary/20' : 'text-charcoal/70 hover:bg-white hover:text-charcoal'}`}>
    {icon} {label}
  </button>
);

const StatCard = ({ title, value, icon, trend }) => (
  <div className="bg-white rounded-xl border border-primary/5 flex items-center justify-between p-8 shadow-sm hover:-translate-y-1 transition-transform">
    <div>
      <p className="text-soft-grey font-bold text-[10px] uppercase tracking-widest opacity-70">{title}</p>
      <h3 className="serif-heading text-4xl font-bold mt-1 text-charcoal">{value}</h3>
      <div className={`flex items-center gap-1 mt-2 text-xs font-bold ${trend.includes('+') ? 'text-green-500' : 'text-primary'}`}>
        <span className="material-symbols-outlined text-sm">{trend.includes('+') ? 'trending_up' : 'info'}</span>
        <span>{trend}</span>
      </div>
    </div>
    <div className="size-14 bg-primary/10 rounded-full flex items-center justify-center text-primary">
      <span className="material-symbols-outlined text-3xl">{icon}</span>
    </div>
  </div>
);

const ModuleCard = ({ title, desc, icon, onClick }) => (
  <div
    onClick={onClick}
    className="group bg-white p-8 rounded-[2.5rem] shadow-sm border border-primary/5 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 cursor-pointer flex flex-col items-center text-center relative overflow-hidden"
  >
    {/* Soft decorative background element */}
    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[4rem] group-hover:w-32 group-hover:h-32 transition-all"></div>

    <div className="mb-6 relative">
      <div className="size-16 bg-background-ivory rounded-2xl flex items-center justify-center text-primary border border-primary/10 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all">
        <span className="text-3xl flex items-center justify-center">{icon}</span>
      </div>
      <div className="absolute -bottom-1 -right-1 size-4 bg-emerald-500 rounded-full border-4 border-white"></div>
    </div>

    <h3 className="serif-heading text-2xl text-charcoal mb-3">
      {title}
    </h3>

    <p className="text-xs text-soft-grey leading-relaxed mb-8 max-w-[240px] font-medium">
      {desc}
    </p>

    <button className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 group-hover:gap-3 transition-all py-2 px-4 rounded-full hover:bg-primary/5 mt-auto">
      Explore <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
    </button>
  </div>
);

const getStatusColorClass = (status) => {
  switch (status) {
    case 'Pending': return 'text-orange-600 border-orange-200 bg-orange-50';
    case 'Confirmed': return 'text-green-600 border-green-200 bg-green-50';
    case 'Cancelled': return 'text-red-600 border-red-200 bg-red-50';
    case 'Preparing': return 'text-blue-600 border-blue-200 bg-blue-50';
    case 'Ready': return 'text-purple-600 border-purple-200 bg-purple-50';
    default: return 'text-primary border-primary/20 bg-primary/5';
  }
};

export default AdminDashboard;
