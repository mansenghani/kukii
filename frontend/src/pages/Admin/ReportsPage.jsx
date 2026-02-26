import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReportsPage = () => {
    const [loading, setLoading] = useState(true);
    const [dailyStats, setDailyStats] = useState({ totalBookings: 0, totalRevenue: 0 });
    const [monthlyStats, setMonthlyStats] = useState({ currentCount: 0, prevCount: 0, growth: 0 });
    const [topFood, setTopFood] = useState([]);
    const [peakHour, setPeakHour] = useState({ _id: 'N/A', count: 0 });
    const [loyalty, setLoyalty] = useState({ repeatPercentage: 0, total: 0 });
    const [transactions, setTransactions] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [filters, setFilters] = useState({
        from: '',
        to: '',
        type: 'All Transactions',
        search: ''
    });

    const API_BASE_URL = 'http://localhost:5050/api/admin/reports';

    useEffect(() => {
        fetchReports();
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [page, filters.from, filters.to, filters.type]);

    const fetchReports = async () => {
        try {
            const [daily, monthly, food, peak, visit] = await Promise.all([
                axios.get(`${API_BASE_URL}/daily`),
                axios.get(`${API_BASE_URL}/monthly`),
                axios.get(`${API_BASE_URL}/top-food?limit=3`),
                axios.get(`${API_BASE_URL}/peak-hours`),
                axios.get(`${API_BASE_URL}/visit-frequency`)
            ]);

            setDailyStats(daily.data);
            setMonthlyStats(monthly.data);
            setTopFood(food.data);
            setPeakHour(peak.data);
            setLoyalty(visit.data);
        } catch (err) {
            console.error("Report Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/transactions`, {
                params: { ...filters, page }
            });
            setTransactions(res.data.data);
            setTotalPages(res.data.pages);
        } catch (err) {
            console.error("Transactions Error:", err);
        }
    };

    const handleExport = (format) => {
        const url = `${API_BASE_URL}/export/${format}?from=${filters.from}&to=${filters.to}`;
        window.open(url, '_blank');
    };

    // Material Icons helper if using span class as per user HTML
    const Icon = ({ name, className = "" }) => (
        <span className={`material-symbols-outlined ${className}`}>{name}</span>
    );

    if (loading) return <div className="p-20 text-center font-serif italic text-soft-grey animate-pulse">Generating reports...</div>;

    return (
        <div className="animate-fade-in space-y-12">
            {/* Header Area */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="serif-heading text-4xl text-charcoal">Report Generation</h1>
                    <p className="text-soft-grey mt-1 text-sm font-medium">Generate analytics and performance reports for restaurant management.</p>
                </div>
                <div className="hidden md:flex flex-col items-end gap-1 text-right">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Status Overview</p>
                    <p className="text-xs text-soft-grey">Last Generated: <span className="font-semibold text-charcoal">{new Date().toLocaleString()}</span></p>
                    <p className="text-xs text-soft-grey">Reports Created: <span className="font-semibold text-charcoal">128</span></p>
                </div>
            </div>

            {/* Report Configuration Cards */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
                {/* Daily Booking Report */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-primary/5 hover:shadow-lg transition-all duration-300 h-full flex flex-col justify-between group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:scale-110 transition-transform">
                            <Icon name="event_available" />
                        </div>
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded uppercase">Daily</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-charcoal">Daily Booking Report</h3>
                    <p className="text-xs text-soft-grey mb-4 font-medium">Summary: Total {dailyStats.totalBookings} bookings today</p>
                    <div className="space-y-4">
                        <input className="w-full rounded-lg border-primary/20 focus:ring-primary focus:border-primary bg-background-ivory/50 text-sm py-2 px-3 outline-none" type="date" />
                        <button className="w-full bg-primary text-white py-2 rounded-lg text-sm font-bold hover:bg-primary-hover transition-colors shadow-sm">Generate</button>
                    </div>
                </div>

                {/* Monthly Reservation Report */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-primary/5 hover:shadow-lg transition-all duration-300 h-full flex flex-col justify-between group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:scale-110 transition-transform">
                            <Icon name="calendar_month" />
                        </div>
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded uppercase">Monthly</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-charcoal">Monthly Reservation Report</h3>
                    <p className={`text-xs ${parseFloat(monthlyStats.growth) >= 0 ? 'text-emerald-600' : 'text-red-500'} mb-4 flex items-center gap-1 font-bold`}>
                        <Icon name={parseFloat(monthlyStats.growth) >= 0 ? "trending_up" : "trending_down"} className="text-sm" />
                        Trend: {monthlyStats.growth > 0 ? '+' : ''}{monthlyStats.growth}% from last month
                    </p>
                    <div className="space-y-4">
                        <select className="w-full rounded-lg border-primary/20 focus:ring-primary focus:border-primary bg-background-ivory/50 text-sm py-2 px-3 outline-none">
                            <option>{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</option>
                            <option>Previous Month</option>
                        </select>
                        <button className="w-full bg-primary text-white py-2 rounded-lg text-sm font-bold hover:bg-primary-hover transition-colors shadow-sm">Generate</button>
                    </div>
                </div>

                {/* Most Ordered Food */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-primary/5 hover:shadow-lg transition-all duration-300 h-full flex flex-col justify-between group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:scale-110 transition-transform">
                            <Icon name="restaurant_menu" />
                        </div>
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded uppercase">Menu</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-charcoal">Most Ordered Food</h3>
                    <div className="text-[11px] text-soft-grey mb-4 flex flex-wrap gap-2">
                        {topFood.map((item, i) => (
                            <span key={i} className="px-2 py-0.5 bg-background-ivory rounded-full border border-primary/5 font-medium">{item.name}</span>
                        ))}
                    </div>
                    <div className="space-y-4">
                        <select className="w-full rounded-lg border-primary/20 focus:ring-primary focus:border-primary bg-background-ivory/50 text-sm py-2 px-3 outline-none">
                            <option>Top 10 Dishes</option>
                            <option>Top 25 Dishes</option>
                        </select>
                        <button className="w-full bg-primary text-white py-2 rounded-lg text-sm font-bold hover:bg-primary-hover transition-colors shadow-sm">Generate</button>
                    </div>
                </div>

                {/* Peak Hour Booking */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-primary/5 hover:shadow-lg transition-all duration-300 h-full flex flex-col justify-between group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:scale-110 transition-transform">
                            <Icon name="schedule" />
                        </div>
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded uppercase">Analytics</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-charcoal">Peak Hour Booking</h3>
                    <p className="text-xs text-soft-grey mb-4 font-medium uppercase tracking-wider">Busiest window: <span className="text-primary font-bold">{peakHour._id}</span></p>
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <input className="w-1/2 rounded-lg border-primary/20 bg-background-ivory/50 text-xs py-2 px-3" type="time" defaultValue="17:00" />
                            <input className="w-1/2 rounded-lg border-primary/20 bg-background-ivory/50 text-xs py-2 px-3" type="time" defaultValue="23:00" />
                        </div>
                        <button className="w-full bg-primary text-white py-2 rounded-lg text-sm font-bold hover:bg-primary-hover transition-colors shadow-sm">Generate</button>
                    </div>
                </div>

                {/* Customer Visit Frequency */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-primary/5 hover:shadow-lg transition-all duration-300 h-full flex flex-col justify-between group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:scale-110 transition-transform">
                            <Icon name="group_work" />
                        </div>
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded uppercase">Loyalty</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-charcoal">Customer Visit Frequency</h3>
                    <div className="mb-4">
                        <div className="flex justify-between text-[10px] font-bold mb-1 text-soft-grey tracking-widest uppercase">
                            <span>Repeat Rate</span>
                            <span className="text-primary">{loyalty.repeatPercentage}%</span>
                        </div>
                        <div className="w-full bg-background-ivory h-1.5 rounded-full overflow-hidden border border-primary/5">
                            <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${loyalty.repeatPercentage}%` }}></div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <select className="w-full rounded-lg border-primary/20 bg-background-ivory/50 text-sm py-2 px-3 outline-none">
                            <option>Last Quarter</option>
                            <option>Year to Date</option>
                        </select>
                        <button className="w-full bg-primary text-white py-2 rounded-lg text-sm font-bold hover:bg-primary-hover transition-colors shadow-sm">Generate</button>
                    </div>
                </div>

                {/* Create Custom Report */}
                <div className="bg-primary/5 border-2 border-dashed border-primary/20 p-6 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-primary/10 transition-all duration-300 group cursor-pointer">
                    <Icon name="add_circle" className="text-primary/40 text-4xl mb-4 group-hover:scale-110 group-hover:text-primary transition-all shadow-rose-200" />
                    <p className="text-sm font-bold text-primary/60 group-hover:text-primary uppercase tracking-widest">Create Custom Report</p>
                </div>
            </section>

            {/* Preview Summary Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-primary/5 shadow-sm hover:translate-y-[-4px] transition-transform">
                    <p className="text-[10px] font-bold text-soft-grey uppercase mb-1 tracking-widest">Total Revenue</p>
                    <p className="text-2xl font-bold text-charcoal">₹{dailyStats.totalRevenue?.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-primary/5 shadow-sm hover:translate-y-[-4px] transition-transform">
                    <p className="text-[10px] font-bold text-soft-grey uppercase mb-1 tracking-widest">Total Bookings</p>
                    <p className="text-2xl font-bold text-charcoal">{dailyStats.totalBookings}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-primary/5 shadow-sm hover:translate-y-[-4px] transition-transform">
                    <p className="text-[10px] font-bold text-soft-grey uppercase mb-1 tracking-widest">Avg Order</p>
                    <p className="text-2xl font-bold text-charcoal">₹{dailyStats.totalBookings > 0 ? (dailyStats.totalRevenue / dailyStats.totalBookings).toFixed(0) : 0}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-primary/5 shadow-sm hover:translate-y-[-4px] transition-transform">
                    <p className="text-[10px] font-bold text-soft-grey uppercase mb-1 tracking-widest">Peak Time</p>
                    <p className="text-2xl font-bold text-charcoal">{peakHour._id}</p>
                </div>
            </div>

            {/* Detailed Transactions Table */}
            <section className="bg-white rounded-3xl shadow-sm border border-primary/5 overflow-hidden">
                {/* Toolbar */}
                <div className="px-8 py-6 border-b border-primary/10 flex flex-col md:flex-row justify-between items-center gap-4 bg-background-ivory/20">
                    <div className="relative w-full md:w-96 group">
                        <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-soft-grey text-lg group-focus-within:text-primary transition-colors" />
                        <input
                            className="w-full h-12 pl-12 pr-4 rounded-xl border border-primary/10 bg-white focus:ring-1 focus:ring-primary focus:border-primary outline-none text-sm transition-all"
                            placeholder="Search report data..."
                            type="text"
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                        <button onClick={() => handleExport('pdf')} className="h-10 px-6 flex items-center justify-center gap-2 bg-white text-charcoal border border-primary/20 rounded-xl text-xs font-bold hover:bg-background-ivory transition-all shadow-sm group">
                            <Icon name="picture_as_pdf" className="text-sm group-hover:text-primary" /> Export PDF
                        </button>
                        <button onClick={() => handleExport('excel')} className="h-10 px-6 flex items-center justify-center gap-2 bg-white text-charcoal border border-primary/20 rounded-xl text-xs font-bold hover:bg-background-ivory transition-all shadow-sm group">
                            <Icon name="description" className="text-sm group-hover:text-primary" /> Export Excel
                        </button>
                        <button onClick={() => window.print()} className="h-10 px-6 flex items-center justify-center gap-2 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary/20 transition-all border border-primary/20 shadow-sm">
                            <Icon name="print" className="text-sm" /> Print Report
                        </button>
                    </div>
                </div>

                {/* Filter Sub-bar */}
                <div className="px-8 py-6 bg-background-ivory/40 border-b border-primary/10 flex flex-wrap gap-6 items-end">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-primary uppercase ml-1 tracking-[0.2em]">From Date</label>
                        <input
                            className="h-11 rounded-xl border border-primary/10 bg-white focus:ring-1 focus:ring-primary px-4 text-xs font-medium w-44 outline-none"
                            type="date"
                            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-primary uppercase ml-1 tracking-[0.2em]">To Date</label>
                        <input
                            className="h-11 rounded-xl border border-primary/10 bg-white focus:ring-1 focus:ring-primary px-4 text-xs font-medium w-44 outline-none"
                            type="date"
                            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-primary uppercase ml-1 tracking-[0.2em]">Report Type</label>
                        <select
                            className="h-11 rounded-xl border border-primary/10 bg-white focus:ring-1 focus:ring-primary px-4 text-xs font-bold w-52 outline-none cursor-pointer"
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        >
                            <option>All Transactions</option>
                            <option>Reservations Only</option>
                            <option>Revenue Analysis</option>
                        </select>
                    </div>
                    <button onClick={fetchTransactions} className="h-11 px-8 bg-charcoal text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-charcoal/90 transition-all shadow-md active:scale-95">Apply Filters</button>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-background-ivory/50 border-b border-primary/10 sticky top-0 z-10 font-serif italic text-charcoal/70">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em]">Date</th>
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em]">Customer Name</th>
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em]">Table No.</th>
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em]">Amount</th>
                                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.2em]">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {transactions.map((tr) => (
                                <tr key={tr._id} className="hover:bg-primary/5 transition-colors group">
                                    <td className="px-8 py-4 text-xs whitespace-nowrap font-medium text-soft-grey">{new Date(tr.date).toLocaleDateString()} - {tr.time}</td>
                                    <td className="px-8 py-4 text-sm font-bold text-charcoal">{tr.customerId?.name}</td>
                                    <td className="px-8 py-4 text-xs font-medium text-soft-grey opacity-60">Table {tr.tableId?.tableNumber}</td>
                                    <td className="px-8 py-4">
                                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${tr.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                            {tr.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4 text-sm font-black text-primary">₹{tr.totalAmount?.toLocaleString()}</td>
                                    <td className="px-8 py-4">
                                        <button
                                            onClick={() => setSelectedDetail(tr)}
                                            className="size-9 bg-background-ivory rounded-lg flex items-center justify-center text-primary/60 hover:text-primary hover:bg-white transition-all shadow-sm"
                                        >
                                            <Icon name="visibility" className="text-sm" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center text-soft-grey italic text-sm">No transaction records found for the selected period.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-8 py-6 border-t border-primary/10 flex justify-between items-center bg-background-ivory/10">
                    <p className="text-[10px] font-black text-soft-grey uppercase tracking-widest opacity-60 font-bold italic">Showing records of KUKI Restorant</p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(prev => prev - 1)}
                            className="size-10 rounded-xl border border-primary/10 flex items-center justify-center hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
                        >
                            <Icon name="chevron_left" className="text-sm" />
                        </button>
                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`size-10 rounded-xl text-xs font-black transition-all shadow-sm ${page === i + 1 ? 'bg-primary text-white scale-110' : 'bg-white text-charcoal/60 border border-primary/10 hover:border-primary/40'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(prev => prev + 1)}
                            className="size-10 rounded-xl border border-primary/10 flex items-center justify-center hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
                        >
                            <Icon name="chevron_right" className="text-sm" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Transaction Detail Modal */}
            {selectedDetail && (
                <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm flex justify-center items-center z-[1000] p-4 animate-fade-in">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg relative overflow-hidden border border-primary/10">
                        {/* Modal Header */}
                        <div className="bg-background-ivory/50 px-8 py-6 border-b border-primary/10 flex justify-between items-center">
                            <div>
                                <h3 className="serif-heading text-2xl text-charcoal">Transaction Details</h3>
                                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-1">Record ID: {selectedDetail._id.slice(-8)}</p>
                            </div>
                            <button onClick={() => setSelectedDetail(null)} className="size-10 rounded-full hover:bg-white flex items-center justify-center text-soft-grey hover:text-primary transition-all">
                                <Icon name="close" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-[10px] font-bold text-soft-grey uppercase tracking-widest mb-2">Customer</p>
                                    <p className="text-sm font-black text-charcoal">{selectedDetail.customerId?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-soft-grey uppercase tracking-widest mb-2">Table Info</p>
                                    <p className="text-sm font-black text-charcoal">Table {selectedDetail.tableId?.tableNumber || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-soft-grey uppercase tracking-widest mb-2">Date & Time</p>
                                    <p className="text-sm font-medium text-charcoal">{new Date(selectedDetail.date).toLocaleDateString()} at {selectedDetail.time}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-soft-grey uppercase tracking-widest mb-2">Guests</p>
                                    <p className="text-sm font-medium text-charcoal">{selectedDetail.guests} Persons</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-primary/5">
                                <div className="flex justify-between items-center mb-4">
                                    <p className="text-[10px] font-bold text-soft-grey uppercase tracking-widest">Payment Status</p>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedDetail.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                        {selectedDetail.status}
                                    </span>
                                </div>
                                <div className="flex justify-between items-end p-6 bg-background-ivory/30 rounded-2xl border border-primary/5">
                                    <p className="text-xs font-bold text-charcoal uppercase tracking-widest">Total Amount</p>
                                    <p className="text-3xl font-black text-primary">₹{selectedDetail.totalAmount?.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-6 bg-background-ivory/20 flex gap-4">
                            <button onClick={() => window.print()} className="flex-1 bg-white border border-primary/20 text-charcoal py-3 rounded-xl text-xs font-bold hover:bg-background-ivory transition-all flex items-center justify-center gap-2">
                                <Icon name="print" className="text-sm" /> Print Invoice
                            </button>
                            <button onClick={() => setSelectedDetail(null)} className="flex-1 bg-primary text-white py-3 rounded-xl text-xs font-bold hover:bg-primary-hover transition-all shadow-md">
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsPage;
