import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    Legend as RechartsLegend, ResponsiveContainer
} from 'recharts';
import {
    Calendar, TrendingUp, Users, ShoppingBag, IndianRupee,
    Tag, Utensils, CalendarDays, Star, Settings, ArrowRight
} from 'lucide-react';
import FooterSettingsCard from './FooterSettingsCard';

const Overview = ({ onTabChange, onFooterClick }) => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        summary: {},
        daily: [],
        monthly: [],
        status: [],
        topItems: [],
        peakSlots: []
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('kuki_admin_token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const [summary, daily, monthly, status, items, slots] = await Promise.all([
                axios.get('/api/dashboard/summary-cards', config),
                axios.get('/api/dashboard/daily-bookings', config),
                axios.get('/api/dashboard/monthly-revenue', config),
                axios.get('/api/dashboard/booking-status', config),
                axios.get('/api/dashboard/top-items', config),
                axios.get('/api/dashboard/peak-slots', config),
            ]);

            setStats({
                summary: summary.data,
                daily: daily.data,
                monthly: monthly.data,
                status: status.data,
                topItems: items.data,
                peakSlots: slots.data
            });
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center text-primary font-bold animate-pulse uppercase tracking-[0.2em]">
                Generating Analytics...
            </div>
        );
    }

    const dailyData = stats.daily.map((d) => ({ day: d.day, bookings: d.count }));
    const bookingStatusData = stats.status.map((s) => ({
        name: s._id.charAt(0).toUpperCase() + s._id.slice(1),
        value: s.count
    }));
    const monthlyData = stats.monthly.map((m) => ({ month: m.month, revenue: m.revenue }));
    const peakSlotsData = stats.peakSlots.map((p) => ({ slot: p._id, count: p.count }));
    const topItemsData = stats.topItems.map((i) => ({ item: i._id, quantity: i.totalQuantity }));
    const statusColors = ['#c67c7c', '#2b2b2b', '#e3dbd4'];

    return (
        <div className="space-y-12 pb-16 animate-fade-in">

            {/* 1. TOP SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard
                    title="Total Bookings"
                    value={stats.summary.bookings}
                    trend={stats.summary.trends.bookings}
                    icon={<Calendar size={24} />}
                    color="bg-primary/5 text-primary"
                />
                <SummaryCard
                    title="Total Events"
                    value={stats.summary.events}
                    trend={stats.summary.trends.events}
                    icon={<Users size={24} />}
                    color="bg-charcoal/5 text-charcoal"
                />
                <SummaryCard
                    title="Pre-Orders"
                    value={stats.summary.preOrders}
                    trend={stats.summary.trends.preOrders}
                    icon={<ShoppingBag size={24} />}
                    color="bg-primary/5 text-primary"
                />
                <SummaryCard
                    title="Total Revenue"
                    value={`₹${stats.summary.revenue.toLocaleString()}`}
                    trend={stats.summary.trends.revenue}
                    icon={<IndianRupee size={24} />}
                    color="bg-emerald-50 text-emerald-600"
                />
            </div>

            {/* 2. QUICK ACCESS SECTION (8 BOXES) */}
            <section className="animate-fade-in">
                <h4 className="serif-heading font-bold text-charcoal mb-6 text-2xl px-2">Quick Access</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 px-1">
                    <QuickModuleCard title="Manage Categories" desc="Organize your menu with custom categories." icon={<Tag />} onClick={() => onTabChange('categories')} />
                    <QuickModuleCard title="Manage Menu" desc="Update your dishes, prices and availability." icon={<Utensils />} onClick={() => onTabChange('menu')} />
                    <QuickModuleCard title="Reservations" desc="Approve or manage customer table bookings." icon={<CalendarDays />} onClick={() => onTabChange('bookings')} />
                    <QuickModuleCard title="Private Events" desc="Manage full-venue private event requests." icon={<CalendarDays className="text-primary" />} onClick={() => onTabChange('events')} />
                    <QuickModuleCard title="Featured Menu" desc="Select 3 items to showcase on your homepage." icon={<Star className="text-primary" />} onClick={() => onTabChange('featured')} />
                    <QuickModuleCard title="Pre-Orders" desc="Review meal selections for upcoming guests." icon={<ShoppingBag />} onClick={() => onTabChange('preorders')} />
                    <QuickModuleCard title="System Settings" desc="Configure restaurant rules and logic." icon={<Settings />} onClick={() => onTabChange('settings')} />
                    <FooterSettingsCard onClick={onFooterClick} />
                </div>
            </section>

            {/* 3. CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* LINE CHART */}
                <div className="bg-white p-8 rounded-[2rem] border border-primary/5 shadow-sm">
                    <h4 className="serif-heading text-xl text-charcoal mb-6">Daily Bookings (7 Days)</h4>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dailyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f2eeeb" />
                                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#8b8b8b" />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#8b8b8b" />
                                <RechartsTooltip />
                                <Line type="monotone" dataKey="bookings" stroke="#c67c7c" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* DOUGHNUT CHART */}
                <div className="bg-white p-8 rounded-[2rem] border border-primary/5 shadow-sm flex flex-col items-center">
                    <h4 className="serif-heading text-xl text-charcoal mb-6 self-start">Booking Distribution</h4>
                    <div className="h-[300px] w-full max-w-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={bookingStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={2}>
                                    {bookingStatusData.map((entry, index) => (
                                        <Cell key={entry.name} fill={statusColors[index % statusColors.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                                <RechartsLegend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* REVENUE BAR CHART */}
                <div className="bg-white p-8 rounded-[2rem] border border-primary/5 shadow-sm">
                    <h4 className="serif-heading text-xl text-charcoal mb-6">Monthly Revenue Trend</h4>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f2eeeb" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#8b8b8b" />
                                <YAxis tick={{ fontSize: 12 }} stroke="#8b8b8b" />
                                <RechartsTooltip formatter={(value) => [`₹${value?.toLocaleString?.() ?? value}`, 'Revenue']} />
                                <Bar dataKey="revenue" fill="#2b2b2b" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* PEAK SLOTS CHART */}
                <div className="bg-white p-8 rounded-[2rem] border border-primary/5 shadow-sm">
                    <h4 className="serif-heading text-xl text-charcoal mb-6">Peak Booking Times</h4>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={peakSlotsData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f2eeeb" />
                                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} stroke="#8b8b8b" />
                                <YAxis type="category" dataKey="slot" width={90} tick={{ fontSize: 12 }} stroke="#8b8b8b" />
                                <RechartsTooltip />
                                <Bar dataKey="count" fill="#c67c7c" radius={[0, 6, 6, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* TOP ITEMS CHART */}
            <div className="bg-white p-8 rounded-[2rem] border border-primary/5 shadow-sm">
                <h4 className="serif-heading text-xl text-charcoal mb-6">Top 5 Ordered Food Items</h4>
                <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topItemsData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f2eeeb" />
                            <XAxis dataKey="item" tick={{ fontSize: 12 }} stroke="#8b8b8b" interval={0} angle={-20} textAnchor="end" height={60} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#8b8b8b" />
                            <RechartsTooltip />
                            <Bar dataKey="quantity" fill="#c67c7c" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

// UI REUSABLE COMPONENTS
const SummaryCard = ({ title, value, trend, icon, color }) => (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-primary/5 hover:translate-y-[-4px] transition-all duration-300">
        <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl ${color}`}>{icon}</div>
            <span className="flex items-center gap-1 text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                <TrendingUp size={14} /> {trend}
            </span>
        </div>
        <h3 className="text-3xl font-black text-charcoal tracking-tight">{value}</h3>
        <p className="text-[10px] font-bold text-soft-grey uppercase tracking-[0.2em] mt-2 italic">{title}</p>
    </div>
);

const QuickModuleCard = ({ title, desc, icon, onClick }) => (
    <div onClick={onClick} className="group bg-white p-8 rounded-[2.5rem] shadow-sm border border-primary/5 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 cursor-pointer flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[4rem]"></div>
        <div className="mb-6 relative">
            <div className="size-16 bg-background-ivory rounded-2xl flex items-center justify-center text-primary border border-primary/10 group-hover:scale-110 transition-all">{icon}</div>
        </div>
        <h3 className="serif-heading text-2xl text-charcoal mb-3">{title}</h3>
        <p className="text-xs text-soft-grey leading-relaxed mb-8 max-w-[240px] font-medium">{desc}</p>
        <button className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 group-hover:gap-3 transition-all">Explore <ArrowRight size={14} /></button>
    </div>
);

export default Overview;
