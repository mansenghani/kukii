import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Store, User, BookOpen, Bell, Sliders, AlertTriangle, Edit, Upload, Eye, EyeOff, Save, RotateCcw, Trash2, LogOut, CheckCircle2 } from 'lucide-react';

const AdminSettings = ({ onError, onSuccess }) => {
    const [activeSection, setActiveSection] = useState('restaurant');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Form States
    const [restaurant, setRestaurant] = useState({ name: '', email: '', phone: '', website: '', address: '', logo: '' });
    const [admin, setAdmin] = useState({ name: '', email: '' });
    const [booking, setBooking] = useState({ onlineReservations: true, autoConfirmation: false, maxTables: 24, bookingDuration: '1.5 Hours' });
    const [notifications, setNotifications] = useState({ emailNotifications: true, reservationAlert: true, reviewNotification: true, dailyReportAlert: true });
    const [preferences, setPreferences] = useState({ currency: 'INR', timeFormat: '12-hour (1:00 PM)' });
    const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

    // File state
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');

    const token = localStorage.getItem('kuki_admin_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchAllSettings();
    }, []);

    const fetchAllSettings = async () => {
        setLoading(true);
        try {
            const [resRest, resBook, resNote, resPref, resAdmin] = await Promise.all([
                axios.get('/api/settings/restaurant', config),
                axios.get('/api/settings/booking', config),
                axios.get('/api/settings/notification', config),
                axios.get('/api/settings/preferences', config),
                // Since there's no direct profile GET provided in the prompt's API list, we'll use stored admin data or a mock for now
                // Actually the prompt says PUT /api/admin/profile, I'll assume we can get it or just use the local storage one
                Promise.resolve({ data: JSON.parse(localStorage.getItem('kuki_admin_user') || '{}') })
            ]);

            setRestaurant(resRest.data);
            setBooking(resBook.data);
            setNotifications(resNote.data);
            setPreferences(resPref.data);
            setAdmin(resAdmin.data);
            setLogoPreview(resRest.data.logo);
        } catch (err) {
            console.error(err);
            if (onError) onError('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRestaurant = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const formData = new FormData();
            Object.keys(restaurant).forEach(key => {
                if (key !== 'logo') formData.append(key, restaurant[key]);
            });
            if (logoFile) formData.append('logo', logoFile);

            const res = await axios.put('/api/settings/restaurant', formData, {
                headers: { ...config.headers, 'Content-Type': 'multipart/form-data' }
            });
            setRestaurant(res.data);
            setLogoPreview(res.data.logo);
            if (onSuccess) onSuccess('Restaurant settings updated');
        } catch (err) {
            if (onError) onError('Update failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateAdmin = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await axios.put('/api/admin/profile', admin, config);
            localStorage.setItem('kuki_admin_user', JSON.stringify(res.data));
            if (onSuccess) onSuccess('Profile updated');
        } catch (err) {
            if (onError) onError('Update failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            if (onError) onError('Passwords do not match');
            return;
        }
        setSubmitting(true);
        try {
            await axios.put('/api/admin/change-password', passwords, config);
            setShowPasswordModal(false);
            setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
            if (onSuccess) onSuccess('Password changed successfully');
        } catch (err) {
            if (onError) onError(err.response?.data?.message || 'Change failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveSection = async (section, data, endpoint) => {
        setSubmitting(true);
        try {
            const res = await axios.put(endpoint, data, config);
            if (section === 'booking') setBooking(res.data);
            if (section === 'notifications') setNotifications(res.data);
            if (section === 'preferences') setPreferences(res.data);
            if (onSuccess) onSuccess('Settings saved successfully');
        } catch (err) {
            if (onError) onError('Failed to save settings');
        } finally {
            setSubmitting(false);
        }
    };

    const handleResetSystem = async () => {
        if (!window.confirm('Reset all system settings to factory defaults? This cannot be undone.')) return;
        try {
            await axios.post('/api/system/reset', {}, config);
            fetchAllSettings();
            if (onSuccess) onSuccess('System reset successfully');
        } catch (err) {
            if (onError) onError('Reset failed');
        }
    };

    const handleDeleteAllData = async () => {
        if (!window.confirm('PERMANENTLY DELETE all bookings, preorders, and reports? This is DESTRUCTIVE.')) return;
        try {
            await axios.delete('/api/reports', config);
            if (onSuccess) onSuccess('All data purged successfully');
        } catch (err) {
            if (onError) onError('Purge failed');
        }
    };

    const handleLogoutAll = async () => {
        if (!window.confirm('Logout all active sessions? You will need to login again.')) return;
        try {
            await axios.post('/api/admin/logout-all', {}, config);
            localStorage.clear();
            window.location.href = '/admin';
        } catch (err) {
            if (onError) onError('Logout all failed');
        }
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    if (loading) return <div className="p-20 text-center font-serif italic text-soft-grey animate-pulse">Synchronizing settings...</div>;

    return (
        <div className="animate-fade-in font-sans pb-20">
            <header className="mb-10">
                <h2 className="serif-heading text-4xl text-charcoal tracking-tight lowercase italic">System Settings</h2>
                <p className="text-soft-grey text-sm mt-1">Manage restaurant configuration, admin preferences, and system controls.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Sidebar Nav */}
                <aside className="lg:col-span-3 space-y-2">
                    <button onClick={() => setActiveSection('restaurant')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activeSection === 'restaurant' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-soft-grey hover:bg-background-ivory hover:text-primary'}`}>
                        <Store size={18} /> Restaurant Info
                    </button>
                    <button onClick={() => setActiveSection('admin')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activeSection === 'admin' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-soft-grey hover:bg-background-ivory hover:text-primary'}`}>
                        <User size={18} /> Admin Account
                    </button>
                    <button onClick={() => setActiveSection('booking')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activeSection === 'booking' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-soft-grey hover:bg-background-ivory hover:text-primary'}`}>
                        <BookOpen size={18} /> Booking Rules
                    </button>
                    <button onClick={() => setActiveSection('notifications')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activeSection === 'notifications' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-soft-grey hover:bg-background-ivory hover:text-primary'}`}>
                        <Bell size={18} /> Notifications
                    </button>
                    <button onClick={() => setActiveSection('system')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activeSection === 'system' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-soft-grey hover:bg-background-ivory hover:text-primary'}`}>
                        <Sliders size={18} /> Preferences
                    </button>
                    <div className="pt-8 border-t border-border-neutral mt-8">
                        <button onClick={() => setActiveSection('danger')} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activeSection === 'danger' ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                            <AlertTriangle size={18} /> Danger Zone
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="lg:col-span-9 bg-white rounded-[2.5rem] border border-primary/5 shadow-sm overflow-hidden">
                    {activeSection === 'restaurant' && (
                        <div className="p-10 animate-fade-in">
                            <h3 className="serif-heading text-2xl text-charcoal mb-8 border-b border-background-ivory pb-4">Restaurant Identity</h3>
                            <form onSubmit={handleUpdateRestaurant} className="space-y-8">
                                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start bg-background-ivory/30 p-8 rounded-3xl border border-primary/5">
                                    <div className="relative group">
                                        <div className="size-32 rounded-3xl bg-white border-2 border-dashed border-primary/10 flex items-center justify-center overflow-hidden shadow-inner">
                                            {logoPreview ? <img src={logoPreview} className="w-full h-full object-contain" alt="Logo" /> : <Store size={40} className="text-primary/20" />}
                                        </div>
                                        <label className="absolute -bottom-2 -right-2 size-10 bg-primary text-white rounded-2xl shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                                            <Upload size={18} />
                                            <input type="file" hidden accept="image/*" onChange={handleLogoChange} />
                                        </label>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="font-bold text-charcoal">Institution Branding</p>
                                        <p className="text-xs text-soft-grey leading-relaxed">JPG, PNG or SVG. Visual identity used in emails, receipts, and the header area. Max size 2MB recommended.</p>
                                        <button type="button" onClick={() => document.querySelector('input[type="file"]').click()} className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline">Replace Corporate Identity</button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Establishment Name</label>
                                        <input className="w-full bg-background-ivory/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all font-medium" type="text" value={restaurant.name} onChange={e => setRestaurant({ ...restaurant, name: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Contact Electronic Mail</label>
                                        <input className="w-full bg-background-ivory/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all font-medium" type="email" value={restaurant.email} onChange={e => setRestaurant({ ...restaurant, email: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Phone Helpline</label>
                                        <input className="w-full bg-background-ivory/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all font-medium" type="text" value={restaurant.phone} onChange={e => setRestaurant({ ...restaurant, phone: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Digital Domain (URL)</label>
                                        <input className="w-full bg-background-ivory/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all font-medium" type="text" value={restaurant.website} onChange={e => setRestaurant({ ...restaurant, website: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Geographical Location</label>
                                    <textarea rows="3" className="w-full bg-background-ivory/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all font-medium resize-none text-[#2b2b2b]" value={restaurant.address} onChange={e => setRestaurant({ ...restaurant, address: e.target.value })} />
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button disabled={submitting} className="px-10 py-4 bg-primary text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
                                        {submitting ? 'Saving...' : <><Save size={16} /> Update Identity</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeSection === 'admin' && (
                        <div className="p-10 animate-fade-in">
                            <h3 className="serif-heading text-2xl text-charcoal mb-8 border-b border-background-ivory pb-4">Personal Configuration</h3>
                            <div className="space-y-12">
                                <form onSubmit={handleUpdateAdmin} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Administrator Alias</label>
                                            <input className="w-full bg-background-ivory/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all font-medium" type="text" value={admin.name} onChange={e => setAdmin({ ...admin, name: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Administrative Email</label>
                                            <input className="w-full bg-background-ivory/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all font-medium" type="email" value={admin.email} onChange={e => setAdmin({ ...admin, email: e.target.value })} />
                                        </div>
                                    </div>
                                    <button disabled={submitting} className="px-8 py-3 bg-charcoal text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-black transition-all">Synchronize Profile</button>
                                </form>

                                <div className="pt-10 border-t border-background-ivory">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-6">Security Protocol</p>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-background-ivory/30 rounded-3xl border border-primary/5 gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-2xl bg-white border border-primary/10 flex items-center justify-center text-primary">
                                                <AlertTriangle size={24} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-charcoal">Authentication Key</p>
                                                <p className="text-[10px] text-soft-grey italic">Regularly cycling credentials enhances security perimeter.</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setShowPasswordModal(true)} className="px-6 py-3 border border-primary/20 text-primary rounded-xl font-bold text-xs hover:bg-primary hover:text-white transition-all">Change Passcode</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'booking' && (
                        <div className="p-10 animate-fade-in">
                            <h3 className="serif-heading text-2xl text-charcoal mb-8 border-b border-background-ivory pb-4">Reservation Logic</h3>
                            <div className="space-y-8">
                                <section className="space-y-4">
                                    <div className="flex items-center justify-between p-4 hover:bg-background-ivory/30 rounded-2xl transition-colors">
                                        <div>
                                            <p className="font-bold text-charcoal">Virtual Reservations</p>
                                            <p className="text-[10px] text-soft-grey italic">Enable public availability of digital table booking interface.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input checked={booking.onlineReservations} onChange={e => setBooking({ ...booking, onlineReservations: e.target.checked })} className="sr-only peer" type="checkbox" />
                                            <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between p-4 hover:bg-background-ivory/30 rounded-2xl transition-colors">
                                        <div>
                                            <p className="font-bold text-charcoal">Auto Booking Approval</p>
                                            <p className="text-[10px] text-soft-grey italic">Automatically approve new bookings without human intervention.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input checked={booking.autoConfirmation} onChange={e => setBooking({ ...booking, autoConfirmation: e.target.checked })} className="sr-only peer" type="checkbox" />
                                            <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                </section>

                                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-background-ivory">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Maximum Capacitance (Tables)</label>
                                        <input className="w-full bg-background-ivory/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all font-bold" type="number" value={booking.maxTables} onChange={e => setBooking({ ...booking, maxTables: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Temporal Lease (Duration)</label>
                                        <select className="w-full bg-background-ivory/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all font-bold" value={booking.bookingDuration} onChange={e => setBooking({ ...booking, bookingDuration: e.target.value })}>
                                            <option>1 Hour</option>
                                            <option>1.5 Hours</option>
                                            <option>2 Hours</option>
                                            <option>3 Hours</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-8">
                                    <button onClick={() => handleSaveSection('booking', booking, '/api/settings/booking')} disabled={submitting} className="px-10 py-4 bg-primary/10 text-primary border border-primary/20 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm">
                                        {submitting ? 'Applying...' : 'Store Reservation Logic'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'notifications' && (
                        <div className="p-10 animate-fade-in">
                            <h3 className="serif-heading text-2xl text-charcoal mb-8 border-b border-background-ivory pb-4">Communication Vectors</h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'System Email Relay', desc: 'Centralized transactional communication dispatch.', key: 'emailNotifications' },
                                    { label: 'Booking Arrival Alarms', desc: 'Real-time auditory/visual notifications for new requests.', key: 'reservationAlert' },
                                    { label: 'Sentiment Review Alerts', desc: 'Notification when guest chronicles are published.', key: 'reviewNotification' },
                                    { label: 'Synchronized Daily Briefing', desc: 'Comprehensive analytic summary delivered every dawn.', key: 'dailyReportAlert' }
                                ].map((n, i) => (
                                    <div key={i} className="flex items-center justify-between p-6 hover:bg-background-ivory/30 rounded-[2rem] transition-all border border-transparent hover:border-primary/5">
                                        <div className="flex items-center gap-5">
                                            <div className="size-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                                                {i === 0 && <Bell size={18} />}
                                                {i === 1 && <RotateCcw size={18} />}
                                                {i === 2 && <Store size={18} />}
                                                {i === 3 && <Sliders size={18} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-charcoal">{n.label}</p>
                                                <p className="text-[10px] text-soft-grey italic">{n.desc}</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input checked={notifications[n.key]} onChange={e => setNotifications({ ...notifications, [n.key]: e.target.checked })} className="sr-only peer" type="checkbox" />
                                            <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                ))}
                                <div className="flex justify-end pt-8">
                                    <button onClick={() => handleSaveSection('notifications', notifications, '/api/settings/notification')} disabled={submitting} className="px-10 py-4 bg-charcoal text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95">
                                        {submitting ? 'Updating...' : 'Save Communication Preferences'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'system' && (
                        <div className="p-10 animate-fade-in">
                            <h3 className="serif-heading text-2xl text-charcoal mb-8 border-b border-background-ivory pb-4">Global Preferences</h3>
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-background-ivory/30 rounded-3xl border border-primary/5">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Monetary Symbol (Currency)</label>
                                        <select className="w-full bg-white border border-primary/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all font-bold" value={preferences.currency} onChange={e => setPreferences({ ...preferences, currency: e.target.value })}>
                                            <option value="INR">INR (₹)</option>
                                            <option value="USD">USD ($)</option>
                                            <option value="EUR">EUR (€)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Chronological Syntax (Time)</label>
                                        <select className="w-full bg-white border border-primary/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all font-bold" value={preferences.timeFormat} onChange={e => setPreferences({ ...preferences, timeFormat: e.target.value })}>
                                            <option>12-hour (1:00 PM)</option>
                                            <option>24-hour (13:00)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button onClick={() => handleSaveSection('preferences', preferences, '/api/settings/preferences')} disabled={submitting} className="px-12 py-4 bg-primary text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all flex items-center gap-2 active:scale-95">
                                        <Save size={16} /> Finalize Preferences
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'danger' && (
                        <div className="p-10 animate-fade-in bg-red-50/20">
                            <div className="flex items-center gap-3 text-red-600 mb-8 border-b border-red-100 pb-4">
                                <AlertTriangle size={32} />
                                <h3 className="serif-heading text-2xl">Irreversible Procedures</h3>
                            </div>
                            <div className="space-y-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white rounded-3xl border-2 border-dashed border-red-100 gap-6">
                                    <div>
                                        <p className="font-bold text-charcoal">Systemic Factory Oscillation</p>
                                        <p className="text-[10px] text-soft-grey italic">Restore all configuration constants to initial factory origin.</p>
                                    </div>
                                    <button onClick={handleResetSystem} className="px-10 py-3 bg-white border-2 border-red-200 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all shadow-sm">Reset Constants</button>
                                </div>
                                <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white rounded-3xl border-2 border-dashed border-red-100 gap-6">
                                    <div>
                                        <p className="font-bold text-charcoal">Chronological Data Erasure</p>
                                        <p className="text-[10px] text-soft-grey italic">Absolute purge of analytics, bookings, and customer narratives.</p>
                                    </div>
                                    <button onClick={handleDeleteAllData} className="px-10 py-3 bg-white border-2 border-red-200 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all shadow-sm">Purge Archives</button>
                                </div>
                                <div className="flex flex-col md:flex-row md:items-center justify-between p-8 bg-red-600 rounded-3xl text-white gap-6 shadow-xl shadow-red-100">
                                    <div>
                                        <p className="font-bold text-xl uppercase tracking-widest">Global Session Termination</p>
                                        <p className="text-[10px] opacity-80 mt-1">Forcefully invalidate all cryptographic admin tokens in circulation.</p>
                                    </div>
                                    <button onClick={handleLogoutAll} className="px-10 py-4 bg-white text-red-600 rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-red-50 transition-all active:scale-95 flex items-center gap-2">
                                        <LogOut size={18} /> Expel All Users
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-md flex items-center justify-center z-[1000] p-6 animate-fade-in">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-white/10 p-10">
                        <header className="mb-8">
                            <h3 className="serif-heading text-3xl text-charcoal lowercase italic">Cycle Passcode</h3>
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">Update authentication key</p>
                        </header>
                        <form onSubmit={handlePasswordChange} className="space-y-6">
                            <div className="space-y-4">
                                <div className="relative">
                                    <input className="w-full bg-background-ivory/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none font-medium" type={showPassword ? 'text' : 'password'} placeholder="Existing Passcode" required value={passwords.oldPassword} onChange={e => setPasswords({ ...passwords, oldPassword: e.target.value })} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-soft-grey">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                                </div>
                                <input className="w-full bg-background-ivory/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none font-medium" type="password" placeholder="New Complexity Key" required value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} />
                                <input className="w-full bg-background-ivory/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none font-medium" type="password" placeholder="Verify Complexity Key" required value={passwords.confirmPassword} onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })} />
                            </div>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 py-4 bg-background-ivory text-soft-grey rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-gray-100">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-primary-hover shadow-lg shadow-primary/20">
                                    {submitting ? 'Updating...' : 'Apply Key'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <footer className="mt-20 text-center text-soft-grey text-[10px] font-bold uppercase tracking-[0.4em] opacity-40">
                © 2024 LUXE FINE DINING. ROSE EDITION v2.4.0
            </footer>
        </div>
    );
};

export default AdminSettings;
