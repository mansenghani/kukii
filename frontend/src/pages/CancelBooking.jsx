import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle, AlertCircle } from 'lucide-react';

const CancelBooking = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Find, 2: Details, 3: OTP, 4: Success
    const [type, setType] = useState("");
    const [uniqueId, setUniqueId] = useState("");
    const [bookingData, setBookingData] = useState(null);
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [toast, setToast] = useState({ visible: false, type: 'success', text: '' });

    const showToast = (text, type = 'success') => {
        setToast({ visible: true, type, text });
        setTimeout(() => {
            setToast((prev) => ({ ...prev, visible: false }));
        }, 2800);
    };

    // STEP 1: Find Booking
    const handleFindBooking = async (e) => {
        e.preventDefault();
        if (!type || !uniqueId) {
            showToast("Please select type and enter Booking ID.", 'error');
            return setError("Please select type and enter Booking ID.");
        }
        try {
            setLoading(true);
            setError("");
            const res = await axios.post('/api/cancel/find-booking', { uniqueBookingId: uniqueId, type });
            setBookingData(res.data);
            showToast('Reservation found successfully.');
            setStep(2);
        } catch (err) {
            const msg = err.response?.data?.message || "Booking not found.";
            setError(msg);
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    // STEP 2: Send OTP
    const handleSendOTP = async () => {
        try {
            setLoading(true);
            setError("");
            await axios.post('/api/cancel/send-otp', { uniqueBookingId: uniqueId, type });
            showToast('OTP sent to your registered email.');
            setStep(3);
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to send OTP.";
            setError(msg);
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    // STEP 3: Verify & Cancel
    const handleVerifyAndCancel = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError("");
            await axios.post('/api/cancel/verify-otp', { uniqueBookingId: uniqueId, otp, type });
            showToast('Cancellation confirmed successfully.');
            setStep(4);
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (err) {
            const msg = err.response?.data?.message || "Invalid OTP.";
            setError(msg);
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in bg-background-ivory min-h-screen">
            {toast.visible && (
                <div className="fixed top-24 right-4 z-[70]">
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-sm border shadow-lg text-[10px] font-bold uppercase tracking-widest ${toast.type === 'error'
                            ? 'bg-rose-50 text-rose-500 border-rose-100'
                            : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                        {toast.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                        <span>{toast.text}</span>
                    </div>
                </div>
            )}

            {/* Header Section */}
            <section className="pt-24 pb-12 text-center">
                <div className="max-w-3xl mx-auto px-4">
                    <span className="text-primary font-medium tracking-[0.3em] text-[10px] uppercase mb-4 block">Reservation Management</span>
                    <h1 className="serif-heading text-5xl md:text-6xl mb-6 relative inline-block">
                        Cancellation
                        <span className="absolute bottom-[-15px] left-1/2 -translate-x-1/2 w-20 h-[1.5px] bg-primary"></span>
                    </h1>
                </div>
            </section>

            <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 pb-32">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white p-8 md:p-14 border border-border-neutral rounded-sm shadow-[0_4px_25px_rgba(0,0,0,0.02)]">

                        {step === 1 && (
                            <div className="fade-in">
                                <div className="text-center mb-12">
                                    <h2 className="serif-heading text-3xl text-charcoal mb-4">Locate Your Booking</h2>
                                    <p className="text-soft-grey text-sm font-light italic leading-relaxed">
                                        Please provide the unique ID sent to your email to verify your reservation details.
                                    </p>
                                </div>

                                <form onSubmit={handleFindBooking} className="space-y-8">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-soft-grey px-1">Booking Category</label>
                                            <select
                                                value={type}
                                                onChange={(e) => setType(e.target.value)}
                                                className="w-full h-14 bg-white rounded-sm border border-border-neutral px-6 text-sm focus:border-primary outline-none transition-all appearance-none italic cursor-pointer"
                                            >
                                                <option value="">Select Category</option>
                                                <option value="table">Table Reservation</option>
                                                <option value="event">Private Event</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-soft-grey px-1">Booking Reference ID</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={uniqueId}
                                                    onChange={(e) => setUniqueId(e.target.value.toUpperCase())}
                                                    placeholder="RMS-2025-XXXXXX"
                                                    className="w-full h-14 bg-white rounded-sm border border-border-neutral px-6 text-sm focus:border-primary outline-none transition-all placeholder:opacity-30 tracking-widest"
                                                />
                                                <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-primary opacity-20" size={18} />
                                            </div>
                                        </div>
                                    </div>

                                    {error && <div className="p-4 bg-rose-50 text-rose-500 rounded-sm text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 border border-rose-100 italic"><AlertCircle size={14} /> {error}</div>}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-16 bg-primary hover:bg-primary-hover text-white rounded-sm text-[10px] font-bold uppercase tracking-[0.4em] transition-all shadow-lg shadow-primary/10 flex items-center justify-center gap-4 group"
                                    >
                                        {loading ? "SEARCHING..." : "Find Reservation"}
                                    </button>
                                </form>
                            </div>
                        )}

                        {step === 2 && bookingData && (
                            <div className="fade-in">
                                <div className="text-center mb-12">
                                    <div className="w-16 h-16 rounded-full border border-primary flex items-center justify-center mb-6 mx-auto">
                                        <span className="material-symbols-outlined text-primary text-3xl">check</span>
                                    </div>
                                    <h2 className="serif-heading text-3xl text-charcoal mb-2">Reservation Found</h2>
                                    <p className="text-[10px] font-bold text-primary tracking-widest uppercase">Verified for {bookingData.maskedEmail}</p>
                                </div>

                                <div className="bg-background-ivory/50 rounded-sm p-8 border border-border-neutral space-y-6 mb-12">
                                    <div className="flex justify-between items-center pb-4 border-b border-border-neutral/40">
                                        <span className="text-[9px] font-bold text-soft-grey uppercase tracking-widest">Customer Name</span>
                                        <span className="font-bold text-charcoal text-sm">{bookingData.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-border-neutral/40">
                                        <span className="text-[9px] font-bold text-soft-grey uppercase tracking-widest">Scheduled Date</span>
                                        <span className="font-bold text-charcoal text-sm">{new Date(bookingData.date).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-border-neutral/40">
                                        <span className="text-[9px] font-bold text-soft-grey uppercase tracking-widest">Time Slot</span>
                                        <span className="font-bold text-charcoal text-sm">{bookingData.time}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[9px] font-bold text-soft-grey uppercase tracking-widest">Reservation Status</span>
                                        <span className="text-primary text-[10px] font-black uppercase tracking-widest italic">{bookingData.status}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSendOTP}
                                    disabled={loading}
                                    className="w-full h-16 bg-primary hover:bg-primary-hover text-white rounded-sm text-[10px] font-bold uppercase tracking-[0.4em] transition-all shadow-lg shadow-primary/10 flex items-center justify-center gap-4 group"
                                >
                                    {loading ? "SENDING CODE..." : "Send Verification Code"}
                                </button>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="fade-in text-center">
                                <div className="mb-12">
                                    <div className="w-16 h-16 rounded-full border border-charcoal flex items-center justify-center mb-6 mx-auto">
                                        <span className="material-symbols-outlined text-charcoal text-3xl">shield_lock</span>
                                    </div>
                                    <h2 className="serif-heading text-3xl text-charcoal mb-3">Security Check</h2>
                                    <p className="text-soft-grey text-sm px-4 italic leading-relaxed">
                                        An authentication code was sent to your registered email: <br />
                                        <span className="text-primary font-bold not-italic">{bookingData?.maskedEmail}</span>
                                    </p>
                                </div>

                                <form onSubmit={handleVerifyAndCancel} className="space-y-10">
                                    <div className="flex justify-center">
                                        <input
                                            type="text"
                                            maxLength="6"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                            placeholder="••••••"
                                            className="w-full max-w-[240px] h-16 text-center text-xl font-bold bg-background-ivory rounded-sm border border-border-neutral outline-none focus:border-primary tracking-[0.8em] pl-[0.8em] transition-all text-charcoal shadow-inner"
                                        />
                                    </div>

                                    {error && <div className="p-4 bg-rose-50 text-rose-500 rounded-sm text-[10px] font-bold uppercase tracking-widest flex items-center justify-center border border-rose-100 italic">{error}</div>}

                                    <div className="space-y-6">
                                        <button
                                            type="submit"
                                            disabled={loading || otp.length < 6}
                                            className="w-full h-16 bg-charcoal hover:bg-black text-white rounded-sm text-[10px] font-bold uppercase tracking-[0.4em] transition-all shadow-xl shadow-charcoal/10 disabled:opacity-30"
                                        >
                                            {loading ? "VERIFYING..." : "Confirm Cancellation"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSendOTP}
                                            disabled={loading}
                                            className="text-[9px] font-bold text-soft-grey hover:text-primary uppercase tracking-[0.3em] transition-colors pb-1 border-b border-transparent hover:border-primary"
                                        >
                                            Resend Authentication Code
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="fade-in text-center py-10">
                                <div className="w-24 h-24 rounded-full border border-emerald-500/20 flex items-center justify-center mx-auto mb-10 bg-emerald-50/20">
                                    <CheckCircle size={48} className="text-emerald-500" />
                                </div>
                                <h2 className="serif-heading text-4xl text-charcoal mb-4">Confirmed</h2>
                                <p className="text-soft-grey text-lg font-light italic mb-12 leading-relaxed">
                                    Your reservation has been successfully cancelled. <br />
                                    A confirmation dispatch was sent to your email.
                                </p>

                                <div className="inline-block bg-background-ivory py-4 px-10 border border-border-neutral">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary italic">Returning to home...</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CancelBooking;
