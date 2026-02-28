import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CalendarDays, Filter, ChevronLeft, ChevronRight, Eye, CheckCircle2, XCircle, Utensils } from 'lucide-react';

import Pagination from '../../components/Pagination';

const AdminEvents = ({ onError, onSuccess }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');

    // Pagination states
    const [page, setPage] = useState(1);
    const [limit] = useState(5);
    const [paginationData, setPaginationData] = useState({ totalPages: 1, totalRecords: 0 });

    const [selectedEvent, setSelectedEvent] = useState(null);
    const [preOrder, setPreOrder] = useState(null);
    const [loadingPreOrder, setLoadingPreOrder] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    // Custom confirmation modal state
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, status: null });

    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        eventDate: '',
        timeSlot: '10:00 AM - 02:00 PM',
        guests: 1,
        specialRequest: ''
    });

    const API_URL = '/api/admin/events';

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}?status=${filterStatus}&page=${page}&limit=${limit}`);
            if (res.data.data) {
                setEvents(res.data.data);
                setPaginationData({
                    totalPages: res.data.totalPages,
                    totalRecords: res.data.totalRecords
                });
            } else {
                setEvents(res.data);
            }
        } catch (error) {
            onError('Failed to fetch events');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [filterStatus, page]);

    useEffect(() => {
        if (selectedEvent) {
            fetchPreOrder();
        } else {
            setPreOrder(null);
        }
    }, [selectedEvent]);

    const fetchPreOrder = async () => {
        try {
            setLoadingPreOrder(true);
            const res = await axios.get(`/api/preorders/${selectedEvent._id}`);
            setPreOrder(res.data);
        } catch (err) {
            setPreOrder(null);
        } finally {
            setLoadingPreOrder(false);
        }
    };

    const handleStatusUpdate = (id, status) => {
        setConfirmModal({ isOpen: true, id, status });
    };

    const confirmStatusUpdate = async () => {
        const { id, status } = confirmModal;
        setConfirmModal({ isOpen: false, id: null, status: null });

        try {
            await axios.put(`${API_URL}/${id}/status`, { status });
            onSuccess(`Event successfully ${status}!`);
            fetchEvents();
            if (selectedEvent && selectedEvent._id === id) {
                setSelectedEvent(null);
            }
        } catch (error) {
            onError(`Failed to update event: ${error.response?.data?.message || 'Unknown error'}`);
        }
    };

    const handleAddEvent = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await axios.post(API_URL, formData);
            onSuccess('Event manually added and approved!');
            setShowAddModal(false);
            setFormData({
                name: '', phone: '', email: '', eventDate: '', timeSlot: '10:00 AM - 02:00 PM', guests: 1, specialRequest: ''
            });
            fetchEvents();
        } catch (error) {
            onError(`Failed to add event: ${error.response?.data?.message || 'Unknown error'}`);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'approved': return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
            case 'rejected': return 'bg-rose-50 text-rose-500 border border-rose-100';
            default: return 'bg-amber-50 text-amber-600 border border-amber-100';
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            {/* Header for dynamic actions */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="serif-heading text-4xl text-charcoal capitalize">Events</h1>
                    <p className="text-soft-grey text-sm mt-1">Manage events section of the restaurant.</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-2.5 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-primary-hover transition-all flex items-center gap-2 shadow-sm"
                    >
                        + Add Event
                    </button>
                    <div className="flex items-center gap-2 bg-white border border-primary/10 rounded-xl px-4 h-10 shadow-sm hover:border-primary/30 transition-all">
                        <Filter size={14} className="text-soft-grey" />
                        <select
                            className="bg-transparent bg-none border-none outline-none text-xs text-charcoal font-bold cursor-pointer appearance-none"
                            value={filterStatus}
                            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                        >
                            <option value="All">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-primary/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-background-ivory/50 border-b border-border-neutral">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-bold text-primary uppercase tracking-widest">Client Name</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-primary uppercase tracking-widest">Date & Slot</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-primary uppercase tracking-widest">Guests</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-primary uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-primary uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-neutral/30">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-soft-grey">Loading events...</td>
                                </tr>
                            ) : events.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-soft-grey">No events found matching your criteria.</td>
                                </tr>
                            ) : (
                                events.map(event => (
                                    <tr key={event._id} className="hover:bg-background-ivory/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-charcoal text-sm">{event.name}</div>
                                            <div className="text-xs text-soft-grey">{event.phone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-charcoal text-sm flex items-center gap-1">
                                                <CalendarDays size={14} className="text-primary/70" />
                                                {new Date(event.eventDate).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-soft-grey mt-0.5">{event.timeSlot}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-charcoal">
                                            {event.guests} pax
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusStyle(event.status)}`}>
                                                {event.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedEvent(event)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/5 text-primary rounded-lg hover:bg-primary/10 transition-colors text-xs font-bold uppercase tracking-wider"
                                            >
                                                <Eye size={14} /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!loading && events.length > 0 && (
                    <Pagination
                        currentPage={page}
                        totalPages={paginationData.totalPages}
                        totalRecords={paginationData.totalRecords}
                        limit={limit}
                        onPageChange={(newPage) => setPage(newPage)}
                    />
                )}
            </div>

            {selectedEvent && (
                <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm flex justify-center items-center z-[2000] p-4 animate-fade-in">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar relative border border-primary/10">
                        {/* Header */}
                        <div className="bg-background-ivory/50 px-10 py-8 border-b border-primary/10 flex justify-between items-start">
                            <div className="pr-8">
                                <h3 className="serif-heading text-3xl text-charcoal leading-tight mb-2">Event Details</h3>
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusStyle(selectedEvent.status)}`}>
                                        {selectedEvent.status}
                                    </span>
                                    <span className="text-xs text-soft-grey font-medium">Submitted on {new Date(selectedEvent.createdAt).toLocaleString()}</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedEvent(null)} className="absolute top-6 right-6 size-10 rounded-full hover:bg-white shadow-sm flex items-center justify-center text-soft-grey hover:text-primary transition-all border border-border-neutral">
                                <XCircle size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="px-10 py-8 space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Client Name</p>
                                    <p className="font-bold text-charcoal">{selectedEvent.name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Contact Info</p>
                                    <p className="text-sm font-medium text-charcoal">{selectedEvent.phone}</p>
                                    <p className="text-sm font-medium text-soft-grey">{selectedEvent.email}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Event Date & Time</p>
                                    <p className="text-sm font-bold text-charcoal flex items-center gap-1.5">
                                        <CalendarDays size={14} className="text-primary/70" /> {new Date(selectedEvent.eventDate).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm font-medium text-soft-grey mt-0.5">{selectedEvent.timeSlot}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Guest Size</p>
                                    <p className="font-bold text-charcoal text-xl">{selectedEvent.guests} <span className="text-sm text-soft-grey font-normal">pax</span></p>
                                </div>
                            </div>

                            {selectedEvent.specialRequest && (
                                <div className="bg-background-ivory/50 rounded-xl p-6 border border-primary/5">
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Special Requests</p>
                                    <p className="text-sm text-charcoal leading-relaxed whitespace-pre-wrap">{selectedEvent.specialRequest}</p>
                                </div>
                            )}

                            {preOrder && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 border-b border-primary/10 pb-2">
                                        <Utensils size={16} className="text-primary" />
                                        <h4 className="serif-heading text-xl text-charcoal">Pre-Ordered Catering</h4>
                                    </div>
                                    <div className="bg-white border border-border-neutral rounded-xl overflow-hidden shadow-sm">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-background-ivory/50 font-bold uppercase tracking-wider text-[9px] text-soft-grey">
                                                <tr>
                                                    <th className="px-4 py-3">Item Name</th>
                                                    <th className="px-4 py-3 text-center">Qty</th>
                                                    <th className="px-4 py-3 text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border-neutral/30 font-medium">
                                                {preOrder.items && preOrder.items.map((item, i) => (
                                                    <tr key={i} className="text-charcoal">
                                                        <td className="px-4 py-3">{item.name}</td>
                                                        <td className="px-4 py-3 text-center">{item.quantity}</td>
                                                        <td className="px-4 py-3 text-right">₹{item.total}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-background-ivory/20 font-bold border-t border-border-neutral">
                                                <tr>
                                                    <td colSpan="2" className="px-4 py-3 text-right text-[10px] uppercase text-soft-grey tracking-widest">Grand Total</td>
                                                    <td className="px-4 py-3 text-right text-primary text-sm">₹{preOrder.grandTotal}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                    <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 p-3 rounded-lg border border-emerald-100 text-[10px] font-bold uppercase tracking-widest">
                                        <CheckCircle2 size={14} /> Total including {preOrder.tax ? `₹${preOrder.tax} tax` : 'service charges'}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="px-10 py-6 bg-background-ivory/30 flex justify-end gap-3 border-t border-primary/10">
                            {selectedEvent.status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => handleStatusUpdate(selectedEvent._id, 'rejected')}
                                        className="px-6 py-3 bg-white hover:bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-sm active:scale-95 flex items-center gap-2"
                                    >
                                        <XCircle size={16} /> Reject Event
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(selectedEvent._id, 'approved')}
                                        className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md shadow-primary/20 active:scale-95 flex items-center gap-2"
                                    >
                                        <CheckCircle2 size={16} /> Approve & Reserve Venue
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm flex justify-center items-center z-[3000] p-4 animate-fade-in">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm p-8 text-center border border-primary/10">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${confirmModal.status === 'approved' ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' : 'bg-rose-50 text-rose-500 border border-rose-100'}`}>
                            {confirmModal.status === 'approved' ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
                        </div>
                        <h3 className="serif-heading text-2xl text-charcoal mb-2">Confirm Action</h3>
                        <p className="text-soft-grey text-sm mb-8 font-medium">Are you sure you want to mark this event reservation as <strong className={confirmModal.status === 'approved' ? 'text-emerald-600' : 'text-rose-600'}>{confirmModal.status}</strong>?</p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmModal({ isOpen: false, id: null, status: null })}
                                className="flex-1 py-3 border border-border-neutral text-soft-grey text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-background-ivory transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmStatusUpdate}
                                className={`flex-1 py-3 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 ${confirmModal.status === 'approved' ? 'bg-primary hover:bg-primary-hover shadow-primary/20' : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20'}`}
                            >
                                {confirmModal.status === 'approved' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Event Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm flex justify-center items-center z-[2000] p-4 animate-fade-in">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden relative border border-primary/10 p-10">
                        <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 size-10 rounded-full hover:bg-background-ivory flex items-center justify-center text-soft-grey transition-all border border-border-neutral">
                            <XCircle size={20} />
                        </button>

                        <h3 className="serif-heading text-3xl text-charcoal mb-8">Manual Event Booking</h3>

                        <form onSubmit={handleAddEvent} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-primary uppercase tracking-widest ml-1">Client Name</label>
                                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full h-12 bg-background-ivory/50 border border-primary/10 rounded-xl px-4 text-sm focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-soft-grey/40 font-medium" placeholder="Full name" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-primary uppercase tracking-widest ml-1">Phone</label>
                                    <input type="text" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full h-12 bg-background-ivory/50 border border-primary/10 rounded-xl px-4 text-sm focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-soft-grey/40 font-medium" placeholder="Phone number" />
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <label className="text-[10px] font-bold text-primary uppercase tracking-widest ml-1">Email</label>
                                    <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full h-12 bg-background-ivory/50 border border-primary/10 rounded-xl px-4 text-sm focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-soft-grey/40 font-medium" placeholder="customer@email.com" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-primary uppercase tracking-widest ml-1">Date</label>
                                    <input type="date" required value={formData.eventDate} onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })} className="w-full h-12 bg-background-ivory/50 border border-primary/10 rounded-xl px-4 text-sm focus:ring-1 focus:ring-primary outline-none transition-all" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-primary uppercase tracking-widest ml-1">Slot</label>
                                    <select value={formData.timeSlot} onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })} className="w-full h-12 bg-background-ivory/50 border border-primary/10 rounded-xl px-4 text-sm focus:ring-1 focus:ring-primary outline-none transition-all">
                                        <option value="10:00 AM - 02:00 PM">Morning (10-2)</option>
                                        <option value="06:00 PM - 10:00 PM">Evening (6-10)</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-primary uppercase tracking-widest ml-1">Guests</label>
                                    <input type="number" required min="1" value={formData.guests} onChange={(e) => setFormData({ ...formData, guests: e.target.value })} className="w-full h-12 bg-background-ivory/50 border border-primary/10 rounded-xl px-4 text-sm focus:ring-1 focus:ring-primary outline-none transition-all" />
                                </div>
                            </div>
                            <button type="submit" disabled={submitting} className="w-full h-14 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2">
                                {submitting ? 'Creating...' : 'Create Approved Event'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEvents;
