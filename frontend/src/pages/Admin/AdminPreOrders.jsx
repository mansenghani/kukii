import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, Eye, CheckCircle2, XCircle, Clock, Utensils } from 'lucide-react';
import Pagination from '../../components/Pagination';

const AdminPreOrders = ({ onError, onSuccess }) => {
    const [preorders, setPreorders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Pagination states
    const [page, setPage] = useState(1);
    const [limit] = useState(5);
    const [paginationData, setPaginationData] = useState({ totalPages: 1, totalRecords: 0 });

    const fetchPreOrders = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/admin/preorders/all?page=${page}&limit=${limit}`);
            if (res.data.data) {
                setPreorders(res.data.data);
                setPaginationData({
                    totalPages: res.data.totalPages,
                    totalRecords: res.data.totalRecords
                });
            } else {
                setPreorders(res.data);
                setPaginationData({ totalPages: 1, totalRecords: res.data.length || 0 });
            }
        } catch (error) {
            onError('Failed to fetch pre-orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPreOrders();
    }, [page]);

    const handleStatusUpdate = async (id, status) => {
        if (!window.confirm(`Mark pre-order as ${status}?`)) return;
        try {
            await axios.put(`/api/admin/preorders/${id}/status`, { status });
            onSuccess(`Pre-order ${status}!`);
            fetchPreOrders();
            setSelectedOrder(null);
        } catch (error) {
            onError('Failed to update pre-order status');
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-primary/5 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-background-ivory/50 border-b border-border-neutral">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-bold text-primary uppercase tracking-widest">Type</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-primary uppercase tracking-widest">Grand Total</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-primary uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-primary uppercase tracking-widest">Created</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-primary uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-neutral/30">
                        {loading ? (
                            <tr><td colSpan="5" className="px-6 py-12 text-center text-soft-grey">Loading...</td></tr>
                        ) : preorders.length === 0 ? (
                            <tr><td colSpan="5" className="px-6 py-12 text-center text-soft-grey">No pre-orders found.</td></tr>
                        ) : preorders.map(order => (
                            <tr key={order._id} className="hover:bg-background-ivory/20 transition-colors">
                                <td className="px-6 py-4 capitalize text-sm font-bold text-charcoal">{order.type}</td>
                                <td className="px-6 py-4 text-sm font-bold text-primary">₹{order.grandTotal}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${order.status === 'approved' ? 'bg-green-50 text-green-600 border-green-100' :
                                        order.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                                            'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs text-soft-grey">{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => setSelectedOrder(order)} className="p-2 hover:text-primary transition-colors">
                                        <Eye size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Component */}
            {!loading && preorders.length > 0 && (
                <Pagination
                    currentPage={page}
                    totalPages={paginationData.totalPages}
                    totalRecords={paginationData.totalRecords}
                    limit={limit}
                    onPageChange={(newPage) => setPage(newPage)}
                />
            )}

            {selectedOrder && (
                <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm flex justify-center items-center z-[2000] p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl p-10 relative border border-primary/10">
                        <button onClick={() => setSelectedOrder(null)} className="absolute top-6 right-6 text-soft-grey hover:text-primary"><XCircle size={24} /></button>
                        <h3 className="serif-heading text-3xl mb-8 flex items-center gap-3">
                            <ShoppingBag className="text-primary" /> Pre-Order Details
                        </h3>

                        {/* Customer & Booking Information */}
                        <div className="grid grid-cols-2 gap-6 mb-8 bg-background-ivory/30 p-5 rounded-2xl border border-primary/5">
                            <div>
                                <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3">Customer Information</h4>
                                {selectedOrder.type === 'table' && selectedOrder.bookingId?.customerId ? (
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-charcoal">{selectedOrder.bookingId.customerId.name}</p>
                                        <p className="text-xs font-medium text-soft-grey">{selectedOrder.bookingId.customerId.phone}</p>
                                        <p className="text-xs text-soft-grey">{selectedOrder.bookingId.customerId.email}</p>
                                    </div>
                                ) : selectedOrder.type === 'event' && selectedOrder.bookingId ? (
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-charcoal">{selectedOrder.bookingId.name}</p>
                                        <p className="text-xs font-medium text-soft-grey">{selectedOrder.bookingId.phone}</p>
                                        <p className="text-xs text-soft-grey">{selectedOrder.bookingId.email}</p>
                                    </div>
                                ) : (
                                    <p className="text-xs text-soft-grey italic">Details unavailable (Booking Deleted)</p>
                                )}
                            </div>

                            <div>
                                <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3">Reservation Details</h4>
                                {selectedOrder.type === 'table' && selectedOrder.bookingId ? (
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-charcoal flex items-center gap-2"><Clock size={14} className="text-primary/70" /> {selectedOrder.bookingId.date ? selectedOrder.bookingId.date.split('T')[0] : 'N/A'}</p>
                                        <p className="text-xs font-medium text-soft-grey pl-5">{selectedOrder.bookingId.time}</p>
                                        <p className="text-xs font-bold text-primary uppercase tracking-widest mt-2 pl-5">TABLE BOOKING</p>
                                    </div>
                                ) : selectedOrder.type === 'event' && selectedOrder.bookingId ? (
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-charcoal flex items-center gap-2"><Clock size={14} className="text-primary/70" /> {selectedOrder.bookingId.eventDate ? selectedOrder.bookingId.eventDate.split('T')[0] : 'N/A'}</p>
                                        <p className="text-xs font-medium text-soft-grey pl-5">{selectedOrder.bookingId.timeSlot}</p>
                                        <p className="text-xs font-bold text-primary uppercase tracking-widest mt-2 pl-5">PRIVATE EVENT</p>
                                    </div>
                                ) : (
                                    <p className="text-xs text-soft-grey italic">Details unavailable</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="border border-border-neutral rounded-xl overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-background-ivory/50">
                                        <tr>
                                            <th className="px-4 py-3 font-bold text-charcoal">Item</th>
                                            <th className="px-4 py-3 font-bold text-charcoal text-center">Qty</th>
                                            <th className="px-4 py-3 font-bold text-charcoal text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-neutral/30">
                                        {selectedOrder.items && selectedOrder.items.map((item, i) => (
                                            <tr key={i}>
                                                <td className="px-4 py-3 font-medium">{item.name}</td>
                                                <td className="px-4 py-3 text-center">{item.quantity}</td>
                                                <td className="px-4 py-3 text-right font-bold tracking-tight">₹{item.total}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-background-ivory/30 font-bold border-t border-border-neutral">
                                        <tr>
                                            <td colSpan="2" className="px-4 py-3 text-right text-soft-grey uppercase text-[10px] tracking-widest">Grand Total</td>
                                            <td className="px-4 py-3 text-right text-primary text-lg">₹{selectedOrder.grandTotal}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            {selectedOrder.status === 'pending' && (
                                <div className="flex gap-4 pt-4">
                                    <button onClick={() => handleStatusUpdate(selectedOrder._id, 'rejected')} className="flex-1 py-3 border border-rose-100 text-rose-500 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-rose-50 transition-colors flex items-center justify-center gap-2"><XCircle size={14} /> Reject</button>
                                    <button onClick={() => handleStatusUpdate(selectedOrder._id, 'approved')} className="flex-1 py-3 bg-primary text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-primary-hover transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"><CheckCircle2 size={14} /> Approve</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPreOrders;
