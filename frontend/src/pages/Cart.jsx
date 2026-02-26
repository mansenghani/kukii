import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ArrowRight, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cart, totalAmount, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
        <div style={{ backgroundColor: 'var(--white)', padding: '60px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow)' }}>
          <ShoppingCart size={64} color="var(--text-muted)" style={{ marginBottom: '20px' }} />
          <h2 style={{ marginBottom: '10px' }}>Your cart is empty</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Looks like you haven't added any delicious dishes yet.</p>
          <Link to="/menu" className="btn-primary">Browse Menu</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '60px 20px' }}>
      <h2 className="section-title">Your <span className="text-primary">Pre-Order Cart</span></h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px' }}>
        {/* Cart Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {cart.map(item => (
            <div key={item._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '15px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-beige)', overflow: 'hidden' }}>
                {item.image && <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div style={{ flexGrow: 1 }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{item.name}</h3>
                <p style={{ color: 'var(--primary)', fontWeight: 700 }}>${item.price}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: 'var(--bg-cream)', padding: '5px 15px', borderRadius: '30px' }}>
                <button onClick={() => updateQuantity(item._id, item.quantity - 1)} style={{ color: 'var(--text-muted)' }}><Minus size={16} /></button>
                <span style={{ fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                <button onClick={() => updateQuantity(item._id, item.quantity + 1)} style={{ color: 'var(--text-muted)' }}><Plus size={16} /></button>
              </div>
              <button 
                onClick={() => removeFromCart(item._id)}
                style={{ color: '#ff4444', backgroundColor: 'transparent', padding: '10px' }}
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className="card" style={{ position: 'sticky', top: '100px' }}>
            <h3 style={{ marginBottom: '20px', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '10px' }}>Order Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>${totalAmount.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Tax (8%)</span>
              <span style={{ fontWeight: 600 }}>${(totalAmount * 0.08).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', borderTop: '2px solid var(--bg-cream)', paddingTop: '20px', marginBottom: '30px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>Total</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>${(totalAmount * 1.08).toFixed(2)}</span>
            </div>
            <button 
              className="btn-primary" 
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => navigate('/booking')}
            >
              Proceed to Booking <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
