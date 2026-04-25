import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { ShoppingCart, Plus, Minus, X, Coffee, ImageIcon } from 'lucide-react';

const CustomerMenu = () => {
  const { cafeId, tableNumber } = useParams();
  const navigate = useNavigate();
  const [cafe, setCafe] = useState(null);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState({});
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

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

  const categories = ['All', ...new Set(menu.map(i => i.category))];
  const filtered = activeCategory === 'All' ? menu : menu.filter(i => i.category === activeCategory);

  const addToCart = (item) => {
    setCart(prev => ({ ...prev, [item._id]: { ...item, qty: (prev[item._id]?.qty || 0) + 1 } }));
  };
  const removeFromCart = (itemId) => {
    setCart(prev => {
      const updated = { ...prev };
      if (updated[itemId]?.qty > 1) {
        updated[itemId] = { ...updated[itemId], qty: updated[itemId].qty - 1 };
      } else {
        delete updated[itemId];
      }
      return updated;
    });
  };

  const cartItems = Object.values(cart);
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);

  const placeOrder = async () => {
    if (cartItems.length === 0) return;
    setPlacing(true);
    try {
      const items = cartItems.map(i => ({ name: i.name, price: i.price, qty: i.qty, menuItemId: i._id }));
      const res = await api.post('/orders', { cafeId, tableNumber: parseInt(tableNumber), items });
      toast.success('Order placed! 🎉');
      navigate(`/order/${res.data._id}`);
    } catch {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

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
              <p className="text-xs text-gray-500">Table {tableNumber} • Scan & Order</p>
            </div>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-all
                ${activeCategory === cat ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu items */}
      <div className="px-4 py-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No items available</div>
        ) : (
          filtered.map(item => {
            const qty = cart[item._id]?.qty || 0;
            return (
              <div key={item._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex">
                <div className="flex-1 p-4">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>
                  )}
                  <p className="font-bold text-orange-600 mt-2">₹{item.price}</p>
                  <div className="mt-3">
                    {qty === 0 ? (
                      <button
                        onClick={() => addToCart(item)}
                        className="flex items-center gap-1.5 bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-700 transition-colors"
                      >
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
                      onError={e => { e.target.parentNode.innerHTML = '<div class="w-full h-full bg-orange-50 flex items-center justify-center"><span class="text-2xl">🍽️</span></div>'; }} />
                  ) : (
                    <div className="w-full h-full bg-orange-50 flex items-center justify-center min-h-[100px]">
                      <ImageIcon size={24} className="text-orange-200" />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sticky cart button */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-xl">
          <button
            onClick={() => setShowCart(true)}
            className="w-full bg-orange-600 text-white py-4 rounded-2xl font-semibold flex items-center justify-between px-5 hover:bg-orange-700 transition-colors"
          >
            <span className="bg-orange-500 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">{cartCount}</span>
            <span>View Cart</span>
            <span className="font-bold">₹{cartTotal}</span>
          </button>
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl max-h-[80vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="font-bold text-gray-900 text-lg">Your Cart</h2>
              <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {cartItems.map(item => (
                <div key={item._id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">₹{item.price} each</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => removeFromCart(item._id)}
                      className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200">
                      <Minus size={12} />
                    </button>
                    <span className="font-bold text-gray-900 w-5 text-center">{item.qty}</span>
                    <button onClick={() => addToCart(item)}
                      className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 hover:bg-orange-200">
                      <Plus size={12} />
                    </button>
                    <span className="font-semibold text-gray-900 w-16 text-right">₹{item.price * item.qty}</span>
                  </div>
                </div>
              ))}

              <div className="border-t border-gray-100 pt-4 flex justify-between">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-bold text-orange-600 text-xl">₹{cartTotal}</span>
              </div>

              <button
                onClick={placeOrder}
                disabled={placing}
                className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-700 transition-colors disabled:opacity-60"
              >
                {placing ? 'Placing Order...' : '🍽️ Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerMenu;
