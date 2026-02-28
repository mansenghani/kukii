import React, { useState } from 'react';
import axios from 'axios';
import { Calendar, Clock, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const EventBooking = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        eventDate: '',
        timeSlot: '06:00 PM - 10:00 PM',
        guests: 1,
        specialRequest: ''
    });

    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [errorMessage, setErrorMessage] = useState('');
    const [bookingResult, setBookingResult] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (formData.guests <= 0) {
            setErrorMessage('Guest count must be greater than 0');
            setStatus('error');
            return;
        }

        try {
            setStatus('loading');

            // 1. Check availability
            const checkRes = await axios.get(`/api/events/availability?date=${formData.eventDate}&slot=${formData.timeSlot}`);

            if (checkRes.data && checkRes.data.available === false) {
                setErrorMessage(checkRes.data.reason || 'Time slot not available.');
                setStatus('error');
                return;
            }

            // 2. Submit booking request
            const response = await axios.post('/api/events', formData);

            setBookingResult(response.data);
            setStatus('success');

            // Reset form for next time
            setFormData({
                name: '', phone: '', email: '', eventDate: '', timeSlot: '06:00 PM - 10:00 PM', guests: 1, specialRequest: ''
            });

        } catch (error) {
            console.error("Event booking error:", error);
            let errMsg = 'FAILED TO SUBMIT EVENT BOOKING. PLEASE TRY AGAIN.';

            if (error.response) {
                errMsg = error.response.data?.message || `SERVER ERROR: ${error.response.status}`;
            } else if (error.request) {
                errMsg = 'SERVER UNREACHABLE: Please check your connection.';
            } else {
                errMsg = error.message;
            }

            setErrorMessage(errMsg);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="fade-in bg-background-ivory min-h-screen">
                <section className="pt-20 pb-16 text-center">
                    <div className="max-w-3xl mx-auto px-4">
                        <span className="text-primary font-medium tracking-[0.3em] text-xs uppercase mb-4 block">Private Events</span>
                        <h1 className="serif-heading text-5xl md:text-6xl mb-6 relative inline-block">
                            Host Your Event
                            <span className="absolute bottom-[-15px] left-1/2 -translate-x-1/2 w-20 h-[1.5px] bg-primary"></span>
                        </h1>
                        <p className="text-soft-grey text-lg max-w-xl mx-auto mt-8 font-light leading-relaxed">
                            Reserve KUKI exclusively for your special private gathering.
                        </p>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                        <div className="bg-white p-8 md:p-12 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-border-neutral rounded-sm">
                            <div className="flex flex-col items-center text-center py-6">
                                <div className="w-16 h-16 rounded-full border border-primary flex items-center justify-center mb-8">
                                    <span className="material-symbols-outlined text-3xl text-primary">check</span>
                                </div>
                                <h2 className="serif-heading text-4xl mb-2 text-charcoal">Request Sent!</h2>
                                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary mb-10">PENDING APPROVAL</p>
                                <div className="max-w-md mx-auto space-y-4 mb-12">
                                    <p className="text-soft-grey text-lg leading-relaxed">Your event booking request has been received. Our team will review the details and contact you shortly.</p>
                                    <p className="text-soft-grey text-sm italic font-light">A notification has been sent to {bookingResult?.email || 'your email'}.</p>
                                </div>

                                <div className="w-full mb-12 text-left">
                                    <div className="mb-6">
                                        <h3 className="serif-heading text-xl text-charcoal mb-2">Request Details</h3>
                                        <div className="w-12 h-[1px] bg-primary"></div>
                                    </div>
                                    <div className="bg-background-ivory/50 p-6 rounded-sm border border-border-neutral space-y-4">
                                        <div className="flex justify-between items-center text-sm border-b border-border-neutral/30 pb-3">
                                            <span className="text-soft-grey uppercase tracking-wider text-[10px]">Full Name</span>
                                            <span className="font-bold text-charcoal">{bookingResult?.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm border-b border-border-neutral/30 pb-3">
                                            <span className="text-soft-grey uppercase tracking-wider text-[10px]">Event Date</span>
                                            <span className="font-bold text-charcoal">{bookingResult?.eventDate ? new Date(bookingResult.eventDate).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm border-b border-border-neutral/30 pb-3">
                                            <span className="text-soft-grey uppercase tracking-wider text-[10px]">Time Slot</span>
                                            <span className="font-bold text-charcoal">{bookingResult?.timeSlot}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm border-b border-border-neutral/30 pb-3">
                                            <span className="text-soft-grey uppercase tracking-wider text-[10px]">Guests</span>
                                            <span className="font-bold text-charcoal">{bookingResult?.guests} People</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-soft-grey uppercase tracking-wider text-[10px]">Status</span>
                                            <span className="font-bold text-primary uppercase tracking-widest text-[10px]">{bookingResult?.status}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full h-[1px] bg-border-neutral mb-12"></div>
                                <div className="space-y-6">
                                    <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-charcoal">WANT TO PRE-ARRANGE THE CATERING?</p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <Link to={`/preorder?id=${bookingResult._id}&type=event`} className="inline-block px-10 py-3 bg-primary text-white text-[10px] uppercase font-bold tracking-[0.2em] transition-soft hover:bg-primary-hover rounded-sm text-center shadow-lg shadow-primary/20">
                                            PRE-ORDER FOOD NOW
                                        </Link>
                                        <button onClick={() => navigate('/')} className="inline-block px-10 py-3 border border-border-neutral text-soft-grey text-[10px] uppercase font-bold tracking-[0.2em] transition-soft hover:bg-background-ivory rounded-sm text-center">
                                            SKIP PRE-ORDER
                                        </button>
                                        <button onClick={() => setStatus('idle')} className="inline-block px-10 py-3 border border-border-neutral text-soft-grey text-[10px] uppercase font-bold tracking-[0.2em] transition-soft hover:bg-background-ivory rounded-sm text-center">
                                            NEW EVENT
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="h-full">
                            <div className="sticky top-32">
                                <img alt="KUKI Event Space" className="w-full h-auto object-cover rounded-sm shadow-xl aspect-[4/5] img-hover-scale transition-soft" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVKHtcw5X1cptWKGmP-u9YY1DYDvKCjkNvsVPMjc9uNMnCN6M9tywezTdIdPPIbRdLNgrGj73VwNuMSSkHQslIRfKEU6iJggG9mYV_w1Ls3MaXMLYqdn2npmhq4Ve63-Ae4hMoAT02kB4h_7jJCOvCnnp9rJuCQx3uHi7YhmFAeCOgP5QUmjsqyNuJnLwfcLVuBgzbzDQOj1fAGzPWayKSf5b0Uh3CbOeyRka_zmBN7IXQZKpjWyf2xaF15dU0qdGwLcyj9L5RrqM" />
                                <div className="mt-8 border-l-2 border-primary pl-6 bg-white/50 p-6 rounded-r-sm">
                                    <p className="serif-heading italic text-xl text-charcoal">"Transforming special moments into unforgettable memories with bespoke service and culinary excellence."</p>
                                    <p className="mt-2 text-xs uppercase tracking-widest text-primary font-bold">— Events Director</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="fade-in bg-background-ivory min-h-screen">
            <section className="pt-20 pb-16 text-center">
                <div className="max-w-3xl mx-auto px-4">
                    <span className="text-primary font-medium tracking-[0.3em] text-xs uppercase mb-4 block">Private Events</span>
                    <h1 className="serif-heading text-5xl md:text-6xl mb-6 relative inline-block">
                        Host Your Event
                        <span className="absolute bottom-[-15px] left-1/2 -translate-x-1/2 w-20 h-[1.5px] bg-primary"></span>
                    </h1>
                    <p className="text-soft-grey text-lg max-w-xl mx-auto mt-8 font-light leading-relaxed">
                        Reserve KUKI exclusively for your special private gathering.
                    </p>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    {/* Event Form Column */}
                    <div className="bg-white p-8 md:p-12 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-border-neutral rounded-sm">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Full Name */}
                                <div className="flex flex-col">
                                    <label className="text-xs uppercase tracking-widest text-charcoal font-semibold mb-2" htmlFor="name">Full Name</label>
                                    <input value={formData.name} onChange={handleChange} className="border border-border-neutral rounded-sm p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-background-ivory" id="name" name="name" placeholder="John Doe" required type="text" />
                                </div>
                                {/* Phone Number */}
                                <div className="flex flex-col">
                                    <label className="text-xs uppercase tracking-widest text-charcoal font-semibold mb-2" htmlFor="phone">Phone Number</label>
                                    <input value={formData.phone} onChange={handleChange} className="border border-border-neutral rounded-sm p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-background-ivory" id="phone" name="phone" placeholder="+1 (234) 567-890" required type="tel" />
                                </div>
                            </div>

                            {/* Email Address */}
                            <div className="flex flex-col">
                                <label className="text-xs uppercase tracking-widest text-charcoal font-semibold mb-2" htmlFor="email">Email Address</label>
                                <input value={formData.email} onChange={handleChange} className="border border-border-neutral rounded-sm p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-background-ivory" id="email" name="email" placeholder="john@example.com" required type="email" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Date */}
                                <div className="flex flex-col">
                                    <label className="text-xs uppercase tracking-widest text-charcoal font-semibold mb-2" htmlFor="eventDate">Event Date</label>
                                    <input value={formData.eventDate} onChange={handleChange} className="border border-border-neutral rounded-sm p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-background-ivory" id="eventDate" name="eventDate" required type="date" min={new Date().toISOString().split('T')[0]} />
                                </div>
                                {/* Time Slot */}
                                <div className="flex flex-col">
                                    <label className="text-xs uppercase tracking-widest text-charcoal font-semibold mb-2" htmlFor="timeSlot">Time Slot</label>
                                    <select value={formData.timeSlot} onChange={handleChange} className="border border-border-neutral rounded-sm p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-background-ivory" id="timeSlot" name="timeSlot">
                                        <option value="10:00 AM - 02:00 PM">10:00 AM - 02:00 PM</option>
                                        <option value="06:00 PM - 10:00 PM">06:00 PM - 10:00 PM</option>
                                    </select>
                                </div>
                            </div>

                            {/* Number of Guests */}
                            <div className="flex flex-col">
                                <label className="text-xs uppercase tracking-widest text-charcoal font-semibold mb-2" htmlFor="guests">Number of Guests</label>
                                <input value={formData.guests} onChange={handleChange} className="border border-border-neutral rounded-sm p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-background-ivory" id="guests" name="guests" required type="number" min="1" />
                            </div>

                            {/* Special Requests */}
                            <div className="flex flex-col">
                                <label className="text-xs uppercase tracking-widest text-charcoal font-semibold mb-2" htmlFor="specialRequest">Special Requests (Optional)</label>
                                <textarea value={formData.specialRequest} onChange={handleChange} className="border border-border-neutral rounded-sm p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-background-ivory resize-none" id="specialRequest" name="specialRequest" placeholder="Decorations, dietary needs, or special seating..." rows="4"></textarea>
                            </div>

                            {errorMessage && <div className="text-red-500 text-sm flex gap-2"><AlertCircle size={16} />{errorMessage}</div>}

                            {/* Submit Button */}
                            <div className="pt-4">
                                <button disabled={status === 'loading'} className={`w-full bg-primary hover:bg-primary-hover text-white py-4 px-8 rounded-sm text-sm font-bold uppercase tracking-[0.2em] transition-all shadow-md ${status === 'loading' ? 'opacity-70' : 'hover:-translate-y-1'}`} type="submit">
                                    {status === 'loading' ? 'PLEASE WAIT...' : 'REQUEST EVENT BOOKING'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Image Column */}
                    <div className="h-full">
                        <div className="sticky top-32">
                            <img alt="Luxury event space" className="w-full h-auto object-cover rounded-sm shadow-xl aspect-[4/5] hover:scale-[1.02] transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVKHtcw5X1cptWKGmP-u9YY1DYDvKCjkNvsVPMjc9uNMnCN6M9tywezTdIdPPIbRdLNgrGj73VwNuMSSkHQslIRfKEU6iJggG9mYV_w1Ls3MaXMLYqdn2npmhq4Ve63-Ae4hMoAT02kB4h_7jJCOvCnnp9rJuCQx3uHi7YhmFAeCOgP5QUmjsqyNuJnLwfcLVuBgzbzDQOj1fAGzPWayKSf5b0Uh3CbOeyRka_zmBN7IXQZKpjWyf2xaF15dU0qdGwLcyj9L5RrqM" />
                            <div className="mt-8 border-l-2 border-primary pl-6 bg-white/50 p-6 rounded-r-sm">
                                <p className="serif-heading italic text-xl text-charcoal">"Transforming special moments into unforgettable memories with bespoke service and culinary excellence."</p>
                                <p className="mt-2 text-xs uppercase tracking-widest text-primary font-bold">— Events Director</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default EventBooking;
