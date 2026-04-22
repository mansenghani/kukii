import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CalendarDays, Filter, Eye, Trash2, Pencil, CheckCircle2, AlertCircle, Search, Plus, X, Loader2, User, ShoppingBag } from 'lucide-react';
import Pagination from '../../components/Pagination';
import AdminCancelModal from '../../components/AdminCancelModal';

const AdminBookings = ({ onError, onSuccess }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [paginationData, setPaginationData] = useState({ totalPages: 1, totalRecords: 0 });

    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);

    // Manual Add States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [tables, setTables] = useState([]);
    const [slots, setSlots] = useState([]);
    const [addFormData, setAddFormData] = useState({
        name: '',
        email: '',
        phone: '',
        tableId: '',
        date: '',
        time: '',
        guests: 2
    });

    const API_BASE_URL = '/api';

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const statusQuery = filterStatus !== 'All' ? `&status=${filterStatus}` : '';
            const res = await axios.get(`${API_BASE_URL}/bookings?page=${page}&limit=${limit}${statusQuery}`);
            setBookings(res.data.data);
            setPaginationData({
                totalPages: res.data.totalPages,
                totalRecords: res.data.totalRecords
            });
        } catch (error) {
            onError('Failed to fetch bookings');
        } finally {
            setLoading(false);
        }
    };

    const fetchTables = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/tables/all`);
            setTables(res.data);
            if (res.data.length > 0 && !addFormData.tableId) {
                setAddFormData(prev => ({ ...prev, tableId: res.data[0]._id }));
            }
        } catch (error) {
            console.error("Failed to fetch tables", error);
        }
    };

    const fetchSlots = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/slots`);
            const activeSlots = res.data.filter(s => s.isActive);
            setSlots(activeSlots);
            if (activeSlots.length > 0 && !addFormData.time) {
                setAddFormData(prev => ({ ...prev, time: activeSlots[0].time }));
            }
        } catch (error) {
            console.error("Failed to fetch slots", error);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [filterStatus, page]);

    useEffect(() => {
        if (isAddModalOpen) {
            fetchTables();
            fetchSlots();
        }
    }, [isAddModalOpen]);

    const openCancelModal = (booking) => {
        setBookingToCancel(booking);
        setIsCancelModalOpen(true);
    };

    const handleAddBooking = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const token = localStorage.getItem('kuki_admin_token');
            await axios.post(`${API_BASE_URL}/bookings/admin`, addFormData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onSuccess('Booking successfully created!');
            setIsAddModalOpen(false);
            setAddFormData({ name: '', email: '', phone: '', tableId: '', date: '', time: '12:00', guests: 2 });
            fetchBookings();
        } catch (error) {
            onError(error.response?.data?.message || 'Failed to create booking');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColorClass = (status) => {
        switch (status) {
            case 'Reserved': return 'text-amber-600 border-amber-200 bg-amber-50';
            case 'Checked-in': return 'text-blue-600 border-blue-200 bg-blue-50';
            case 'Seated': return 'text-emerald-600 border-emerald-200 bg-emerald-50';
            case 'Completed': return 'text-neutral-600 border-neutral-200 bg-neutral-50';
            case 'approved': return 'text-emerald-600 border-emerald-200 bg-emerald-50';
            case 'confirmed': return 'text-blue-600 border-blue-200 bg-blue-50';
            case 'pending': return 'text-amber-600 border-amber-200 bg-amber-50';
            case 'cancelled': 
            case 'Cancelled': return 'text-red-600 border-red-200 bg-red-50';
            case 'rejected': return 'text-neutral-500 border-neutral-200 bg-neutral-50';
            default: return 'text-soft-grey border-border-neutral bg-background-ivory';
        }
    };

    const handleSeat = async (id) => {
        try {
            const token = localStorage.getItem('kuki_admin_token');
            await axios.put(`${API_BASE_URL}/bookings/${id}/seat`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onSuccess('Customer seated!');
            fetchBookings();
        } catch (error) {
            onError('Seating failed');
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="serif-heading text-3xl md:text-4xl text-charcoal capitalize">Table Bookings</h1>
                    <p className="text-soft-grey text-xs md:text-sm mt-1">Manage restaurant reservations and cancellations.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                        <Plus size={16} /> Add Booking
                    </button>
                    <div className="flex-1 sm:flex-none flex items-center gap-2 bg-white border border-primary/10 rounded-xl px-4 h-10 shadow-sm hover:border-primary/30 transition-all">
                        <Filter size={14} className="text-soft-grey" />
                        <select
                            className="bg-transparent bg-none border-none outline-none text-[10px] sm:text-xs text-charcoal font-bold cursor-pointer appearance-none w-full"
                            value={filterStatus}
                            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                        >
                            <option value="All">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-border-neutral overflow-hidden flex flex-col">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[800px] lg:min-w-0">
                        <thead className="bg-background-ivory/50 border-b border-border-neutral">
                            <tr>
                                <th className="p-5 text-[10px] uppercase tracking-widest text-soft-grey font-bold">Booking Details</th>
                                <th className="p-5 text-[10px] uppercase tracking-widest text-soft-grey font-bold">Time & Date</th>
                                <th className="p-5 text-[10px] uppercase tracking-widest text-soft-grey font-bold">Customer</th>
                                <th className="p-5 text-[10px] uppercase tracking-widest text-soft-grey font-bold">Status</th>
                                <th className="p-5 text-right text-[10px] uppercase tracking-widest text-soft-grey font-bold pr-10">View</th>
                                <th className="p-5 text-right text-[10px] uppercase tracking-widest text-soft-grey font-bold pr-16">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-neutral">
                        {loading ? (
                            <tr><td colSpan="6" className="p-20 text-center text-soft-grey animate-pulse italic text-sm">Synchronizing with server...</td></tr>
                        ) : bookings.length === 0 ? (
                            <tr><td colSpan="6" className="p-20 text-center text-soft-grey italic text-sm">No reservations found.</td></tr>
                        ) : (
                            bookings.map((item) => (
                                <tr key={item._id} className="hover:bg-primary/5 transition-colors">
                                    <td className="p-5 text-sm">
                                        <div>
                                            <span className="font-black text-charcoal uppercase tracking-tighter">{item.uniqueBookingId || 'N/A'}</span> <br />
                                            <span className="text-primary text-[10px] font-black uppercase tracking-widest">Table {item.tableId?.tableNumber || '??'}</span>
                                        </div>
                                    </td>
                                    <td className="p-5 text-sm">
                                        <div className="flex items-center gap-1">
                                            <CalendarDays size={14} className="text-primary" />
                                            <span className="font-bold text-charcoal">{new Date(item.date).toLocaleDateString()}</span>
                                        </div>
                                        <span className="text-soft-grey text-xs">@ {item.time}</span>
                                    </td>
                                    <td className="p-5 text-sm">
                                        <div className="font-bold text-charcoal">{item.customerId?.name}</div>
                                        <div className="text-soft-grey text-[10px] font-medium tracking-wider">{item.customerId?.phone} / {item.guests} Pax</div>
                                    </td>
                                    <td className="p-5 text-sm">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColorClass(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="p-5 pr-10 text-right">
                                        <button
                                            onClick={() => setSelectedBooking(item)}
                                            className="p-2 bg-background-ivory text-primary rounded-lg hover:bg-primary/10 transition-all shadow-sm border border-primary/5 inline-flex items-center justify-center"
                                            title="View Details"
                                        >
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                    <td className="p-5 pr-16 text-right">
                                        <div className="flex justify-end">
                                            {(item.status === 'Checked-in') && (
                                                <button
                                                    onClick={() => handleSeat(item._id)}
                                                    className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all text-[10px] font-black uppercase tracking-widest min-w-[80px]"
                                                >
                                                    Seat
                                                </button>
                                            )}
                                            {(item.status === 'Reserved' || item.status === 'confirmed' || item.status === 'pending' || item.status === 'approved') && (
                                                <button
                                                    onClick={() => openCancelModal(item)}
                                                    className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-all text-[10px] font-black uppercase tracking-widest min-w-[80px]"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                            {item.status === 'cancelled' && (
                                                <span className="px-3 py-1.5 bg-neutral-100 text-neutral-400 rounded-lg text-[10px] font-black uppercase tracking-widest min-w-[80px] text-center">
                                                    Locked
                                                </span>
                                            )}
                                            {item.status === 'rejected' && (
                                                <span className="px-3 py-1.5 bg-neutral-100 text-neutral-400 rounded-lg text-[10px] font-black uppercase tracking-widest min-w-[80px] text-center opacity-0">
                                                    -
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
              </div>
            </div>

                {!loading && bookings.length > 0 && (
                    <Pagination
                        currentPage={page}
                        totalPages={paginationData.totalPages}
                        totalRecords={paginationData.totalRecords}
                        limit={limit}
                        onPageChange={(newPage) => setPage(newPage)}
                    />
                )}

            {isAddModalOpen && (
                <div 
                    className="fixed inset-0 bg-transparent z-[9999] p-4 animate-fade-in overflow-y-auto flex justify-center items-center"
                    onClick={() => setIsAddModalOpen(false)}
                >
                    <div 
                        className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl w-full max-w-xl relative border border-primary/10 p-6 md:p-10 my-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button onClick={() => setIsAddModalOpen(false)} className="absolute top-6 right-6 size-10 rounded-full hover:bg-background-ivory flex items-center justify-center text-soft-grey transition-all border border-border-neutral">
                            <X size={20} />
                        </button>

                        <h3 className="serif-heading text-3xl text-charcoal mb-8">Manual Table Booking</h3>

                        <form onSubmit={handleAddBooking} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-primary uppercase tracking-widest ml-1">Customer Name</label>
                                    <input required type="text" value={addFormData.name} onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })} className="w-full h-12 bg-background-ivory/50 border border-primary/10 rounded-xl px-4 text-sm outline-none focus:ring-1 focus:ring-primary" placeholder="John Doe" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-primary uppercase tracking-widest ml-1">Phone Number</label>
                                    <input required type="text" value={addFormData.phone} onChange={(e) => setAddFormData({ ...addFormData, phone: e.target.value })} className="w-full h-12 bg-background-ivory/50 border border-primary/10 rounded-xl px-4 text-sm outline-none focus:ring-1 focus:ring-primary" placeholder="+91..." />
                                </div>
                                <div className="sm:col-span-2 space-y-1">
                                    <label className="text-[10px] font-bold text-primary uppercase tracking-widest ml-1">Email Address</label>
                                    <input required type="email" value={addFormData.email} onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })} className="w-full h-12 bg-background-ivory/50 border border-primary/10 rounded-xl px-4 text-sm outline-none focus:ring-1 focus:ring-primary" placeholder="customer@example.com" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-primary uppercase tracking-widest ml-1">Reservation Date</label>
                                    <input required type="date" value={addFormData.date} onChange={(e) => setAddFormData({ ...addFormData, date: e.target.value })} className="w-full h-12 bg-background-ivory/50 border border-primary/10 rounded-xl px-4 text-sm outline-none focus:ring-1 focus:ring-primary" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-primary uppercase tracking-widest ml-1">Time Slot</label>
                                    <select required value={addFormData.time} onChange={(e) => setAddFormData({ ...addFormData, time: e.target.value })} className="w-full h-12 bg-background-ivory/50 border border-primary/10 rounded-xl px-4 text-sm outline-none focus:ring-1 focus:ring-primary">
                                        {slots.length === 0 ? (
                                            <option value="">No slots configured</option>
                                        ) : (
                                            slots.map(s => <option key={s._id} value={s.time}>{s.time}</option>)
                                        )}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-primary uppercase tracking-widest ml-1">Select Table</label>
                                    <select required value={addFormData.tableId} onChange={(e) => setAddFormData({ ...addFormData, tableId: e.target.value })} className="w-full h-12 bg-background-ivory/50 border border-primary/10 rounded-xl px-4 text-sm outline-none focus:ring-1 focus:ring-primary">
                                        {tables.map(t => (
                                            <option key={t._id} value={t._id}>Table {t.tableNumber} ({t.capacity} Seats)</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-primary uppercase tracking-widest ml-1">Guests</label>
                                    <input required type="number" min="1" value={addFormData.guests} onChange={(e) => setAddFormData({ ...addFormData, guests: e.target.value })} className="w-full h-12 bg-background-ivory/50 border border-primary/10 rounded-xl px-4 text-sm outline-none focus:ring-1 focus:ring-primary" />
                                </div>
                            </div>

                            <button type="submit" disabled={submitting} className="w-full h-14 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2">
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Regular Booking'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <AdminCancelModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                booking={bookingToCancel}
                type="table"
                onSuccess={() => {
                    onSuccess(`Booking successfully cancelled.`);
                    fetchBookings();
                }}
            />

            {/* View Detail Modal */}
            {selectedBooking && (
                <div 
                    className="fixed inset-0 bg-transparent z-[9999] p-4 pt-12 md:pt-24 pb-12 animate-fade-in overflow-y-auto cursor-pointer"
                    onClick={() => setSelectedBooking(null)}
                >
                    <div 
                        className="bg-white rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.1)] w-full max-w-lg relative border border-primary/10 mx-auto flex flex-col max-h-[90vh] overflow-hidden cursor-default"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header - Fixed/Sticky */}
                        <div className="bg-background-ivory/80 backdrop-blur-md px-8 py-6 border-b border-primary/10 flex justify-between items-center sticky top-0 z-10 rounded-t-[2rem]">
                            <div>
                                <h3 className="serif-heading text-2xl text-charcoal">Reservation Details</h3>
                                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-1">ID: {selectedBooking.uniqueBookingId}</p>
                            </div>
                            <button onClick={() => setSelectedBooking(null)} className="size-10 rounded-full hover:bg-white flex items-center justify-center text-soft-grey hover:text-primary transition-all bg-white/50 border border-border-neutral">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Content - Scrollable */}
                        <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-[10px] font-bold text-soft-grey uppercase tracking-widest mb-2 font-black">Customer</p>
                                    <p className="text-sm font-black text-charcoal">{selectedBooking.customerId?.name || 'N/A'}</p>
                                    <p className="text-[11px] text-soft-grey mt-1">{selectedBooking.customerId?.email}</p>
                                    <p className="text-[11px] text-soft-grey">{selectedBooking.customerId?.phone}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-soft-grey uppercase tracking-widest mb-2 font-black">Booking Info</p>
                                    <p className="text-sm font-black text-charcoal">Table {selectedBooking.tableId?.tableNumber || 'N/A'}</p>
                                    <p className="text-[11px] text-soft-grey mt-1">Guests: {selectedBooking.guests} Persons</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-soft-grey uppercase tracking-widest mb-2 font-black">Date & Time</p>
                                    <p className="text-sm font-medium text-charcoal">{new Date(selectedBooking.date).toLocaleDateString()}</p>
                                    <p className="text-xs text-soft-grey italic">Arrival: {selectedBooking.time}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-soft-grey uppercase tracking-widest mb-2 font-black">Status</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColorClass(selectedBooking.status)}`}>
                                        {selectedBooking.status}
                                    </span>
                                </div>
                            </div>

                            {selectedBooking.preOrderId && (
                                <div className="pt-6 border-t border-primary/5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <ShoppingBag size={14} className="text-primary" />
                                        <p className="text-[10px] font-black text-charcoal uppercase tracking-widest">Pre-Order Included</p>
                                    </div>
                                    <div className="p-4 bg-background-ivory/30 rounded-2xl border border-primary/5 flex justify-between items-center">
                                        <p className="text-xs font-medium text-soft-grey">Pre-Order ID: {selectedBooking.preOrderId?.toString().slice(-8)}</p>
                                        <p className="font-black text-primary">₹{selectedBooking.totalAmount || 0}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-6 bg-background-ivory/20 flex gap-4">
                            <button onClick={() => setSelectedBooking(null)} className="flex-1 bg-primary text-white py-3 rounded-xl text-xs font-bold hover:bg-primary-hover transition-all shadow-md">
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBookings;
