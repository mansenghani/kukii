import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Utensils, Table as TableIcon, CalendarDays, ShoppingBag, Plus, Trash2, CheckCircle2, XCircle, X, Lock, Settings, LogOut, MessageSquare, BarChart, Layers, Tag, Pencil, AlertCircle, Clock, Eye, Star, Filter } from 'lucide-react';
import AdminFeedback from './AdminFeedback';
import ReportsPage from './ReportsPage';
import FooterSettingsCard from './FooterSettingsCard';
import FooterSettingsModal from './FooterSettingsModal';
import AdminEvents from './AdminEvents';
import AdminPreOrders from './AdminPreOrders';
import AdminHeader from './AdminHeader';
import AdminTimeSlots from './AdminTimeSlots';
import AdminSettings from './AdminSettings';
import AdminFeaturedMenu from './AdminFeaturedMenu';
import AdminBookings from './AdminBookings';
import Overview from './Overview';
import Pagination from '../../components/Pagination';

const AdminDashboard = () => {
  const { tab } = useParams();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(localStorage.getItem('kuki_admin_auth') === 'true');
  const [email, setEmail] = useState('admin@luxedining.com');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState(tab || 'overview');

  // Pagination & Filtering states
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [paginationData, setPaginationData] = useState({ totalPages: 1, totalRecords: 0, currentPage: 1 });
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
      setPage(1);
      setCategoryFilter('All');
    }
  }, [tab]);

  useEffect(() => {
    if (isAuthorized) {
      fetchAll();
    }
  }, [activeTab, page, categoryFilter, isAuthorized]);

  const handleTabChange = (newTab) => {
    navigate(`/admin/${newTab}`);
  };

  const [data, setData] = useState({
    bookings: [],
    menu: [],
    tables: [],
    preorders: [],
    categories: [],
    slots: []
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [submitting, setSubmitting] = useState(false);
  const [showFooterModal, setShowFooterModal] = useState(false);
  const [preorderStats, setPreorderStats] = useState({ summary: {}, popularItems: [] });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);


  const API_BASE_URL = '/api';

  useEffect(() => {
    const token = localStorage.getItem('kuki_admin_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [isAuthorized]);

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
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await axios.post('/api/admin/login', { email, password });
      localStorage.setItem('kuki_admin_auth', 'true');
      localStorage.setItem('kuki_admin_token', res.data.token);
      localStorage.setItem('kuki_admin_user', JSON.stringify(res.data));
      setIsAuthorized(true);
      setMessage({ text: 'Welcome Back, Admin', type: 'success' });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Login Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kuki_admin_auth');
    setIsAuthorized(false);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const endpoints = {
        bookings: `${API_BASE_URL}/bookings?page=${activeTab === 'bookings' ? page : 1}&limit=${activeTab === 'bookings' ? limit : 100}`,
        menu: `${API_BASE_URL}/menu?page=${activeTab === 'menu' ? page : 1}&limit=${activeTab === 'menu' ? limit : 100}${activeTab === 'menu' && categoryFilter !== 'All' ? `&category=${categoryFilter}` : ''}`,
        tables: `${API_BASE_URL}/tables?page=${activeTab === 'tables' ? page : 1}&limit=${activeTab === 'tables' ? limit : 100}`,
        categories: `${API_BASE_URL}/categories`,
        preorders: `${API_BASE_URL}/admin/preorders/all?page=1&limit=100`, // fetched for stats
        stats: `${API_BASE_URL}/admin/preorders/stats`,
        slots: `${API_BASE_URL}/admin/slots`
      };

      const results = await Promise.allSettled([
        axios.get(endpoints.bookings),
        axios.get(endpoints.menu),
        axios.get(endpoints.tables),
        axios.get(endpoints.preorders),
        axios.get(endpoints.categories),
        axios.get(endpoints.stats),
        axios.get(endpoints.slots)
      ]);

      const [bookings, menu, tables, preorders, categories, stats, slots] = results.map(r =>
        r.status === 'fulfilled' ? r.value : { data: [] }
      );

      if (results[5].status === 'fulfilled') {
        setPreorderStats(results[5].value.data);
      }

      let activeResultData = null;
      if (activeTab === 'bookings') activeResultData = bookings.data;
      else if (activeTab === 'menu') activeResultData = menu.data;
      else if (activeTab === 'tables') activeResultData = tables.data;

      if (['bookings', 'menu', 'tables'].includes(activeTab) && activeResultData) {
        setPaginationData({
          totalPages: activeResultData.totalPages || 1,
          totalRecords: activeResultData.totalRecords || 0,
          currentPage: activeResultData.currentPage || 1
        });
      }

      const newData = {
        bookings: Array.isArray(bookings.data) ? bookings.data : (bookings.data?.data || []),
        menu: Array.isArray(menu.data) ? menu.data : (menu.data?.data || []),
        tables: Array.isArray(tables.data) ? tables.data : (tables.data?.data || []),
        preorders: Array.isArray(preorders.data) ? preorders.data : (preorders.data?.data || []),
        categories: Array.isArray(categories.data) ? categories.data : (categories.data?.data || []),
        slots: Array.isArray(slots.data) ? slots.data : (slots.data?.data || [])
      };

      console.log("Fetched Data:", newData);
      setData(newData);

      // Check if any critical fetch failed
      if (results.some(r => r.status === 'rejected')) {
        const failedIndices = results.map((r, i) => r.status === 'rejected' ? i : null).filter(i => i !== null);
        console.warn("Some endpoints failed to fetch:", failedIndices);
      }
    } catch (err) {
      console.error("Critical Fetch Error:", err);
      setMessage({ text: 'Sync Error: Dashboard data could not be fully loaded', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let endpoint = activeTab;
      if (activeTab === 'overview') endpoint = 'tables';
      const validEndpoints = ['menu', 'categories', 'tables', 'bookings', 'preorders', 'feedback'];
      if (!validEndpoints.includes(endpoint)) endpoint = 'tables';

      const url = isEditing && editingId
        ? `${API_BASE_URL}/${endpoint}/${editingId}`
        : `${API_BASE_URL}/${endpoint}`;
      const method = isEditing ? 'put' : 'post';

      let finalFormData = { ...formData };

      if (activeTab === 'bookings' && !isEditing) {
        // 1. Create/Find Customer
        const customerRes = await axios.post(`${API_BASE_URL}/customers`, {
          name: formData.customerName,
          email: formData.customerEmail,
          phone: formData.customerPhone
        });
        const customerId = customerRes.data._id;

        // 2. Prepare Booking Data
        finalFormData = {
          customerId,
          tableId: formData.tableId,
          date: formData.date,
          time: formData.time,
          guests: parseInt(formData.guests) || 2
        };
      }

      let res;
      if (activeTab === 'menu') {
        const data = new FormData();
        Object.keys(finalFormData).forEach(key => {
          if (finalFormData[key] !== undefined && key !== 'image') {
            data.append(key, finalFormData[key]);
          }
        });
        if (imageFile) {
          data.append('image', imageFile);
        }
        res = await axios[method](url, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await axios[method](url, finalFormData);
      }

      const actionText = isEditing ? 'updated' : 'added';
      const typeText = activeTab === 'categories' ? 'Category' : (activeTab === 'menu' ? 'Menu' : activeTab.slice(0, -1));

      setMessage({ text: `${typeText} ${actionText} successfully!`, type: 'success' });
      setShowModal(false);
      setFormData({});
      setImageFile(null);
      setImagePreview(null);
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
    if (activeTab === 'menu') {
      setFormData({
        categoryId: item.categoryId?._id || item.categoryId,
        name: item.name,
        description: item.description,
        price: item.price,
        availability: item.availability,
        isAvailable: item.isAvailable !== undefined ? item.isAvailable : true
      });
      if (item.image) {
        setImagePreview(item.image.startsWith('http') ? item.image : (item.image.startsWith('/') ? item.image : `/${item.image}`));
      } else {
        setImagePreview(null);
      }
    } else if (activeTab === 'categories') {
      setFormData({ name: item.name, description: item.description });
    } else if (activeTab === 'tables') {
      setFormData({ tableNumber: item.tableNumber, capacity: item.capacity });
    } else if (activeTab === 'bookings') {
      setFormData({
        customerName: item.customerId?.name,
        customerEmail: item.customerId?.email,
        customerPhone: item.customerId?.phone,
        tableId: item.tableId?._id || item.tableId,
        date: item.date?.split('T')[0],
        time: item.time,
        guests: item.guests
      });
    }
    setShowModal(true);
  };

  const deleteMenuItem = async (id) => {
    if (window.confirm("Delete this menu item?")) { try { await axios.delete(`${API_BASE_URL}/menu/${id}`); fetchAll(); } catch (err) { alert("Failed"); } }
  };
  const deleteBooking = async (id) => {
    if (window.confirm("Remove booking?")) { try { await axios.delete(`${API_BASE_URL}/bookings/${id}`); fetchAll(); } catch (err) { alert("Failed"); } }
  };

  const handleBookingStatusUpdate = async (id, status) => {
    if (!window.confirm(`Mark reservation as ${status}?`)) return;
    try {
      setSubmitting(true);
      await axios.put(`${API_BASE_URL}/bookings/${id}`, { status });
      setMessage({ text: `Email sent and booking ${status} successfully!`, type: 'success' });
      setSelectedBooking(null);
      fetchAll();
    } catch (err) {
      console.error("Status Update Error:", err);
      setMessage({ text: 'Update Failed', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };
  const deleteTable = async (id) => {
    if (window.confirm("Delete this table?")) { try { await axios.delete(`${API_BASE_URL}/tables/${id}`); fetchAll(); setMessage({ text: 'Table deleted', type: 'success' }); } catch (err) { setMessage({ text: 'Delete failed', type: 'error' }); } }
  };
  const deleteCategory = async (id) => {
    if (window.confirm("Delete this category? Associated menu items will also be removed.")) {
      try { await axios.delete(`${API_BASE_URL}/categories/${id}`); fetchAll(); setMessage({ text: 'Category deleted', type: 'success' }); } catch (err) { setMessage({ text: 'Delete failed', type: 'error' }); }
    }
  };

  const totalDishes = data.menu.length;
  const pendingReservations = data.bookings.filter(b => b.status === "pending").length;

  if (!isAuthorized) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex justify-center items-center bg-background-ivory">
        <div className="bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-border-neutral rounded-[2rem] p-12 text-center w-[450px]">
          <div className="flex justify-center mb-6"><div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><Lock size={32} /></div></div>
          <h2 className="serif-heading text-4xl mb-2 text-charcoal italic lowercase">Admin Access</h2>
          <p className="text-soft-grey text-xs mb-10 font-bold uppercase tracking-widest opacity-60">Authentication Protocol Required</p>
          <form onSubmit={handleLogin} className="flex flex-col gap-5 text-left">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Email Identity</label>
              <input
                type="email" placeholder="admin@kuki.com" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-primary/10 rounded-xl p-4 text-sm focus:outline-none focus:border-primary transition-all bg-background-ivory/50 font-bold" required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Complexity Key</label>
              <input
                type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-primary/10 rounded-xl p-4 text-sm focus:outline-none focus:border-primary transition-all bg-background-ivory/50 font-bold" required
              />
            </div>
            <button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] transition-all shadow-lg mt-4">{submitting ? 'Verifying...' : 'Authorize'}</button>
          </form>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview onTabChange={handleTabChange} onFooterClick={() => setShowFooterModal(true)} />;
      case 'feedback': return <AdminFeedback />;
      case 'reports': return <ReportsPage onError={(msg) => setMessage({ text: msg, type: 'error' })} onSuccess={(msg) => setMessage({ text: msg, type: 'success' })} />;
      case 'events': return <AdminEvents onError={(msg) => setMessage({ text: msg, type: 'error' })} onSuccess={(msg) => setMessage({ text: msg, type: 'success' })} />;
      case 'preorders': return <AdminPreOrders onError={(msg) => setMessage({ text: msg, type: 'error' })} onSuccess={(msg) => setMessage({ text: msg, type: 'success' })} />;
      case 'timeslots': return <AdminTimeSlots onError={(msg) => setMessage({ text: msg, type: 'error' })} onSuccess={(msg) => setMessage({ text: msg, type: 'success' })} />;
      case 'settings': return <AdminSettings onError={(msg) => setMessage({ text: msg, type: 'error' })} onSuccess={(msg) => setMessage({ text: msg, type: 'success' })} />;
      case 'featured': return <AdminFeaturedMenu menuItems={data.menu} onError={(msg) => setMessage({ text: msg, type: 'error' })} onSuccess={(msg) => setMessage({ text: msg, type: 'success' })} />;
      case 'bookings': return <AdminBookings onError={(msg) => setMessage({ text: msg, type: 'error' })} onSuccess={(msg) => setMessage({ text: msg, type: 'success' })} />;

      default:
        return (
          <div className="animate-fade-in flex flex-col h-full">

            {loading ? (
              <div className="text-center py-20 text-soft-grey animate-pulse bg-white rounded-[2rem] border border-border-neutral">Synchronizing with server...</div>
            ) : (
              <>
                <div className="bg-white rounded-t-[2rem] shadow-sm border border-border-neutral overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-background-ivory/50 border-b border-border-neutral">
                      <tr>
                        <th className="p-5 text-[10px] uppercase tracking-widest text-soft-grey font-bold">
                          {activeTab === 'menu' ? 'Item / Category' : activeTab === 'categories' ? 'Category Details' : 'Info'}
                        </th>
                        <th className="p-5 text-[10px] uppercase tracking-widest text-soft-grey font-bold">
                          {activeTab === 'menu' ? 'Price' : activeTab === 'categories' ? 'Created' : 'Details'}
                        </th>
                        <th className="p-5 text-[10px] uppercase tracking-widest text-soft-grey font-bold">Status</th>
                        <th className="p-5 text-[10px] uppercase tracking-widest text-soft-grey font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-neutral">
                      {data[activeTab]?.map((item) => (
                        <tr key={item._id} className="hover:bg-primary/5 transition-colors">
                          <td className="p-5 text-sm">
                            {activeTab === 'menu' && (
                              <div className="flex items-center gap-3">
                                {item.image && <img src={item.image.startsWith('uploads') ? `/${item.image}` : item.image} alt="" className="w-10 h-10 rounded object-cover border border-border-neutral" />}
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
                              <button onClick={() => activeTab === 'menu' ? deleteMenuItem(item._id) : activeTab === 'categories' ? deleteCategory(item._id) : activeTab === 'tables' ? deleteTable(item._id) : deleteBooking(item._id)} className="p-2 hover:bg-rose-50 hover:text-rose-500 rounded-lg transition-all"><Trash2 size={18} /></button>

                            </div>
                          </td>
                        </tr>
                      ))}
                      {(!data[activeTab] || data[activeTab].length === 0) && (
                        <tr><td colSpan="4" className="p-20 text-center text-soft-grey italic text-sm">No data found in this category.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination UI for Main Tabs */}
                {['menu', 'tables', 'categories'].includes(activeTab) && (
                  <Pagination
                    currentPage={page}
                    totalPages={paginationData.totalPages}
                    totalRecords={paginationData.totalRecords}
                    limit={limit}
                    onPageChange={(newPage) => setPage(newPage)}
                  />
                )}
              </>
            )}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#f4efec] text-[#2b2b2b]">
      <AdminHeader activeTab={activeTab} />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[260px] flex-shrink-0 flex flex-col border-r border-[#e3dbd4] bg-[#f4efec] py-6 px-5 overflow-hidden">

          <nav className="flex flex-col gap-[2px]">
            <h5 className="text-[10px] font-bold text-soft-grey uppercase tracking-[0.2em] mb-2 pl-4">Main</h5>
            <SidebarLink icon={<LayoutDashboard size={18} />} label="Overview" active={activeTab === 'overview'} onClick={() => handleTabChange('overview')} />
            <SidebarLink icon={<CalendarDays size={18} />} label="Events" active={activeTab === 'events'} onClick={() => handleTabChange('events')} />
            <SidebarLink icon={<CalendarDays size={18} />} label="Bookings" active={activeTab === 'bookings'} onClick={() => handleTabChange('bookings')} />
            <SidebarLink icon={<ShoppingBag size={18} />} label="Pre-Orders" active={activeTab === 'preorders'} onClick={() => handleTabChange('preorders')} />
            <SidebarLink icon={<Utensils size={18} />} label="Menu" active={activeTab === 'menu'} onClick={() => handleTabChange('menu')} />
            <SidebarLink icon={<Star size={18} />} label="Showcase" active={activeTab === 'featured'} onClick={() => handleTabChange('featured')} />

            <SidebarLink icon={<Tag size={18} />} label="Categories" active={activeTab === 'categories'} onClick={() => handleTabChange('categories')} />
            <SidebarLink icon={<Clock size={18} />} label="Table Slots" active={activeTab === 'timeslots'} onClick={() => handleTabChange('timeslots')} />
            <SidebarLink icon={<TableIcon size={18} />} label="Tables" active={activeTab === 'tables'} onClick={() => handleTabChange('tables')} />
            <SidebarLink icon={<MessageSquare size={18} />} label="Feedback" active={activeTab === 'feedback'} onClick={() => handleTabChange('feedback')} />
            <SidebarLink icon={<BarChart size={18} />} label="Reports" active={activeTab === 'reports'} onClick={() => handleTabChange('reports')} />
            <SidebarLink icon={<Settings size={18} />} label="Settings" active={activeTab === 'settings'} onClick={() => handleTabChange('settings')} />
          </nav>
          <div className="mt-4 border-t border-primary/10 pt-4 mb-2">
            <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-primary hover:bg-primary/5 transition-colors font-medium text-sm"><LogOut size={18} /> Logout</button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto px-10 py-8 relative">
          {/* Header for dynamic actions */}
          {!['events', 'featured', 'feedback', 'bookings'].includes(activeTab) && (
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="serif-heading text-4xl text-charcoal capitalize">{activeTab}</h1>
                <p className="text-soft-grey text-sm mt-1">Manage {activeTab} section of the restaurant.</p>
              </div>

              {/* Dynamic Right Side Header Elements */}
              <div className="flex items-center gap-4">
                {activeTab === 'menu' && (
                  <div className="flex items-center gap-2 bg-white border border-primary/10 rounded-xl px-4 h-10 shadow-sm hover:border-primary/30 transition-all">
                    <Filter size={14} className="text-soft-grey" />
                    <select
                      value={categoryFilter}
                      onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                      className="bg-transparent bg-none border-none outline-none text-xs text-charcoal font-bold cursor-pointer appearance-none"
                    >
                      <option value="All">All Categories</option>
                      {data.categories?.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {['menu', 'categories', 'tables'].includes(activeTab) && (
                  <button onClick={() => { setFormData({}); setIsEditing(false); setShowModal(true); }} className="px-6 py-2.5 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-primary-hover transition-all flex items-center gap-2 shadow-sm"><Plus size={16} /> Add New</button>
                )}
                {activeTab === 'reports' && (
                  <div className="hidden md:flex flex-col items-end gap-1 text-right">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Status Overview</p>
                    <p className="text-xs text-soft-grey">Last Generated: <span className="font-semibold text-charcoal">{new Date().toLocaleString()}</span></p>
                  </div>
                )}
              </div>
            </div>
          )}

          {renderContent()}

          {/* Global Toast Message */}
          {message.text && (
            <div className={`fixed bottom-10 right-10 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl animate-fade-in border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
              {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <p className="font-bold text-sm tracking-wide">{message.text}</p>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {showModal && (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm flex justify-center items-center z-[1000] p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md relative p-8 border border-primary/10">
            <button onClick={() => { setShowModal(false); setFormData({}); setIsEditing(false); setImageFile(null); setImagePreview(null); }} className="absolute top-6 right-6 text-soft-grey hover:text-primary transition-colors"><X size={24} /></button>
            <h3 className="serif-heading text-2xl mb-6 text-charcoal">{isEditing ? 'Edit' : 'Add New'} {activeTab === 'categories' ? 'Category' : (activeTab === 'menu' ? 'Menu' : activeTab.slice(0, -1))}</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {activeTab === 'menu' && (
                <>
                  <select required value={formData.categoryId || ''} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} className="w-full border border-primary/10 rounded-xl p-3 text-sm focus:border-primary outline-none bg-background-ivory">
                    <option value="">Select Category</option>
                    {data.categories.map(cat => (<option key={cat._id} value={cat._id}>{cat.name}</option>))}
                  </select>
                  <input type="text" placeholder="Item Name" required value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border border-primary/10 rounded-xl p-3 text-sm focus:border-primary outline-none bg-background-ivory" />
                  <input type="number" placeholder="Price" required value={formData.price || ''} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full border border-primary/10 rounded-xl p-3 text-sm focus:border-primary outline-none bg-background-ivory" />
                  <textarea placeholder="Description" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full border border-primary/10 rounded-xl p-3 text-sm focus:border-primary outline-none bg-background-ivory h-24" />

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Menu Image</label>
                    <div className="flex items-center gap-4">
                      {imagePreview && (
                        <div className="w-20 h-20 rounded-xl overflow-hidden border border-primary/10 relative group">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-primary/10 rounded-xl p-4 hover:border-primary/30 transition-all cursor-pointer bg-background-ivory/50">
                        <Plus size={20} className="text-primary mb-1" />
                        <span className="text-[10px] font-bold text-soft-grey uppercase">{imageFile ? 'Change Image' : 'Upload Image'}</span>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={formData.availability} onChange={(e) => setFormData({ ...formData, availability: e.target.checked })} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal">Available</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={formData.isAvailable} onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-charcoal">Show in Menu</span>
                    </label>
                  </div>
                </>
              )}
              {activeTab === 'categories' && (
                <>
                  <input type="text" placeholder="Category Name" required value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border border-primary/10 rounded-xl p-3 text-sm focus:border-primary outline-none bg-background-ivory" />
                  <textarea placeholder="Description" value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full border border-primary/10 rounded-xl p-3 text-sm focus:border-primary outline-none bg-background-ivory h-24" />
                </>
              )}
              {activeTab === 'tables' && (
                <>
                  <input type="number" placeholder="Table Number" required value={formData.tableNumber || ''} onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })} className="w-full border border-primary/10 rounded-xl p-3 text-sm focus:border-primary outline-none bg-background-ivory" />
                  <input type="number" placeholder="Capacity" required value={formData.capacity || ''} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} className="w-full border border-primary/10 rounded-xl p-3 text-sm focus:border-primary outline-none bg-background-ivory" />
                </>
              )}
              {activeTab === 'bookings' && (
                <>
                  <div className="grid grid-cols-1 gap-4">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest border-b border-primary/10 pb-2">Customer Details</p>
                    <input type="text" placeholder="Customer Name" required value={formData.customerName || ''} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} className="w-full border border-primary/10 rounded-xl p-3 text-sm focus:border-primary outline-none bg-background-ivory" />
                    <input type="email" placeholder="Email Address" required value={formData.customerEmail || ''} onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })} className="w-full border border-primary/10 rounded-xl p-3 text-sm focus:border-primary outline-none bg-background-ivory" />
                    <input type="tel" placeholder="Phone Number" required value={formData.customerPhone || ''} onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })} className="w-full border border-primary/10 rounded-xl p-3 text-sm focus:border-primary outline-none bg-background-ivory" />

                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest border-b border-primary/10 pb-2 mt-2">Reservation Details</p>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="date" required value={formData.date || ''} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full border border-primary/10 rounded-xl p-3 text-sm focus:border-primary outline-none bg-background-ivory" />
                      <select required value={formData.time || ''} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="w-full border border-primary/10 rounded-xl p-3 text-sm focus:border-primary outline-none bg-background-ivory">
                        <option value="">Select Time</option>
                        {data.slots && data.slots.filter(s => s.isActive).length > 0 ? (
                          data.slots.filter(s => s.isActive).map(slot => (
                            <option key={slot._id} value={slot.time}>{slot.time}</option>
                          ))
                        ) : (
                          <>
                            <option value="10:00 AM">10:00 AM (Fallback)</option>
                            <option value="11:00 AM">11:00 AM (Fallback)</option>
                            <option value="12:00 PM">12:00 PM (Fallback)</option>
                            <option value="01:00 PM">01:00 PM (Fallback)</option>
                            <option value="02:00 PM">02:00 PM (Fallback)</option>
                            <option value="06:00 PM">06:00 PM (Fallback)</option>
                            <option value="07:00 PM">07:00 PM (Fallback)</option>
                            <option value="08:00 PM">08:00 PM (Fallback)</option>
                            <option value="09:00 PM">09:00 PM (Fallback)</option>
                            <option value="10:00 PM">10:00 PM (Fallback)</option>
                          </>
                        )}
                      </select>
                      {(!data.slots || data.slots.filter(s => s.isActive).length === 0) && (
                        <p className="text-[9px] text-primary italic mt-1">Note: Configure custom slots in the 'Table Slots' tab.</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <select required value={formData.tableId || ''} onChange={(e) => setFormData({ ...formData, tableId: e.target.value })} className="w-full border border-primary/10 rounded-xl p-3 text-sm focus:border-primary outline-none bg-background-ivory">
                        <option value="">Select Table</option>
                        {data.tables.map(table => (
                          <option key={table._id} value={table._id}>Table {table.tableNumber} (Cap: {table.capacity})</option>
                        ))}
                      </select>
                      <input type="number" placeholder="Guests" required value={formData.guests || ''} onChange={(e) => setFormData({ ...formData, guests: e.target.value })} className="w-full border border-primary/10 rounded-xl p-3 text-sm focus:border-primary outline-none bg-background-ivory" />
                    </div>
                  </div>
                </>
              )}
              <button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-md">{submitting ? 'Processing...' : (isEditing ? 'Update' : 'Create')}</button>
            </form>
          </div>
        </div>
      )}

      <FooterSettingsModal isOpen={showFooterModal} onClose={() => setShowFooterModal(false)} onSave={() => setMessage({ text: 'Footer updated!', type: 'success' })} />

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm flex justify-center items-center z-[2000] p-4 animate-fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden relative border border-primary/10">
            <div className="bg-background-ivory/50 px-10 py-8 border-b border-primary/10 flex justify-between items-start">
              <div className="pr-8">
                <h3 className="serif-heading text-3xl text-charcoal leading-tight mb-2">Reservation Info</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-current ${getStatusColorClass(selectedBooking.status)}`}>
                    {selectedBooking.status}
                  </span>
                  <span className="text-xs text-soft-grey font-medium">Customer ID: {selectedBooking.customerId?._id?.slice(-6)}</span>
                </div>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="absolute top-6 right-6 size-10 rounded-full hover:bg-white shadow-sm flex items-center justify-center text-soft-grey hover:text-primary transition-all border border-border-neutral">
                <X size={20} />
              </button>
            </div>

            <div className="px-10 py-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Customer</p>
                  <p className="font-bold text-charcoal">{selectedBooking.customerId?.name}</p>
                  <p className="text-xs text-soft-grey">{selectedBooking.customerId?.email}</p>
                  <p className="text-xs text-soft-grey">{selectedBooking.customerId?.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Table & Time</p>
                  <p className="font-bold text-charcoal">Table {selectedBooking.tableId?.tableNumber}</p>
                  <p className="text-sm font-medium text-charcoal">{selectedBooking.date?.split('T')[0]} @ {selectedBooking.time}</p>
                  <p className="text-xs text-soft-grey italic">{selectedBooking.guests} Guests</p>
                </div>
              </div>

              {selectedBooking.preOrderId && (
                <div className="space-y-4 pt-6 border-t border-border-neutral">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={18} className="text-primary" />
                    <h4 className="serif-heading text-xl text-charcoal">Pre-Ordered Meal</h4>
                    <span className={`ml-auto px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${selectedBooking.preOrderId.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                      {selectedBooking.preOrderId.status}
                    </span>
                  </div>
                  <div className="bg-background-ivory/50 rounded-xl overflow-hidden border border-border-neutral">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white/50 text-[9px] uppercase tracking-tighter text-soft-grey">
                        <tr>
                          <th className="p-3">Item</th>
                          <th className="p-3 text-center">Qty</th>
                          <th className="p-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-neutral/30">
                        {selectedBooking.preOrderId.items?.map((item, i) => (
                          <tr key={i}>
                            <td className="p-3 font-bold">{item.name}</td>
                            <td className="p-3 text-center">{item.quantity}</td>
                            <td className="p-3 text-right">₹{item.total}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-primary/5 font-black text-primary border-t border-primary/10">
                        <tr>
                          <td colSpan="2" className="p-3 text-right uppercase text-[9px]">Grand Total</td>
                          <td className="p-3 text-right text-sm font-bold">₹{selectedBooking.preOrderId.grandTotal}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="px-10 py-6 bg-background-ivory/30 flex justify-end gap-3 border-t border-primary/10">
              {selectedBooking.status === 'pending' && (
                <>
                  <button
                    disabled={submitting}
                    onClick={() => handleBookingStatusUpdate(selectedBooking._id, 'rejected')}
                    className="px-6 py-3 border border-rose-100 text-rose-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-50 transition-all flex items-center gap-2"
                  >
                    <XCircle size={14} /> Reject Booking
                  </button>
                  <button
                    disabled={submitting}
                    onClick={() => handleBookingStatusUpdate(selectedBooking._id, 'approved')}
                    className="px-6 py-3 bg-primary text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary-hover transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                  >
                    <CheckCircle2 size={14} /> Approve Booking
                  </button>
                </>
              )}
              <button onClick={() => setSelectedBooking(null)} className="px-6 py-3 bg-white border border-border-neutral text-charcoal rounded-xl text-xs font-bold uppercase tracking-widest transition-all">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SidebarLink = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium ${active ? 'bg-primary text-white shadow-md' : 'text-charcoal/70 hover:bg-white hover:text-charcoal'}`}>{icon} {label}</button>
);

const StatCard = ({ title, value, icon, trend }) => (
  <div className="bg-white rounded-xl border border-primary/5 flex items-center justify-between p-8 shadow-sm hover:-translate-y-1 transition-transform">
    <div>
      <p className="text-soft-grey font-bold text-[10px] uppercase tracking-widest">{title}</p>
      <h3 className="serif-heading text-4xl font-bold mt-1 text-charcoal">{value}</h3>
      <div className="flex items-center gap-1 mt-2 text-xs font-bold text-primary"><span>{trend}</span></div>
    </div>
    <div className="size-14 bg-primary/10 rounded-full flex items-center justify-center text-primary"><span className="material-symbols-outlined text-3xl">{icon}</span></div>
  </div>
);

const ModuleCard = ({ title, desc, icon, onClick }) => (
  <div onClick={onClick} className="group bg-white p-8 rounded-[2rem] shadow-sm border border-primary/5 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 cursor-pointer flex flex-col items-center text-center relative overflow-hidden">
    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[4rem]"></div>
    <div className="mb-6 relative">
      <div className="size-16 bg-background-ivory rounded-2xl flex items-center justify-center text-primary border border-primary/10 group-hover:scale-110 transition-all">{icon}</div>
    </div>
    <h3 className="serif-heading text-2xl text-charcoal mb-3">{title}</h3>
    <p className="text-xs text-soft-grey leading-relaxed mb-8 max-w-[240px] font-medium">{desc}</p>
    <button className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 group-hover:gap-3 transition-all">Explore <span>&rarr;</span></button>
  </div>
);

const getStatusColorClass = (status) => {
  switch (status) {
    case 'pending': return 'text-orange-600 border-orange-200 bg-orange-50';
    case 'approved': return 'text-green-600 border-green-200 bg-green-50';
    case 'rejected': return 'text-rose-600 border-rose-200 bg-rose-50';
    default: return 'text-primary border-primary/10 bg-primary/5';
  }
};

export default AdminDashboard;
