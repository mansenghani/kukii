import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, CheckCircle, XCircle, Table, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

const LiveOps = ({ onSuccess, onError }) => {
    const [liveData, setLiveData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [checkInId, setCheckInId] = useState('');
    const [processing, setProcessing] = useState(false);

    const fetchLiveOps = async () => {
        try {
            const token = localStorage.getItem('kuki_admin_token');
            const res = await axios.get('/api/dashboard/live-ops', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLiveData(res.data);
        } catch (err) {
            console.error("Live Ops Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLiveOps();
        const interval = setInterval(fetchLiveOps, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const handleCheckIn = async (e) => {
        e.preventDefault();
        if (!checkInId) return;
        setProcessing(true);
        try {
            const token = localStorage.getItem('kuki_admin_token');
            await axios.post('/api/bookings/check-in', { bookingId: checkInId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onSuccess('Check-in successful!');
            setCheckInId('');
            fetchLiveOps();
        } catch (err) {
            onError(err.response?.data?.message || 'Check-in failed');
        } finally {
            setProcessing(false);
        }
    };

    const handleSeat = async (id) => {
        try {
            const token = localStorage.getItem('kuki_admin_token');
            await axios.put(`/api/bookings/${id}/seat`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onSuccess('Customer seated!');
            fetchLiveOps();
        } catch (err) {
            onError('Seating failed');
        }
    };

    if (loading) return <div className="p-10 text-center text-soft-grey animate-pulse">Loading Live Operations...</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatBox label="Reserved" value={liveData.activeBookings.length} icon={<Clock className="text-amber-500" />} />
                <StatBox label="Checked-in" value={liveData.checkedInCount} icon={<CheckCircle className="text-emerald-500" />} />
                <StatBox label="Cancelled" value={liveData.cancelledCount} icon={<XCircle className="text-rose-500" />} />
                <StatBox label="Tables Available" value={`${liveData.availableTables}/${liveData.totalTables}`} icon={<Table className="text-primary" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Check-in Form */}
                <div className="lg:col-span-1 bg-white p-8 rounded-[2rem] border border-primary/10 shadow-sm">
                    <h4 className="serif-heading text-xl text-charcoal mb-4">Quick Check-in</h4>
                    <form onSubmit={handleCheckIn} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-soft-grey uppercase tracking-widest ml-1">Booking ID</label>
                            <input 
                                type="text" 
                                placeholder="KUKI12345" 
                                value={checkInId} 
                                onChange={(e) => setCheckInId(e.target.value.toUpperCase())}
                                className="w-full h-12 bg-background-ivory/50 border border-primary/10 rounded-xl px-4 text-sm outline-none focus:ring-1 focus:ring-primary font-bold uppercase tracking-widest"
                            />
                        </div>
                        <button 
                            disabled={processing}
                            className="w-full h-12 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary-hover transition-all flex items-center justify-center gap-2"
                        >
                            {processing ? <Loader2 className="animate-spin" size={16} /> : 'Process Check-in'}
                        </button>
                    </form>
                </div>

                {/* Active Bookings List */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-primary/10 shadow-sm overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="serif-heading text-xl text-charcoal">Upcoming Reservations</h4>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-full">Today</span>
                    </div>
                    
                    <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                        {liveData.activeBookings.length === 0 ? (
                            <p className="text-center py-10 text-soft-grey italic text-sm">No active reservations for today.</p>
                        ) : (
                            liveData.activeBookings.map((booking) => (
                                <BookingItem 
                                    key={booking._id} 
                                    booking={booking} 
                                    onSeat={() => handleSeat(booking._id)}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatBox = ({ label, value, icon }) => (
    <div className="bg-white p-6 rounded-3xl border border-primary/5 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-background-ivory rounded-2xl">{icon}</div>
        <div>
            <p className="text-[10px] font-bold text-soft-grey uppercase tracking-widest">{label}</p>
            <p className="text-2xl font-black text-charcoal">{value}</p>
        </div>
    </div>
);

const BookingItem = ({ booking, onSeat }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [isLate, setIsLate] = useState(false);

    useEffect(() => {
        const calculateTime = () => {
            const now = new Date();
            const slotTime = new Date(booking.date);
            
            // Correctly parse AM/PM or 24h format
            let hours = 0;
            let minutes = 0;
            const timeStr = booking.time.toLowerCase();
            
            if (timeStr.includes('am') || timeStr.includes('pm')) {
                const match = timeStr.match(/(\d+):(\d+)\s*(am|pm)/);
                if (match) {
                    hours = parseInt(match[1]);
                    minutes = parseInt(match[2]);
                    const period = match[3];
                    if (period === 'pm' && hours < 12) hours += 12;
                    if (period === 'am' && hours === 12) hours = 0;
                }
            } else {
                const [h, m] = timeStr.split(':');
                hours = parseInt(h);
                minutes = parseInt(m);
            }

            slotTime.setHours(hours, minutes, 0, 0);
            const diff = slotTime.getTime() - now.getTime();
            
            if (diff < 0) {
                const lateMin = Math.floor(Math.abs(diff) / 60000);
                setTimeLeft(`${lateMin}m LATE`);
                setIsLate(true);
            } else {
                const minLeft = Math.floor(diff / 60000);
                if (minLeft > 60) {
                    setTimeLeft(`${Math.floor(minLeft/60)}h ${minLeft%60}m`);
                } else {
                    setTimeLeft(`${minLeft}m left`);
                }
                setIsLate(false);
            }
        };

        calculateTime();
        const timer = setInterval(calculateTime, 60000);
        return () => clearInterval(timer);
    }, [booking]);

    return (
        <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${isLate ? 'bg-rose-50 border-rose-100' : 'bg-background-ivory/30 border-primary/5'}`}>
            <div className="flex items-center gap-4">
                <div className={`size-10 rounded-full flex items-center justify-center font-bold text-xs ${isLate ? 'bg-rose-100 text-rose-600' : 'bg-primary/10 text-primary'}`}>
                    {booking.name ? booking.name[0] : 'G'}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-charcoal">{booking.name || 'Guest'}</p>
                        <span className="text-[10px] font-black text-primary uppercase tracking-tighter">ID: {booking.uniqueBookingId}</span>
                    </div>
                    <p className="text-[10px] text-soft-grey font-medium uppercase tracking-widest">
                        {booking.isEvent ? (
                            <span className="text-primary font-bold">PRIVATE EVENT • {booking.guests} Pax • {booking.time}</span>
                        ) : (
                            `Table ${booking.tableId?.tableNumber || '??'} • ${booking.guests} Pax • ${booking.time}`
                        )}
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <div className={`text-right ${isLate ? 'text-rose-600' : 'text-soft-grey'}`}>
                    {isLate && <AlertCircle size={12} className="inline mr-1 mb-0.5" />}
                    <span className="text-[10px] font-black uppercase tracking-widest">{timeLeft}</span>
                </div>
                {booking.status === 'Checked-in' && (
                    <button 
                        onClick={onSeat}
                        className="px-4 py-2 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-emerald-600 transition-all shadow-sm"
                    >
                        Seat Guest
                    </button>
                )}
            </div>
        </div>
    );
};

export default LiveOps;
