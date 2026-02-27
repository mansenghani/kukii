import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Clock, TrendingUp, Star, Zap, AlertTriangle, Check, X } from 'lucide-react';

const AdminTimeSlots = ({ onError, onSuccess }) => {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bulkValue, setBulkValue] = useState('');

    // Disable Modal State
    const [showDisableModal, setShowDisableModal] = useState(false);
    const [slotToDisable, setSlotToDisable] = useState(null);

    // New Slot State
    const [showNewSlotModal, setShowNewSlotModal] = useState(false);
    const [newSlotTime, setNewSlotTime] = useState('');
    const [newSlotMax, setNewSlotMax] = useState(30);

    useEffect(() => {
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/admin/slots');
            setSlots(res.data);
        } catch (err) {
            if (onError) onError('Failed to load slots');
        } finally {
            setLoading(false);
        }
    };

    const calculateTotalCapacity = () => slots.filter(s => s.isActive).reduce((sum, s) => sum + s.maxTables, 0);
    const calculateActiveSlots = () => slots.filter(s => s.isActive).length;
    const calculatePeakHours = () => slots.filter(s => s.isPeak && s.isActive).length;

    const handleUpdateMax = async (id, newMax) => {
        try {
            await axios.put(`/api/admin/slots/${id}`, { maxTables: newMax });
            fetchSlots();
            if (onSuccess) onSuccess('Capacity updated');
        } catch (err) {
            if (onError) onError('Update failed');
        }
    };

    const handleTogglePeak = async (id) => {
        try {
            await axios.patch(`/api/admin/slots/${id}/peak`);
            fetchSlots();
            if (onSuccess) onSuccess('Peak status toggled');
        } catch (err) {
            if (onError) onError('Failed to toggle peak');
        }
    };

    const handleToggleActive = async (slot) => {
        if (slot.isActive) {
            setSlotToDisable(slot);
            setShowDisableModal(true);
        } else {
            try {
                await axios.patch(`/api/admin/slots/${slot._id}/toggle`);
                fetchSlots();
                if (onSuccess) onSuccess('Slot enabled');
            } catch (err) {
                if (onError) onError('Failed to enable slot');
            }
        }
    };

    const confirmDisable = async () => {
        if (!slotToDisable) return;
        try {
            await axios.patch(`/api/admin/slots/${slotToDisable._id}/toggle`);
            fetchSlots();
            setShowDisableModal(false);
            setSlotToDisable(null);
            if (onSuccess) onSuccess('Slot disabled');
        } catch (err) {
            if (onError) onError('Failed to disable slot');
        }
    };

    const handleBulkUpdate = async () => {
        if (!bulkValue || isNaN(bulkValue)) return;
        try {
            await axios.patch('/api/admin/slots/bulk-update', { maxTables: bulkValue });
            setBulkValue('');
            fetchSlots();
            if (onSuccess) onSuccess(`Bulk update applied: ${bulkValue} tables`);
        } catch (err) {
            if (onError) onError('Bulk update failed');
        }
    };

    const handleAddSlot = async () => {
        if (!newSlotTime) return;
        try {
            await axios.post('/api/admin/slots', { time: newSlotTime, maxTables: newSlotMax });
            setShowNewSlotModal(false);
            setNewSlotTime('');
            fetchSlots();
            if (onSuccess) onSuccess('New slot added');
        } catch (err) {
            if (onError) onError('Failed to add slot');
        }
    };

    return (
        <div className="animate-fade-in space-y-6 text-[#2b2b2b]">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-primary/5 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-soft-grey text-sm font-semibold uppercase tracking-wider">Total Daily Capacity</p>
                        <Table className="text-primary group-hover:rotate-12 transition-transform" />
                    </div>
                    <div className="flex items-end gap-2">
                        <p className="text-3xl font-black text-charcoal">{calculateTotalCapacity()}</p>
                        <p className="text-sm text-soft-grey mb-1 font-medium">Tables total</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-primary/5 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-soft-grey text-sm font-semibold uppercase tracking-wider">Active Time Slots</p>
                        <Clock className="text-primary group-hover:rotate-12 transition-transform" />
                    </div>
                    <div className="flex items-end gap-2">
                        <p className="text-3xl font-black text-charcoal">{calculateActiveSlots()}</p>
                        <p className="text-sm text-soft-grey mb-1 font-medium">Available today</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-primary/5 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-soft-grey text-sm font-semibold uppercase tracking-wider">Peak Hours Configured</p>
                        <TrendingUp className="text-primary group-hover:rotate-12 transition-transform" />
                    </div>
                    <div className="flex items-end gap-2">
                        <p className="text-3xl font-black text-charcoal">{calculatePeakHours()}</p>
                        <p className="text-sm text-soft-grey mb-1 font-medium">Hours total</p>
                    </div>
                </div>
            </div>

            {/* Settings Table Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-primary/5 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-background-ivory border-b border-primary/10">
                                <th className="px-6 py-4 text-[10px] font-bold text-soft-grey uppercase tracking-widest">Time Slot</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-soft-grey uppercase tracking-widest text-center">Max Tables</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-soft-grey uppercase tracking-widest">Current Bookings</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-soft-grey uppercase tracking-widest">Remaining</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-soft-grey uppercase tracking-widest text-center">Slot Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-soft-grey uppercase tracking-widest text-center">Peak Hour</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-primary/5">
                            {slots.map(slot => {
                                const booked = slot.bookedTables || 0;
                                const max = slot.maxTables || 0;
                                const percentage = max > 0 ? Math.round((booked / max) * 100) : 0;
                                const remaining = Math.max(0, max - booked);

                                let progressColor = 'bg-primary';
                                if (percentage >= 90) progressColor = 'bg-red-500';
                                else if (percentage >= 60) progressColor = 'bg-amber-500';

                                return (
                                    <tr key={slot._id} className={`hover:bg-primary/5 transition-colors group ${!slot.isActive ? 'bg-background-ivory/50 opacity-75 grayscale' : ''}`}>
                                        <td className="px-6 py-5">
                                            <span className="text-base font-bold text-charcoal">{slot.time}</span>
                                        </td>
                                        <td className="px-6 py-5 flex justify-center">
                                            <input
                                                className={`w-20 px-3 py-1.5 rounded-lg border ${percentage >= 90 ? 'border-red-500 bg-red-50 text-red-900' : 'border-primary/20 bg-background-ivory text-charcoal'} text-sm font-bold text-center focus:outline-none focus:border-primary transition-all`}
                                                type="number"
                                                value={slot.maxTables}
                                                disabled={!slot.isActive}
                                                onChange={(e) => {
                                                    const newSlots = [...slots];
                                                    const idx = newSlots.findIndex(s => s._id === slot._id);
                                                    newSlots[idx].maxTables = e.target.value;
                                                    setSlots(newSlots);
                                                }}
                                                onBlur={(e) => handleUpdateMax(slot._id, Number(e.target.value))}
                                            />
                                        </td>
                                        <td className="px-6 py-5">
                                            {slot.isActive ? (
                                                <div className="flex flex-col gap-1.5 w-40">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-sm font-medium text-charcoal">{booked} Booked</span>
                                                        <span className={`text-[10px] font-extrabold uppercase ${percentage >= 90 ? 'text-red-600' : 'text-primary'}`}>{percentage}% Occupied</span>
                                                    </div>
                                                    <div className="w-full bg-primary/10 h-1 rounded-full overflow-hidden">
                                                        <div className={`${progressColor} h-full transition-all`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-sm font-medium text-soft-grey">{booked} Booked</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            {slot.isActive ? (
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${remaining <= 5 ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                                    {remaining} Available
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-gray-100 text-gray-500 border border-gray-200">
                                                    Disabled
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-center items-center h-full">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        checked={slot.isActive}
                                                        onChange={() => handleToggleActive(slot)}
                                                        className="sr-only"
                                                        type="checkbox"
                                                    />
                                                    <div className={`w-11 h-6 rounded-full transition-colors duration-300 relative ${slot.isActive ? 'bg-primary' : 'bg-gray-300'}`}>
                                                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${slot.isActive ? 'transform translate-x-5' : ''}`}></div>
                                                    </div>
                                                </label>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-center">
                                                <button
                                                    disabled={!slot.isActive}
                                                    onClick={() => handleTogglePeak(slot._id)}
                                                    className={`transform hover:scale-110 transition-transform duration-300 ${slot.isPeak ? 'text-primary' : 'text-gray-300 hover:text-primary'} ${!slot.isActive && 'opacity-50 cursor-not-allowed'}`}
                                                >
                                                    <Star fill={slot.isPeak ? 'currentColor' : 'none'} size={24} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {slots.length === 0 && !loading && (
                                <tr><td colSpan="6" className="p-8 text-center text-soft-grey text-sm">No time slots configured. Please add one.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-6 bg-background-ivory/50 border-t border-primary/10 flex justify-between items-center">
                    <p className="text-sm text-soft-grey font-medium italic">Showing operational hours for Today.</p>
                    <button
                        onClick={() => setShowNewSlotModal(true)}
                        className="px-4 py-2 rounded-lg bg-white border border-primary/10 text-charcoal text-[10px] font-bold uppercase tracking-widest hover:bg-primary/5 transition-all flex items-center gap-2"
                    >
                        Add New Slot +
                    </button>
                </div>
            </div>

            {/* Bulk Actions Banner */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 shadow-sm">
                <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-md">
                        <Zap size={24} />
                    </div>
                    <div>
                        <h4 className="text-lg font-black text-charcoal leading-tight">Bulk Capacity Update</h4>
                        <p className="text-sm text-soft-grey font-medium">Quickly adjust max tables across all active slots.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        className="w-24 px-4 py-2.5 rounded-xl border border-primary/20 bg-white text-charcoal text-sm font-bold focus:outline-none focus:border-primary"
                        placeholder="Value"
                        type="number"
                        value={bulkValue}
                        onChange={(e) => setBulkValue(e.target.value)}
                    />
                    <button
                        onClick={handleBulkUpdate}
                        className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-hover shadow-md transition-all whitespace-nowrap"
                    >
                        Apply to All
                    </button>
                </div>
            </div>

            {/* Disable Notice Modal */}
            {showDisableModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-md rounded-3xl auto shadow-2xl p-8 border border-primary/10 relative">
                        <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-6 mx-auto">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="serif-heading text-2xl text-charcoal text-center mb-2">Disable Time Slot?</h3>
                        <p className="text-sm text-soft-grey text-center mb-8">Existing reservations for {slotToDisable?.time} will not be cancelled, but no new bookings will be allowed.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDisableModal(false)} className="flex-1 px-6 py-3 rounded-xl border border-primary/10 text-charcoal font-bold hover:bg-background-ivory transition-all text-xs tracking-widest uppercase">Cancel</button>
                            <button onClick={confirmDisable} className="flex-1 px-6 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-md transition-all text-xs tracking-widest uppercase">Confirm Disable</button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Slot Modal */}
            {showNewSlotModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-md rounded-3xl auto shadow-2xl p-8 border border-primary/10 relative">
                        <button onClick={() => setShowNewSlotModal(false)} className="absolute top-6 right-6 text-soft-grey hover:text-primary"><X size={24} /></button>
                        <h3 className="serif-heading text-2xl text-charcoal text-center mb-6">Create New Time Slot</h3>
                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-soft-grey mb-2 block">Time string (e.g. "05:00 PM")</label>
                                <input type="text" value={newSlotTime} onChange={e => setNewSlotTime(e.target.value)} className="w-full border border-primary/20 rounded-xl p-3 text-sm focus:border-primary outline-none" placeholder="10:00 AM" />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-soft-grey mb-2 block">Max Capacity</label>
                                <input type="number" value={newSlotMax} onChange={e => setNewSlotMax(e.target.value)} className="w-full border border-primary/20 rounded-xl p-3 text-sm focus:border-primary outline-none" placeholder="30" />
                            </div>
                        </div>
                        <button onClick={handleAddSlot} className="w-full px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover shadow-md transition-all text-xs tracking-widest uppercase">Create Config</button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminTimeSlots;
