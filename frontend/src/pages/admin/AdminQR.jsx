import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Download, ExternalLink, RefreshCw, Smartphone, CheckCircle, Edit3, Save } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

const AdminQR = () => {
  const { user } = useAuth();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');

  // UPI state
  const [upiId, setUpiId] = useState('');
  const [upiInput, setUpiInput] = useState('');
  const [editingUpi, setEditingUpi] = useState(false);
  const [savingUpi, setSavingUpi] = useState(false);

  const loadTables = async () => {
    try {
      const [tablesRes, infoRes] = await Promise.all([
        api.get(`/cafe/${user.cafeId}/tables`),
        api.get(`/cafe/${user.cafeId}/info`)
      ]);
      setTables(tablesRes.data);
      const savedUpi = infoRes.data.upiId || '';
      setUpiId(savedUpi);
      setUpiInput(savedUpi);
      if (tablesRes.data.length > 0) {
        const match = tablesRes.data[0].qrUrl.match(/^(https?:\/\/[^/]+)/);
        if (match) setBaseUrl(match[1]);
      }
    } catch {
      toast.error('Failed to load QR codes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTables(); }, [user.cafeId]);

  const regenerateQRs = async () => {
    setRegenerating(true);
    try {
      const res = await api.post(`/cafe/${user.cafeId}/tables/regenerate`);
      setTables(res.data.tables);
      setBaseUrl(res.data.baseUrl);
      toast.success('QR codes regenerated!');
    } catch {
      toast.error('Failed to regenerate QR codes');
    } finally {
      setRegenerating(false);
    }
  };

  const saveUpi = async () => {
    const trimmed = upiInput.trim();
    if (!trimmed) { toast.error('Enter a valid UPI ID'); return; }
    setSavingUpi(true);
    try {
      await api.patch(`/cafe/${user.cafeId}/upi`, { upiId: trimmed });
      setUpiId(trimmed);
      setEditingUpi(false);
      toast.success('UPI ID saved! Customers can now pay via UPI.');
    } catch {
      toast.error('Failed to save UPI ID');
    } finally {
      setSavingUpi(false);
    }
  };

  const downloadQR = (table) => {
    const link = document.createElement('a');
    link.href = table.qrDataUrl;
    link.download = `${user.cafeName}-table-${table.tableNumber}-qr.png`;
    link.click();
    toast.success(`Table ${table.tableNumber} QR downloaded`);
  };

  const downloadAll = () => tables.forEach((t, i) => setTimeout(() => downloadQR(t), i * 300));

  // Generate UPI QR link (for preview in admin)
  const upiPreviewLink = upiId
    ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(user.cafeName)}&cu=INR`
    : null;

  return (
    <AdminLayout title="QR Codes & Payments">
      <div className="space-y-6">

        {/* ──────────── UPI PAYMENT SETUP ──────────── */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-3xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Smartphone size={20} className="text-green-600" />
                <h3 className="font-black text-gray-900 text-lg">UPI Payment Setup</h3>
                <span className="bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">FREE</span>
              </div>
              <p className="text-sm text-gray-500">Customers pay directly to your bank via any UPI app — no fees, instant settlement</p>
            </div>
          </div>

          {!editingUpi && upiId ? (
            // Show saved UPI
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="flex-1 bg-white rounded-2xl p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Your UPI ID</p>
                    <p className="font-black text-gray-900 text-lg">{upiId}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <CheckCircle size={14} className="text-green-500" />
                      <span className="text-xs font-bold text-green-600">Active — customers can pay via UPI</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingUpi(true)}
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl transition-colors"
                  >
                    <Edit3 size={13} /> Edit
                  </button>
                </div>
              </div>
              {upiPreviewLink && (
                <div className="bg-white rounded-2xl p-4 border border-green-200 flex flex-col items-center gap-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Your UPI QR</p>
                  <QRCodeCanvas
                    value={upiPreviewLink}
                    size={100}
                    bgColor="#ffffff"
                    fgColor="#1a1a1a"
                    level="H"
                  />
                  <p className="text-[10px] text-gray-400">Preview only</p>
                </div>
              )}
            </div>
          ) : (
            // Edit UPI form
            <div className="bg-white rounded-2xl p-4 border border-green-200">
              <p className="text-xs font-bold text-gray-500 mb-3">
                Enter your UPI ID (e.g. <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">yourname@paytm</span>, <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">9876543210@upi</span>)
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={upiInput}
                  onChange={e => setUpiInput(e.target.value)}
                  placeholder="yourname@paytm or 9xxxxxxxx@ybl"
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                />
                <button
                  onClick={saveUpi}
                  disabled={savingUpi}
                  className="flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-green-700 transition-colors disabled:opacity-60"
                >
                  <Save size={15} /> {savingUpi ? 'Saving...' : 'Save'}
                </button>
                {upiId && (
                  <button onClick={() => { setEditingUpi(false); setUpiInput(upiId); }} className="px-4 py-3 rounded-xl bg-gray-100 text-gray-600 text-sm font-bold hover:bg-gray-200">
                    Cancel
                  </button>
                )}
              </div>
              <p className="text-[10px] text-gray-400 mt-3">
                ✅ Works with PhonePe, GPay, Paytm, BHIM — customers scan, pay, and confirm. Amount is pre-filled.
              </p>
            </div>
          )}
        </div>

        {/* ──────────── TABLE QR CODES ──────────── */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-sm text-gray-500 font-medium">{tables.length} table QR codes</p>
          <div className="flex items-center gap-2">
            <button
              onClick={regenerateQRs}
              disabled={regenerating}
              className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-900 transition-colors disabled:opacity-60"
            >
              <RefreshCw size={16} className={regenerating ? 'animate-spin' : ''} />
              {regenerating ? 'Regenerating...' : 'Refresh QR'}
            </button>
            {tables.length > 0 && (
              <button onClick={downloadAll} className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-700 transition-colors">
                <Download size={16} /> Download All
              </button>
            )}
          </div>
        </div>

        {baseUrl && (
          <div className={`rounded-2xl p-4 border text-sm ${
            baseUrl.includes('localhost')
              ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
              : 'bg-green-50 border-green-200 text-green-800'
          }`}>
            {baseUrl.includes('localhost') ? (
              <>
                <p className="font-semibold mb-1">⚠️ QR codes point to <code>localhost</code></p>
                <p className="text-xs">Mobile phones can't open localhost URLs. Click <strong>"Refresh QR"</strong> to regenerate with your network IP.</p>
              </>
            ) : (
              <>
                <p className="font-semibold mb-1">✅ QR codes ready for mobile scanning</p>
                <p className="text-xs">Pointing to: <code>{baseUrl}</code></p>
              </>
            )}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading QR codes...</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {tables.map(table => (
              <div key={table._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-3 border-b border-gray-50">
                  <p className="font-semibold text-gray-900 text-sm">Table {table.tableNumber}</p>
                  <p className="text-xs text-gray-400 truncate">{user.cafeName}</p>
                </div>
                <div className="p-3">
                  <img src={table.qrDataUrl} alt={`Table ${table.tableNumber} QR`} className="w-full rounded-xl" />
                </div>
                <div className="px-3 pb-3 space-y-2">
                  <button onClick={() => downloadQR(table)}
                    className="w-full flex items-center justify-center gap-1.5 bg-orange-600 text-white py-2 rounded-xl text-xs font-semibold hover:bg-orange-700 transition-colors">
                    <Download size={13} /> Download
                  </button>
                  <a href={table.qrUrl} target="_blank" rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-1.5 bg-gray-100 text-gray-700 py-2 rounded-xl text-xs font-medium hover:bg-gray-200 transition-colors">
                    <ExternalLink size={13} /> Preview Menu
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminQR;
