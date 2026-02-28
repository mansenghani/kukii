import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { Calendar, Clock, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Booking = () => {
  const { cart, totalAmount, clearCart } = useCart();
  const [tables, setTables] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: '2 People',
    requests: '',
    tableId: '' // We will auto-assign or handle table manually, for now keep logic
  });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [bookingResult, setBookingResult] = useState(null);

  const [slots, setSlots] = useState([]);

  // Time conversion helper
  const convertTo24Hour = (timeStr) => {
    if (!timeStr) return 0;
    const lowerTime = timeStr.toLowerCase().trim();
    let hours = 0;
    let minutes = 0;

    if (lowerTime.includes('am') || lowerTime.includes('pm')) {
      const match = lowerTime.match(/(\d+):?(\d+)?\s*(am|pm)/);
      if (match) {
        let h = parseInt(match[1]);
        const m = parseInt(match[2] || '0');
        const period = match[3];
        if (period === 'pm' && h < 12) h += 12;
        if (period === 'am' && h === 12) h = 0;
        hours = h;
        minutes = m;
      }
    } else {
      const match = lowerTime.match(/(\d+):(\d+)/);
      if (match) {
        hours = parseInt(match[1]);
        minutes = parseInt(match[2]);
      } else {
        hours = parseInt(timeStr) || 0;
      }
    }
    return hours + (minutes / 60);
  };

  // Dynamically filter slots based on selected date and current time
  const getFilteredSlots = () => {
    if (!formData.date) return slots;

    const today = new Date();
    // Normalize safely to local date string matching input type="date"
    const localToday = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

    // If selected date is today, hide past slots
    if (formData.date === localToday) {
      const currentHours = today.getHours() + (today.getMinutes() / 60);
      return slots.filter(slot => convertTo24Hour(slot.time) > currentHours);
    }

    // If future date, return all active slots
    return slots;
  };

  const availableSlots = getFilteredSlots();

  // Reset time if user selects a date where the current selected time is already past
  useEffect(() => {
    if (availableSlots.length > 0) {
      const isTimeAvailable = availableSlots.some(s => s.time === formData.time);
      if (!formData.time || !isTimeAvailable) {
        setFormData(prev => ({ ...prev, time: availableSlots[0].time }));
      }
    } else if (slots.length > 0 && formData.date) {
      setFormData(prev => ({ ...prev, time: '' }));
    }
  }, [formData.date, slots]); // Reacts only when date changes or slots load

  useEffect(() => {
    fetchTables();
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const res = await axios.get('/api/slots');
      let activeSlots = res.data.filter(s => s.isActive);

      // Sort slots chronologically using the 24-hour converter
      activeSlots.sort((a, b) => convertTo24Hour(a.time) - convertTo24Hour(b.time));

      setSlots(activeSlots);
      if (activeSlots.length > 0) {
        setFormData(prev => ({ ...prev, time: activeSlots[0].time }));
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
    }
  };

  const fetchTables = async () => {
    try {
      const res = await axios.get('/api/tables');
      setTables(res.data);
      if (res.data.length > 0) {
        setFormData(prev => ({ ...prev, tableId: res.data[0]._id }));
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSkipPreOrder = async () => {
    try {
      if (!bookingResult || !bookingResult._id) {
        setErrorMessage("Critical Error: Booking reference lost. Please try again.");
        return;
      }

      console.log("Skipping preorder for booking:", bookingResult._id);

      await axios.put(`/api/bookings/${bookingResult._id}/preorder-status`, { status: "skipped" });

      // Clear form and state
      setFormData({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: slots.length > 0 ? slots[0].time : '',
        guests: '2 People',
        requests: '',
        tableId: tables.length > 0 ? tables[0]._id : ''
      });
      setBookingResult(null);
      setStatus("idle");

      // Show success message as a notification
      setErrorMessage("SUCCESS: Reservation request finalized. We will notify you once approved!");
      setTimeout(() => setErrorMessage(""), 8000);
    } catch (error) {
      console.error("Error skipping preorder:", error);
      const msg = error.response?.data?.message || "Failed to finalize booking preferences.";
      setErrorMessage(`Error: ${msg}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      // 1. Create/Find Customer
      const customerRes = await axios.post('/api/customers', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      });

      const customerId = customerRes.data._id;

      let guestNumber = parseInt(formData.guests.replace(/\D/g, '')) || 2;

      // 2. Create Booking
      const bookingRes = await axios.post('/api/bookings', {
        customerId,
        tableId: formData.tableId,
        date: formData.date,
        time: formData.time,
        guests: guestNumber
      });

      const booking = bookingRes.data;
      // create fake reservation ID for display
      booking.reservationId = "KK-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);
      setBookingResult(booking);
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.response?.data?.message || 'Something went wrong. Please check if your database is running.');
    }
  };

  if (status === 'success') {
    return (
      <div className="fade-in">
        <section className="pt-20 pb-16 text-center" data-purpose="hero-section">
          <div className="max-w-3xl mx-auto px-4">
            <span className="text-primary font-medium tracking-[0.3em] text-xs uppercase mb-4 block">Reservations</span>
            <h1 className="serif-heading text-5xl md:text-6xl mb-6 relative inline-block">
              Book Your Table
              <span className="absolute bottom-[-15px] left-1/2 -translate-x-1/2 w-20 h-[1.5px] bg-primary"></span>
            </h1>
            <p className="text-soft-grey text-lg max-w-xl mx-auto mt-8 font-light leading-relaxed">
              Reserve your table for an unforgettable fine dining experience. We look forward to welcoming you to KUKI.
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="bg-white p-8 md:p-12 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-border-neutral rounded-sm" data-purpose="reservation-success-container">
              <div className="flex flex-col items-center text-center py-6">
                <div className="w-16 h-16 rounded-full border border-primary flex items-center justify-center mb-8">
                  <span className="material-symbols-outlined text-3xl text-primary">check</span>
                </div>
                <h2 className="serif-heading text-4xl mb-2 text-charcoal">Thank you!</h2>
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary mb-10">RESERVATION REQUEST RECEIVED</p>
                <div className="max-w-md mx-auto space-y-4 mb-12">
                  <p className="text-soft-grey text-lg leading-relaxed">Thank you for booking with KUKI. Your reservation is pending confirmation.</p>
                  <p className="text-soft-grey text-sm italic font-light">A confirmation or rejection email will be sent shortly to {formData.email}.</p>
                </div>

                <div className="w-full mb-12 text-left">
                  <div className="mb-6">
                    <h3 className="serif-heading text-xl text-charcoal mb-2">Reservation Summary</h3>
                    <div className="w-12 h-[1px] bg-primary"></div>
                  </div>
                  <div className="bg-background-ivory/50 p-6 rounded-sm border border-border-neutral space-y-4">
                    <div className="flex justify-between items-center text-sm border-b border-border-neutral/30 pb-3">
                      <span className="text-soft-grey uppercase tracking-wider text-[10px]">Reservation ID</span>
                      <span className="font-bold text-charcoal">{bookingResult.reservationId}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-border-neutral/30 pb-3">
                      <span className="text-soft-grey uppercase tracking-wider text-[10px]">Full Name</span>
                      <span className="font-bold text-charcoal">{formData.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-border-neutral/30 pb-3">
                      <span className="text-soft-grey uppercase tracking-wider text-[10px]">Date</span>
                      <span className="font-bold text-charcoal">{new Date(formData.date).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-border-neutral/30 pb-3">
                      <span className="text-soft-grey uppercase tracking-wider text-[10px]">Time</span>
                      <span className="font-bold text-charcoal">{formData.time}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-border-neutral/30 pb-3">
                      <span className="text-soft-grey uppercase tracking-wider text-[10px]">Number of Guests</span>
                      <span className="font-bold text-charcoal">{formData.guests}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm border-b border-border-neutral/30 pb-3">
                      <span className="text-soft-grey uppercase tracking-wider text-[10px]">Table</span>
                      <span className="font-bold text-charcoal">
                        {tables.find(t => t._id === formData.tableId) ? `Table ${tables.find(t => t._id === formData.tableId).tableNumber}` : 'Assigned upon arrival'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-soft-grey uppercase tracking-wider text-[10px]">Contact Number</span>
                      <span className="font-bold text-charcoal">{formData.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="w-full h-[1px] bg-border-neutral mb-12"></div>
                <div className="space-y-6">
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-charcoal">WANT TO SAVE TIME AT THE RESTAURANT?</p>
                  <div className="flex flex-col gap-3 justify-center max-w-xs mx-auto">
                    <Link to={`/preorder?id=${bookingResult._id}&type=table`} className="inline-block px-10 py-4 bg-primary text-white text-[10px] uppercase font-bold tracking-[0.2em] transition-all hover:bg-primary-hover rounded-xl text-center shadow-lg shadow-primary/20">
                      PRE-ORDER FOOD NOW
                    </Link>
                    <button
                      onClick={handleSkipPreOrder}
                      className="inline-block px-10 py-4 border border-primary/20 text-soft-grey text-[10px] uppercase font-bold tracking-[0.2em] transition-all hover:bg-background-ivory rounded-xl text-center"
                    >
                      Skip Preorder / Table Order
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-full" data-purpose="reservation-visual-context">
              <div className="sticky top-32">
                <img alt="Luxury restaurant dining area" className="w-full h-auto object-cover rounded-sm shadow-xl aspect-[4/5] img-hover-scale transition-soft" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVKHtcw5X1cptWKGmP-u9YY1DYDvKCjkNvsVPMjc9uNMnCN6M9tywezTdIdPPIbRdLNgrGj73VwNuMSSkHQslIRfKEU6iJggG9mYV_w1Ls3MaXMLYqdn2npmhq4Ve63-Ae4hMoAT02kB4h_7jJCOvCnnp9rJuCQx3uHi7YhmFAeCOgP5QUmjsqyNuJnLwfcLVuBgzbzDQOj1fAGzPWayKSf5b0Uh3CbOeyRka_zmBN7IXQZKpjWyf2xaF15dU0qdGwLcyj9L5RrqM" />
                <div className="mt-8 border-l-2 border-primary pl-6 bg-white/50 p-6 rounded-r-sm">
                  <p className="serif-heading italic text-xl text-charcoal">"A dining experience that transcends the ordinary, where every detail is meticulously crafted for your pleasure."</p>
                  <p className="mt-2 text-xs uppercase tracking-widest text-primary font-bold">— Executive Chef</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <section className="pt-20 pb-16 text-center" data-purpose="hero-section">
        <div className="max-w-3xl mx-auto px-4">
          <span className="text-primary font-medium tracking-[0.3em] text-xs uppercase mb-4 block">Reservations</span>
          <h1 className="serif-heading text-5xl md:text-6xl mb-6 relative inline-block">
            Book Your Table
            <span className="absolute bottom-[-15px] left-1/2 -translate-x-1/2 w-20 h-[1.5px] bg-primary"></span>
          </h1>
          <p className="text-soft-grey text-lg max-w-xl mx-auto mt-8 font-light leading-relaxed">
            Reserve your table for an unforgettable fine dining experience. We look forward to welcoming you to KUKI.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Reservation Form Column */}
          <div className="bg-white p-8 md:p-12 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-border-neutral rounded-sm" data-purpose="reservation-form-container">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-widest text-charcoal font-semibold mb-2" htmlFor="name">Full Name</label>
                  <input value={formData.name} onChange={handleChange} className="border border-border-neutral rounded-sm p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-background-ivory" id="name" name="name" placeholder="John Doe" required type="text" />
                </div>
                {/* Email Address */}
                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-widest text-charcoal font-semibold mb-2" htmlFor="email">Email Address</label>
                  <input value={formData.email} onChange={handleChange} className="border border-border-neutral rounded-sm p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-background-ivory" id="email" name="email" placeholder="john@example.com" required type="email" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Phone Number */}
                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-widest text-charcoal font-semibold mb-2" htmlFor="phone">Phone Number</label>
                  <input value={formData.phone} onChange={handleChange} className="border border-border-neutral rounded-sm p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-background-ivory" id="phone" name="phone" placeholder="+1 (234) 567-890" required type="tel" />
                </div>
                {/* Number of Guests */}
                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-widest text-charcoal font-semibold mb-2" htmlFor="guests">Guests</label>
                  <select value={formData.guests} onChange={handleChange} className="border border-border-neutral rounded-sm p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-background-ivory" id="guests" name="guests">
                    <option value="1 Person">1 Person</option>
                    <option value="2 People">2 People</option>
                    <option value="3 People">3 People</option>
                    <option value="4 People">4 People</option>
                    <option value="5+ People">5+ People</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date */}
                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-widest text-charcoal font-semibold mb-2" htmlFor="date">Preferred Date</label>
                  <input value={formData.date} onChange={handleChange} className="border border-border-neutral rounded-sm p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-background-ivory" id="date" name="date" required type="date" min={new Date().toISOString().split('T')[0]} />
                </div>
                {/* Time */}
                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-widest text-charcoal font-semibold mb-2" htmlFor="time">Preferred Time</label>
                  <select value={formData.time} onChange={handleChange} className="border border-border-neutral rounded-sm p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-background-ivory" id="time" name="time" required>
                    {availableSlots.length === 0 ? (
                      <option value="">No Slots Available</option>
                    ) : (
                      availableSlots.map((slot) => (
                        <option key={slot._id} value={slot.time}>{slot.time}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {tables.length > 0 && (
                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-widest text-charcoal font-semibold mb-2" htmlFor="tableId">Select Table</label>
                  <select value={formData.tableId} onChange={handleChange} className="border border-border-neutral rounded-sm p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-background-ivory" id="tableId" name="tableId" required>
                    <option value="">Choose a table</option>
                    {tables.map(t => <option key={t._id} value={t._id}>Table {t.tableNumber} (Cap: {t.capacity})</option>)}
                  </select>
                </div>
              )}

              {/* Special Requests */}
              <div className="flex flex-col">
                <label className="text-xs uppercase tracking-widest text-charcoal font-semibold mb-2" htmlFor="requests">Special Requests (Optional)</label>
                <textarea value={formData.requests} onChange={handleChange} className="border border-border-neutral rounded-sm p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-background-ivory resize-none" id="requests" name="requests" placeholder="Allergies, anniversaries, or special seating preferences..." rows="4"></textarea>
              </div>

              {errorMessage && (
                <div className={`p-4 rounded-xl text-sm flex gap-3 items-center ${errorMessage.startsWith('SUCCESS') ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                  {errorMessage.startsWith('SUCCESS') ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                  <span className="font-medium">{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <button disabled={status === 'loading'} className={`w-full bg-primary hover:bg-primary-hover text-white py-4 px-8 rounded-sm text-sm font-bold uppercase tracking-[0.2em] transition-all shadow-md ${status === 'loading' ? 'opacity-70' : 'hover:-translate-y-1'}`} type="submit">
                  {status === 'loading' ? 'PLEASE WAIT...' : 'RESERVE NOW'}
                </button>
              </div>
            </form>
          </div>

          {/* Image Column */}
          <div className="h-full" data-purpose="reservation-visual-context">
            <div className="sticky top-32">
              <img alt="Luxury restaurant dining area" className="w-full h-auto object-cover rounded-sm shadow-xl aspect-[4/5] hover:scale-[1.02] transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVKHtcw5X1cptWKGmP-u9YY1DYDvKCjkNvsVPMjc9uNMnCN6M9tywezTdIdPPIbRdLNgrGj73VwNuMSSkHQslIRfKEU6iJggG9mYV_w1Ls3MaXMLYqdn2npmhq4Ve63-Ae4hMoAT02kB4h_7jJCOvCnnp9rJuCQx3uHi7YhmFAeCOgP5QUmjsqyNuJnLwfcLVuBgzbzDQOj1fAGzPWayKSf5b0Uh3CbOeyRka_zmBN7IXQZKpjWyf2xaF15dU0qdGwLcyj9L5RrqM" />
              {/* Subtle decorative element */}
              <div className="mt-8 border-l-2 border-primary pl-6 bg-white/50 p-6 rounded-r-sm">
                <p className="serif-heading italic text-xl text-charcoal">"A dining experience that transcends the ordinary, where every detail is meticulously crafted for your pleasure."</p>
                <p className="mt-2 text-xs uppercase tracking-widest text-primary font-bold">— Executive Chef</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Booking;
