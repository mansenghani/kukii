import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Bell, User } from 'lucide-react';

const AdminHeader = ({ activeTab }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('kuki_admin_auth');
        localStorage.removeItem('kuki_admin_token');
        localStorage.removeItem('kuki_admin_user');
        window.location.href = '/admin'; // Force reload to login state
    };

    return (
        <header className="h-20 bg-white border-b border-primary/10 px-8 flex justify-between items-center sticky top-0 z-40">
            <div className="flex items-center gap-8">
                <Link to="/admin/overview" className="flex items-center gap-3">
                    <div className="size-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        <LayoutDashboard size={20} strokeWidth={2} />
                    </div>
                    <div>
                        <h2 className="serif-heading text-lg leading-none text-charcoal tracking-widest font-bold">KUKI</h2>
                        <p className="text-[7px] uppercase tracking-[0.2em] text-primary font-black mt-1">Admin Panel</p>
                    </div>
                </Link>

                <nav className="hidden lg:flex items-center gap-6 ml-4">
                    <Link to="/admin/overview" className={`text-[10px] font-bold uppercase tracking-widest ${activeTab === 'overview' ? 'text-primary' : 'text-soft-grey hover:text-charcoal'} transition-colors`}>Overview</Link>
                    <Link to="/admin/bookings" className={`text-[10px] font-bold uppercase tracking-widest ${activeTab === 'bookings' ? 'text-primary' : 'text-soft-grey hover:text-charcoal'} transition-colors`}>Bookings</Link>
                    <Link to="/admin/events" className={`text-[10px] font-bold uppercase tracking-widest ${activeTab === 'events' ? 'text-primary' : 'text-soft-grey hover:text-charcoal'} transition-colors`}>Events</Link>
                    <Link to="/admin/menu" className={`text-[10px] font-bold uppercase tracking-widest ${activeTab === 'menu' ? 'text-primary' : 'text-soft-grey hover:text-charcoal'} transition-colors`}>Menu</Link>
                    <Link to="/admin/settings" className={`text-[10px] font-bold uppercase tracking-widest ${activeTab === 'settings' ? 'text-primary' : 'text-soft-grey hover:text-charcoal'} transition-colors`}>Settings</Link>
                </nav>
            </div>

            <div className="flex items-center gap-4">
                <button className="size-10 rounded-xl bg-background-ivory/50 border border-primary/5 flex items-center justify-center text-soft-grey hover:text-primary transition-all relative">
                    <Bell size={18} />
                    <span className="absolute top-2.5 right-2.5 size-2 bg-primary rounded-full border-2 border-white"></span>
                </button>

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
