import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Star, MessageSquare, Trash2, Check, X, Eye, X as XClose, Loader2, AlertCircle } from 'lucide-react';

const AdminFeedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [errorMsg, setErrorMsg] = useState('');

    const API_BASE_URL = '/api/admin/feedback';

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const response = await axios.get(API_BASE_URL);
            setFeedbacks(response.data);
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
            setErrorMsg('Failed to sync feedback data from server.');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm('Approve this review for public display?')) return;
        try {
            await axios.put(`${API_BASE_URL}/${id}/approve`);
            fetchFeedbacks();
            if (selectedFeedback?._id === id) setSelectedFeedback(null);
        } catch (error) {
            alert('Failed to approve');
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Reject this review?')) return;
        try {
            await axios.put(`${API_BASE_URL}/${id}/reject`);
            fetchFeedbacks();
            if (selectedFeedback?._id === id) setSelectedFeedback(null);
        } catch (error) {
            alert('Failed to reject');
        }
    };

    const deleteFeedback = async (id) => {
        if (!window.confirm('Permanently delete this review from system?')) return;
        try {
            // Re-using the base feedback route for absolute deletion
            await axios.delete(`/api/feedback/${id}`);
            fetchFeedbacks();
        } catch (error) {
            alert('Delete failed');
        }
    };

    const renderStars = (rating) => {
        return (
            <div className="flex gap-0.5 text-primary">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < rating ? 'fill-primary' : 'text-gray-200'} />
                ))}
            </div>
        );
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-50 text-green-600 border-green-100';
            case 'rejected': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-amber-50 text-amber-600 border-amber-100';
        }
    };

    const filteredFeedbacks = feedbacks.filter(f => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = f.name.toLowerCase().includes(query) ||
            (f.message || '').toLowerCase().includes(query) ||
            f.email.toLowerCase().includes(query);
        const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="animate-fade-in font-sans">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="serif-heading text-4xl text-charcoal tracking-tight">Guest Feedback</h2>
                    <p className="text-soft-grey text-sm mt-1">Review, approve, or moderate customer stories.</p>
                </div>
                <div className="relative w-full md:w-96 flex gap-4">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search names, emails..."
                            className="w-full bg-white border border-border-neutral rounded-xl pl-11 pr-4 py-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all shadow-sm outline-none"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                    <button onClick={fetchFeedbacks} className="p-3 bg-white border border-border-neutral rounded-xl hover:bg-primary/5 transition-colors text-soft-grey hover:text-primary">
                        <svg className={`size-5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                </div>
            </div>

            {errorMsg && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-800 mb-8 italic text-sm">
                    <AlertCircle size={18} /> {errorMsg}
                </div>
            )}

            <div className="flex gap-2 mb-8 items-center overflow-x-auto pb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-soft-grey mr-2">Filters:</span>
                {['all', 'pending', 'approved', 'rejected'].map(status => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap ${statusFilter === status
                            ? 'bg-primary text-white border-primary shadow-md'
                            : 'bg-white text-soft-grey border-border-neutral hover:border-primary/40'
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            <section className="bg-white border border-border-neutral rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-background-ivory/50 border-b border-border-neutral">
                                <th className="px-6 py-5 text-[10px] uppercase tracking-widest text-soft-grey font-extrabold italic">Guest Identity</th>
                                <th className="px-6 py-5 text-[10px] uppercase tracking-widest text-soft-grey font-extrabold italic">Rating Score</th>
                                <th className="px-6 py-5 text-[10px] uppercase tracking-widest text-soft-grey font-extrabold italic">Experience Preview</th>
                                <th className="px-6 py-5 text-[10px] uppercase tracking-widest text-soft-grey font-extrabold italic">Lifecycle</th>
                                <th className="px-6 py-5 text-[10px] uppercase tracking-widest text-soft-grey font-extrabold italic text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-neutral/30">
                            {loading ? (
                                <tr><td colSpan="5" className="text-center py-20"><Loader2 className="animate-spin inline-block mr-2 text-primary" /> Synchronizing...</td></tr>
                            ) : filteredFeedbacks.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-20 text-soft-grey italic text-sm">No testimonials matching your filter.</td></tr>
                            ) : (
                                filteredFeedbacks.map((item) => (
                                    <tr key={item._id} className="hover:bg-primary/[0.02] transition-colors group">
                                        <td className="px-6 py-6 border-l-2 border-transparent group-hover:border-primary transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="size-11 rounded-2xl bg-background-ivory flex items-center justify-center text-primary font-serif text-lg border border-primary/10">
                                                    {item.name.substring(0, 1).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-charcoal">{item.name}</div>
                                                    <div className="text-[10px] text-soft-grey italic">{item.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            {renderStars(item.rating)}
                                            <div className="text-[10px] font-bold text-soft-grey mt-1 tracking-tighter">
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <p className="text-xs text-charcoal/70 max-w-sm truncate italic">"{item.message}"</p>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${getStatusStyle(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                                {item.status === 'pending' && (
                                                    <div className="flex gap-1">
                                                        <button onClick={() => handleApprove(item._id)} className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm" title="Approve">
                                                            <Check size={16} strokeWidth={3} />
                                                        </button>
                                                        <button onClick={() => handleReject(item._id)} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm" title="Reject">
                                                            <X size={16} strokeWidth={3} />
                                                        </button>
                                                    </div>
                                                )}
                                                <button onClick={() => setSelectedFeedback(item)} className="p-2.5 bg-background-ivory text-primary rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm" title="Examine Review">
                                                    <Eye size={16} strokeWidth={2.5} />
                                                </button>
                                                <button onClick={() => deleteFeedback(item._id)} className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-charcoal hover:text-white transition-all" title="Purge Record">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Modal */}
            {selectedFeedback && (
                <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-md flex items-center justify-center z-[1000] p-6 animate-fade-in">
                    <article className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-white/10">
                        <header className="px-10 pt-10 pb-6 flex justify-between items-start">
                            <div className="space-y-2">
                                <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-extrabold">Examine Story</p>
                                <h1 className="text-4xl serif-heading text-charcoal lowercase italic">Guest Narrative</h1>
                            </div>
                            <button onClick={() => setSelectedFeedback(null)} className="text-soft-grey hover:text-primary transition-colors p-3 hover:bg-background-ivory rounded-2xl">
                                <XClose size={32} />
                            </button>
                        </header>

                        <main className="px-10 py-8 space-y-10">
                            <section className="flex flex-col md:flex-row md:items-center justify-between gap-8 py-8 border-y border-border-neutral/40">
                                <div className="flex items-center gap-6">
                                    <div className="size-20 rounded-3xl bg-background-ivory flex items-center justify-center text-primary font-serif text-3xl border border-primary/5">
                                        {selectedFeedback.name.substring(0, 1).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-charcoal">{selectedFeedback.name}</h2>
                                        <p className="text-sm text-soft-grey italic font-medium">{selectedFeedback.email}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col md:items-end gap-2">
                                    <div className="flex gap-1 text-primary">
                                        {[...Array(5)].map((_, i) => <Star key={i} size={20} className={i < selectedFeedback.rating ? 'fill-primary' : 'text-gray-100'} />)}
                                    </div>
                                    <p className="text-[10px] font-bold text-soft-grey uppercase tracking-widest">
                                        Received: {new Date(selectedFeedback.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-primary/60">Full Experience</h3>
                                <p className="text-charcoal leading-relaxed text-2xl italic font-serif opacity-90">
                                    "{selectedFeedback.message}"
                                </p>
                            </section>
                        </main>

                        <footer className="px-10 py-8 bg-background-ivory/40 border-t border-border-neutral flex flex-col md:flex-row justify-end items-center gap-5">
                            {selectedFeedback.status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => handleReject(selectedFeedback._id)}
                                        className="w-full md:w-auto px-10 py-4 rounded-2xl border-2 border-red-200 text-red-600 font-bold uppercase tracking-widest text-[10px] hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                    >
                                        Reject Narrative
                                    </button>
                                    <button
                                        onClick={() => handleApprove(selectedFeedback._id)}
                                        className="w-full md:w-auto px-10 py-4 rounded-2xl bg-green-600 border-2 border-green-600 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-green-700 transition-all shadow-lg"
                                    >
                                        Authorise for Public
                                    </button>
                                </>
                            )}
                            {selectedFeedback.status !== 'pending' && (
                                <div className="flex items-center gap-4 w-full">
                                    <span className={`flex-1 text-center py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest border ${getStatusStyle(selectedFeedback.status)}`}>
                                        Currently {selectedFeedback.status}
                                    </span>
                                    <button
                                        onClick={() => setSelectedFeedback(null)}
                                        className="px-10 py-4 rounded-2xl bg-charcoal text-white font-bold uppercase tracking-widest text-[10px] hover:bg-black transition-all shadow-xl"
                                    >
                                        Close Details
                                    </button>
                                </div>
                            )}
                        </footer>
                    </article>
                </div>
            )}
        </div>
    );
};

export default AdminFeedback;
