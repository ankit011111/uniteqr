import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, Check, ImageIcon, ToggleLeft, ToggleRight } from 'lucide-react';

const CATEGORIES = ['Coffee', 'Tea', 'Food', 'Snacks', 'Drinks', 'Desserts', 'Other'];

const emptyForm = { name: '', price: '', category: 'Food', description: '', imageUrl: '', available: true };

const AdminMenu = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState('All');

  const load = async () => {
    try {
      const res = await api.get(`/menu/${user.cafeId}/all`);
      setItems(res.data);
    } catch { toast.error('Failed to load menu'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setShowModal(true); };
  const openEdit = (item) => {
    setForm({ name: item.name, price: item.price, category: item.category, description: item.description || '', imageUrl: item.imageUrl || '', available: item.available });
    setEditingId(item._id);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const res = await api.put(`/menu/${editingId}`, { ...form, price: Number(form.price) });
        setItems(prev => prev.map(i => i._id === editingId ? res.data : i));
        toast.success('Item updated');
      } else {
        const res = await api.post('/menu', { ...form, price: Number(form.price) });
        setItems(prev => [...prev, res.data]);
        toast.success('Item added');
      }
      setShowModal(false);
    } catch { toast.error('Failed to save item'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this item?')) return;
    try {
      await api.delete(`/menu/${id}`);
      setItems(prev => prev.filter(i => i._id !== id));
      toast.success('Item deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const toggleAvailable = async (item) => {
    try {
      const res = await api.put(`/menu/${item._id}`, { available: !item.available });
      setItems(prev => prev.map(i => i._id === item._id ? res.data : i));
    } catch { toast.error('Failed to update'); }
  };

  const categories = ['All', ...CATEGORIES];
  const filtered = filterCat === 'All' ? items : items.filter(i => i.category === filterCat);

  return (
    <AdminLayout title="Menu Management">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{items.length} items total</p>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-700 transition-colors"
          >
            <Plus size={16} /> Add Item
          </button>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-medium transition-colors
                ${filterCat === cat ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Items grid */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading menu...</div>
        ) : (
          <div className="grid gap-3">
            {filtered.map(item => (
              <div key={item._id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex ${!item.available ? 'opacity-50' : ''}`}>
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-cover flex-shrink-0" onError={e => { e.target.style.display = 'none'; }} />
                ) : (
                  <div className="w-24 h-24 bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <ImageIcon size={24} className="text-gray-300" />
                  </div>
                )}
                <div className="flex-1 p-3 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h4>
                      <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">{item.category}</span>
                      {item.description && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.description}</p>}
                    </div>
                    <span className="font-bold text-gray-900 text-sm whitespace-nowrap">₹{item.price}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => toggleAvailable(item)} className="text-gray-400 hover:text-orange-500 transition-colors">
                      {item.available ? <ToggleRight size={20} className="text-green-500" /> : <ToggleLeft size={20} />}
                    </button>
                    <span className="text-xs text-gray-400">{item.available ? 'Available' : 'Unavailable'}</span>
                    <div className="ml-auto flex gap-2">
                      <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(item._id)} className="p-1.5 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">{editingId ? 'Edit Item' : 'Add New Item'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                <input required type="text" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Cappuccino" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                  <input required type="number" min="1" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="120" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select required className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input type="text" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Short description..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input type="url" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="preview" className="mt-2 h-24 w-full object-cover rounded-xl" onError={e => { e.target.style.display='none'; }} />
                )}
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Available</label>
                <button type="button" onClick={() => setForm({ ...form, available: !form.available })}>
                  {form.available ? <ToggleRight size={28} className="text-green-500" /> : <ToggleLeft size={28} className="text-gray-400" />}
                </button>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 disabled:opacity-60 flex items-center justify-center gap-2">
                  <Check size={16} />{saving ? 'Saving...' : 'Save Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminMenu;
