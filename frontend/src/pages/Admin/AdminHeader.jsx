import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Bell, User, Check, X, Clock, User2, MapPin, Calendar, Info, Menu as MenuIcon } from 'lucide-react';
import axios from 'axios';

const AdminHeader = ({ activeTab, onToggleSidebar }) => {
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const notificationRef = useRef(null);

    const token = localStorage.getItem('kuki_admin_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/admin/notifications', config);
            setNotifications(res.data);
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchNotifications();
            // Optional: Set up interval for real-time-ish updates
            const interval = setInterval(fetchNotifications, 30000); // 30s
            return () => clearInterval(interval);
        }
    }, [token]);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAction = async (id, model, status) => {
        try {
            await axios.put('/api/admin/notifications/status', { id, model, status }, config);
            // Instant UI update
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (err) {
            console.error(`Failed to ${status} notification:`, err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('kuki_admin_auth');
        localStorage.removeItem('kuki_admin_token');
        localStorage.removeItem('kuki_admin_user');
        window.location.href = '/admin'; // Force reload to login state
    };

    return (
        <header className="h-20 bg-white border-b border-primary/10 px-4 md:px-8 flex justify-between items-center sticky top-0 z-[60]">
            <div className="flex items-center gap-4 md:gap-8">
                <button 
                  onClick={onToggleSidebar}
                  className="lg:hidden p-2 rounded-xl bg-background-ivory/50 border border-primary/5 text-soft-grey hover:text-primary transition-all"
                >
                    <MenuIcon size={22} />
                </button>

                <Link to="/admin/overview" className="flex items-center gap-3">
                    <div className="size-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        <LayoutDashboard size={20} strokeWidth={2} />
                    </div>
                    <div className="hidden sm:block">
                        <h2 className="serif-heading text-lg leading-none text-charcoal tracking-widest font-bold">KUKI</h2>
                        <p className="text-[7px] uppercase tracking-[0.2em] text-primary font-black mt-1">Admin Panel</p>
                    </div>
                </Link>

                <nav className="hidden xl:flex items-center gap-6 ml-4">
                    <Link to="/admin/overview" className={`text-[10px] font-bold uppercase tracking-widest ${activeTab === 'overview' ? 'text-primary' : 'text-soft-grey hover:text-charcoal'} transition-colors`}>Overview</Link>
                    <Link to="/admin/bookings" className={`text-[10px] font-bold uppercase tracking-widest ${activeTab === 'bookings' ? 'text-primary' : 'text-soft-grey hover:text-charcoal'} transition-colors`}>Bookings</Link>
                    <Link to="/admin/events" className={`text-[10px] font-bold uppercase tracking-widest ${activeTab === 'events' ? 'text-primary' : 'text-soft-grey hover:text-charcoal'} transition-colors`}>Events</Link>
                    <Link to="/admin/menu" className={`text-[10px] font-bold uppercase tracking-widest ${activeTab === 'menu' ? 'text-primary' : 'text-soft-grey hover:text-charcoal'} transition-colors`}>Menu</Link>
                    <Link to="/admin/settings" className={`text-[10px] font-bold uppercase tracking-widest ${activeTab === 'settings' ? 'text-primary' : 'text-soft-grey hover:text-charcoal'} transition-colors`}>Settings</Link>
                </nav>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative" ref={notificationRef}>
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`size-10 rounded-xl flex items-center justify-center transition-all relative ${showNotifications ? 'bg-primary text-white shadow-lg' : 'bg-background-ivory/50 border border-primary/5 text-soft-grey hover:text-primary hover:bg-white hover:shadow-sm'}`}
                    >
                        <Bell size={18} />
                        {notifications.length > 0 && (
                            <span className="absolute -top-1 -right-1 size-5 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center animate-bounce">
                                {notifications.length}
                            </span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 mt-4 w-[calc(100vw-32px)] sm:w-[380px] max-w-[380px] bg-white rounded-[2rem] shadow-2xl border border-primary/10 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
                            <div className="p-6 border-b border-primary/5 flex items-center justify-between bg-background-ivory/30">
                                <h4 className="serif-heading text-lg text-charcoal lowercase italic">Pending Approvals</h4>
                                <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full">
                                    {notifications.length} New
                                </span>
                            </div>

                            <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                                {loading && notifications.length === 0 ? (
                                    <div className="p-12 text-center text-soft-grey italic text-sm animate-pulse">Syncing requests...</div>
                                ) : notifications.length === 0 ? (
                                    <div className="p-12 text-center space-y-4">
                                        <div className="size-16 bg-background-ivory rounded-full flex items-center justify-center mx-auto text-primary/20">
                                            <Bell size={32} />
                                        </div>
                                        <p className="text-soft-grey italic text-sm font-medium">No pending approvals</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-primary/5">
                                        {notifications.map((n) => (
                                            <div key={n.id} className="p-5 hover:bg-background-ivory/20 transition-colors group">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="space-y-3 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                                                n.type === 'Table Booking' ? 'bg-blue-100 text-blue-600' :
                                                                n.type === 'Event Reservation' ? 'bg-purple-100 text-purple-600' :
                                                                'bg-amber-100 text-amber-600'
                                                            }`}>
                                                                {n.type}
                                                            </span>
                                                            <span className="text-[10px] text-soft-grey flex items-center gap-1">
                                                                <Clock size={10} /> Pending
                                                            </span>
                                                        </div>
                                                        
                                                        <div className="space-y-1">
                                                            <p className="font-bold text-charcoal flex items-center gap-2">
                                                                <User2 size={12} className="text-primary/40" /> {n.customerName}
                                                            </p>
                                                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                                                                <p className="text-[11px] text-soft-grey flex items-center gap-1.5 capitalize">
                                                                    <MapPin size={11} className="text-primary/30" /> {n.details}
                                                                </p>
                                                                <p className="text-[11px] text-soft-grey flex items-center gap-1.5 font-medium">
                                                                    <Calendar size={11} className="text-primary/30" /> {n.dateTime}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button 
                                                            onClick={() => handleAction(n.id, n.model, 'approved')}
                                                            className="size-9 bg-green-500 text-white rounded-xl shadow-lg shadow-green-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                                                            title="Approve"
                                                        >
                                                            <Check size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleAction(n.id, n.model, 'rejected')}
                                                            className="size-9 bg-red-500 text-white rounded-xl shadow-lg shadow-red-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                                                            title="Reject"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {notifications.length > 0 && (
                                <div className="p-4 bg-background-ivory/50 border-t border-primary/5 text-center">
                                    <button onClick={fetchNotifications} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                                        Refresh List
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="h-10 w-[1px] bg-primary/10 mx-1"></div>

                <div className="flex items-center gap-3 pl-2">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-charcoal uppercase tracking-widest">Administrator</p>
                        <button onClick={handleLogout} className="text-[9px] font-bold text-primary uppercase tracking-widest hover:underline">Sign Out</button>
                    </div>
                    <div className="size-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                        <User size={20} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
