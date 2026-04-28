import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Plus, Minus, X, Coffee, ImageIcon, Phone, Smartphone, CheckCircle2, ChevronRight } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

const CustomerMenu = () => {
  const { cafeId, tableNumber } = useParams();
  const navigate = useNavigate();

  const [cafe, setCafe] = useState(null);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState({});
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  // Step control: 'menu' | 'phone' | 'upi' | 'placing'
  const [step, setStep] = useState('menu');
  const [showCart, setShowCart] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [menuRes, cafeRes] = await Promise.all([
          api.get(`/menu/${cafeId}`),
          api.get(`/cafe/${cafeId}/info`)
        ]);
        setMenu(menuRes.data);
        setCafe(cafeRes.data);
      } catch {
        toast.error('Failed to load menu');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [cafeId]);

  const planType = cafe?.planType || 500;
  const upiId    = cafe?.upiId || '';
  const hasUpi   = upiId.trim().length > 0;

  const categories = ['All', ...new Set(menu.map(i => i.category))];
  const filtered   = activeCategory === 'All' ? menu : menu.filter(i => i.category === activeCategory);

  const addToCart    = (item) => setCart(prev => ({ ...prev, [item._id]: { ...item, qty: (prev[item._id]?.qty || 0) + 1 } }));
  const removeFromCart = (itemId) => setCart(prev => {
    const u = { ...prev };
    if (u[itemId]?.qty > 1) u[itemId] = { ...u[itemId], qty: u[itemId].qty - 1 };
    else delete u[itemId];
    return u;
  });

  const cartItems = Object.values(cart);
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);

  // UPI deep link — amount is pre-filled so customer just confirms
  const upiLink = hasUpi
    ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(cafe?.cafeName || 'UniteQR')}&am=${cartTotal}&cu=INR&tn=${encodeURIComponent(`Table ${tableNumber} Order`)}`
    : null;

  // ─── Step: user taps "View Cart" → "Place Order" ───────────────────────────
  const handleCheckout = () => {
    setShowCart(false);
    if (planType >= 1000) {
      setStep('phone');       // collect phone first
    } else if (hasUpi) {
      setStep('upi');         // jump to UPI
    } else {
      placeOrder();           // plain order
    }
  };

  const handlePhoneNext = (e) => {
    e.preventDefault();
    if (customerPhone.trim().length < 10) { toast.error('Enter a valid 10-digit phone number'); return; }
    if (hasUpi) setStep('upi');
    else placeOrder();
  };

  const placeOrder = async () => {
    if (placing) return;
    setPlacing(true);
    setStep('placing');
    try {
      const items = cartItems.map(i => ({ name: i.name, price: i.price, qty: i.qty, menuItemId: i._id }));
      const res = await api.post('/orders', {
        cafeId,
        tableNumber: parseInt(tableNumber),
        items,
        customerPhone: customerPhone || null
      });
      toast.success('Order placed! 🎉');
      navigate(`/order/${res.data._id}`);
    } catch {
      toast.error('Failed to place order. Please try again.');
      setStep('menu');
    } finally {
      setPlacing(false);
    }
  };

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3 animate-pulse">
            <Coffee size={24} className="text-orange-600" />
          </div>
          <p className="text-gray-500">Loading menu...</p>
        </div>
      </div>
    );
  }

  // ─── PHONE STEP ─────────────────────────────────────────────────────────────
  if (step === 'phone') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
          <button onClick={() => setStep('menu')} className="text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1 text-sm">
            ← Back to menu
          </button>
          <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Phone size={28} className="text-orange-600" />
          </div>
          <h2 className="text-xl font-black text-gray-900 text-center mb-1">Your Phone Number</h2>
          <p className="text-sm text-gray-500 text-center mb-6">Required for order updates</p>
          <form onSubmit={handlePhoneNext} className="space-y-4">
            <input
              type="tel"
              autoFocus
              maxLength={10}
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="9876543210"
              className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 text-xl font-bold text-center tracking-widest focus:outline-none focus:border-orange-500 transition-colors"
            />
            <button type="submit"
              className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-700 transition-colors">
              Continue <ChevronRight size={18} />
            </button>
          </form>
          <p className="text-xs text-gray-400 text-center mt-4">Your number is only used for order notifications</p>
        </div>
      </div>
    );
  }

  // ─── UPI PAYMENT STEP ───────────────────────────────────────────────────────
  if (step === 'upi') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
        <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white text-center">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Smartphone size={28} />
            </div>
            <h2 className="text-2xl font-black">Pay via UPI</h2>
            <p className="text-green-100 text-sm mt-1">{cafe?.cafeName}</p>
          </div>

          <div className="p-6 space-y-5">
            {/* Amount */}
            <div className="bg-green-50 rounded-2xl p-4 text-center border border-green-100">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Order Total</p>
              <p className="text-5xl font-black text-green-600">₹{cartTotal}</p>
              <p className="text-xs text-gray-400 mt-1">Table {tableNumber} • {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</p>
            </div>

            {/* UPI QR */}
            <div className="flex flex-col items-center gap-3">
              <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 shadow-sm">
                <QRCodeCanvas
                  value={upiLink}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#1a1a1a"
                  level="H"
                  includeMargin
                />
              </div>
              <p className="text-xs text-gray-500 font-medium text-center">
                Scan with <span className="font-bold">PhonePe, GPay, Paytm, BHIM</span> or any UPI app
              </p>
            </div>

            {/* UPI ID manual */}
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Or pay to UPI ID</p>
              <p className="font-black text-gray-900 text-sm break-all">{upiId}</p>
            </div>

            {/* Steps */}
            <div className="space-y-2 text-sm text-gray-600">
              {['Open any UPI app on your phone', `Scan QR or enter UPI ID: ${upiId}`, `Pay exactly ₹${cartTotal}`, 'Tap "I\'ve Paid" below'].map((s, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 font-black text-xs flex items-center justify-center shrink-0">{i + 1}</span>
                  <span className={i === 3 ? 'font-bold text-gray-800' : ''}>{s}</span>
                </div>
              ))}
            </div>

            {/* Confirm button */}
            <button
              onClick={placeOrder}
              disabled={placing}
              className="w-full bg-green-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-3 shadow-xl shadow-green-200"
            >
              <CheckCircle2 size={22} />
              {placing ? 'Placing Order...' : "I've Paid — Place Order"}
            </button>

            <button onClick={() => setStep(planType >= 1000 ? 'phone' : 'menu')}
              className="w-full text-gray-400 text-sm py-2 hover:text-gray-600">
              ← Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── PLACING STEP ───────────────────────────────────────────────────────────
  if (step === 'placing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <p className="text-gray-600 font-semibold">Placing your order...</p>
        </div>
      </div>
    );
  }

  // ─── MENU STEP (main) ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Coffee size={20} className="text-orange-600" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">{cafe?.cafeName || 'Menu'}</h1>
              <p className="text-xs text-gray-500">
                Table {tableNumber} • Scan & Order
                {hasUpi && <span className="ml-2 text-green-600 font-bold">• UPI Pay Available</span>}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-all
                ${activeCategory === cat ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu items */}
      <div className="px-4 py-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No items available</div>
        ) : filtered.map(item => {
          const qty = cart[item._id]?.qty || 0;
          return (
            <div key={item._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex">
              <div className="flex-1 p-4">
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                {item.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>}
                <p className="font-bold text-orange-600 mt-2">₹{item.price}</p>
                <div className="mt-3">
                  {qty === 0 ? (
                    <button onClick={() => addToCart(item)}
                      className="flex items-center gap-1.5 bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-700 transition-colors">
                      <Plus size={14} /> Add
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button onClick={() => removeFromCart(item._id)}
                        className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center hover:bg-orange-200">
                        <Minus size={14} />
                      </button>
                      <span className="font-bold text-gray-900 min-w-[20px] text-center">{qty}</span>
                      <button onClick={() => addToCart(item)}
                        className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center hover:bg-orange-700">
                        <Plus size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="w-28 flex-shrink-0">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover"
                    onError={e => { e.target.parentNode.innerHTML = '<div class="w-full h-full bg-orange-50 flex items-center justify-center min-h-[100px]"><span class="text-2xl">🍽️</span></div>'; }} />
                ) : (
                  <div className="w-full h-full bg-orange-50 flex items-center justify-center min-h-[100px]">
                    <ImageIcon size={24} className="text-orange-200" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky cart button */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-xl">
          <button onClick={() => setShowCart(true)}
            className="w-full bg-orange-600 text-white py-4 rounded-2xl font-semibold flex items-center justify-between px-5 hover:bg-orange-700 transition-colors">
            <span className="bg-orange-500 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">{cartCount}</span>
            <span>View Cart {hasUpi && '• UPI Pay'}</span>
            <span className="font-bold">₹{cartTotal}</span>
          </button>
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl max-h-[85vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="font-bold text-gray-900 text-lg">Your Cart</h2>
              <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <div className="p-5 space-y-4">
              {cartItems.map(item => (
                <div key={item._id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">₹{item.price} each</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => removeFromCart(item._id)} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"><Minus size={12} /></button>
                    <span className="font-bold text-gray-900 w-5 text-center">{item.qty}</span>
                    <button onClick={() => addToCart(item)} className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 hover:bg-orange-200"><Plus size={12} /></button>
                    <span className="font-semibold text-gray-900 w-16 text-right">₹{item.price * item.qty}</span>
                  </div>
                </div>
              ))}

              <div className="border-t border-gray-100 pt-4 flex justify-between">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-bold text-orange-600 text-xl">₹{cartTotal}</span>
              </div>

              {/* UPI notice */}
              {hasUpi && (
                <div className="flex items-center gap-2 bg-green-50 rounded-xl p-3 border border-green-100">
                  <Smartphone size={16} className="text-green-500 shrink-0" />
                  <p className="text-xs text-green-700 font-medium">
                    Pay via UPI (PhonePe, GPay, Paytm) — QR will appear on next screen
                  </p>
                </div>
              )}

              <button
                onClick={handleCheckout}
                className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
              >
                {hasUpi ? <><Smartphone size={20} /> Pay & Place Order</> : '🍽️ Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerMenu;
