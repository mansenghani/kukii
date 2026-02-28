import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, CheckCircle, AlertCircle, Mail, Clock, ShieldCheck, Loader2 } from "lucide-react";

const AdminCancelModal = ({ isOpen, onClose, booking, type, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
    const [otpTimer, setOtpTimer] = useState(600);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [maskedEmail, setMaskedEmail] = useState("");

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setOtpDigits(["", "", "", "", "", ""]);
            setOtpTimer(600);
            setError("");
            setLoading(false);
        }
    }, [isOpen]);

    // Timer logic
    useEffect(() => {
        let timer;
        if (step === 2 && otpTimer > 0) {
            timer = setTimeout(() => {
                setOtpTimer(prev => prev - 1);
            }, 1000);
        }
        return () => clearTimeout(timer);
    }, [step, otpTimer]);

    if (!isOpen || !booking) return null;

    const bookingId = booking.uniqueBookingId || "N/A";
    const customerName = type === 'table' ? (booking.customerId?.name || "N/A") : (booking.name || "N/A");
    const customerEmail = type === 'table' ? (booking.customerId?.email || "") : (booking.email || "");
    const bookingDate = new Date(type === 'table' ? booking.date : booking.eventDate).toLocaleDateString();
    const bookingTime = type === 'table' ? booking.time : booking.timeSlot;

    const handleSendOTP = async () => {
        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("kuki_admin_token");
            const response = await axios.post("/api/admin/cancel/send-otp",
                { bookingId: booking._id, type },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setMaskedEmail(response.data.maskedEmail);
                setStep(2);
                setOtpTimer(600);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("kuki_admin_token");
            await axios.post("/api/admin/cancel/resend-otp",
                { bookingId: booking._id, type },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setOtpTimer(600);
            setOtpDigits(["", "", "", "", "", ""]);
            document.getElementById("otp-0").focus();
        } catch (err) {
            setError("Failed to resend OTP.");
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return; // Only numbers

        const newDigits = [...otpDigits];
        newDigits[index] = value;
        setOtpDigits(newDigits);

        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`).focus();
        }
    };

    const handleVerifyAndCancel = async () => {
        const otpStr = otpDigits.join("");
        if (otpStr.length < 6) {
            setError("Please enter complete 6-digit OTP");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const token = localStorage.getItem("kuki_admin_token");
            const response = await axios.post("/api/admin/cancel/verify-otp",
                { bookingId: booking._id, otp: otpStr, type },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setStep(3);
                if (onSuccess) onSuccess();
            }
        } catch (err) {
            setError(err.response?.data?.message || "Invalid OTP. Please check with customer.");
        } finally {
            setLoading(false);
        }
    };

    const minutes = Math.floor(otpTimer / 60).toString().padStart(2, "0");
    const seconds = (otpTimer % 60).toString().padStart(2, "0");

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-neutral-100">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-100 bg-neutral-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-neutral-800">Cancel Booking</h3>
                            <p className="text-xs text-neutral-500 font-medium tracking-wider uppercase">{type === 'table' ? 'Table Reservation' : 'Private Event'}</p>
                        </div>
                    </div>
                    {step !== 2 && (
                        <button onClick={onClose} className="p-2 hover:bg-neutral-200 rounded-lg transition-colors text-neutral-400 hover:text-neutral-600">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Body Content */}
                <div className="p-8">
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="p-5 bg-neutral-50 rounded-xl border border-neutral-100 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500 font-medium">Booking ID</span>
                                    <span className="font-bold text-neutral-800 tracking-wider text-red-600">{bookingId}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500 font-medium">Customer</span>
                                    <span className="font-bold text-neutral-800">{customerName}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500 font-medium">Date</span>
                                    <span className="font-bold text-neutral-800">{bookingDate}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500 font-medium">Time Slot</span>
                                    <span className="font-bold text-neutral-800">{bookingTime}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500 font-medium">Status</span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-700 tracking-wider">{booking.status}</span>
                                </div>
                            </div>

                            <div className="flex gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                                <p className="text-xs text-red-700 leading-relaxed font-semibold">
                                    This will initiate the cancellation process. An OTP will be sent to the customer for verification.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleSendOTP}
                                    disabled={loading}
                                    className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2 group disabled:opacity-70"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send OTP to Customer"}
                                </button>
                                <button onClick={onClose} className="px-6 h-12 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-xl font-bold transition-all">
                                    Close
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8">
                            <div className="text-center space-y-2">
                                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4 border border-blue-100">
                                    <ShieldCheck className="w-8 h-8 text-blue-500" />
                                </div>
                                <h4 className="text-xl font-bold text-neutral-800">OTP Verification</h4>
                                <p className="text-sm text-neutral-500 leading-relaxed">
                                    ✓ OTP sent to: <span className="font-bold text-neutral-700">{maskedEmail}</span>
                                    <br />Ask customer for the 6-digit code.
                                </p>
                            </div>

                            <div className="flex justify-center gap-3">
                                {otpDigits.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl border-neutral-100 focus:border-red-500 focus:ring-0 transition-all bg-neutral-50"
                                    />
                                ))}
                            </div>

                            <div className="flex items-center justify-center gap-2">
                                <Clock className="w-4 h-4 text-neutral-400" />
                                <span className={`text-sm font-bold tracking-widest ${otpTimer < 60 ? 'text-red-500' : 'text-neutral-500'}`}>
                                    {minutes}:{seconds} remaining
                                </span>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 text-red-500 rounded-lg text-xs font-bold text-center border border-red-100 italic">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-3">
                                <button
                                    onClick={handleVerifyAndCancel}
                                    disabled={loading || otpTimer === 0}
                                    className="w-full h-12 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Cancel Booking"}
                                </button>
                                <button
                                    onClick={handleResendOTP}
                                    disabled={loading}
                                    className="w-full text-sm font-bold text-neutral-500 hover:text-neutral-800 transition-colors uppercase tracking-widest"
                                >
                                    Resend OTP
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="py-8 text-center space-y-6">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto animate-bounce border border-green-100">
                                <CheckCircle className="w-10 h-10 text-green-500" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-2xl font-black text-neutral-800 uppercase tracking-tight">Booking Cancelled!</h4>
                                <p className="text-neutral-500 text-sm font-medium tracking-wider uppercase">{bookingId}</p>
                            </div>
                            <p className="text-neutral-500 text-sm px-4">
                                Confirmation email has been sent to the customer.
                            </p>
                            <button
                                onClick={onClose}
                                className="w-full h-12 bg-neutral-900 hover:bg-black text-white rounded-xl font-bold transition-all shadow-xl"
                            >
                                Close Dashboard
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminCancelModal;
