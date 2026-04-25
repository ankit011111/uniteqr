import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Download, ExternalLink, RefreshCw } from 'lucide-react';

const AdminQR = () => {
  const { user } = useAuth();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');

  const loadTables = async () => {
    try {
      const res = await api.get(`/cafe/${user.cafeId}/tables`);
      setTables(res.data);
      if (res.data.length > 0) {
        // Extract the base URL from the first QR url
        const firstUrl = res.data[0].qrUrl;
        const match = firstUrl.match(/^(https?:\/\/[^/]+)/);
        if (match) setBaseUrl(match[1]);
      }
    } catch {
      toast.error('Failed to load QR codes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, [user.cafeId]);

  const regenerateQRs = async () => {
    setRegenerating(true);
    try {
      const res = await api.post(`/cafe/${user.cafeId}/tables/regenerate`);
      setTables(res.data.tables);
      setBaseUrl(res.data.baseUrl);
      toast.success('QR codes regenerated with current network IP!');
    } catch {
      toast.error('Failed to regenerate QR codes');
    } finally {
      setRegenerating(false);
    }
  };

  const downloadQR = (table) => {
    const link = document.createElement('a');
    link.href = table.qrDataUrl;
    link.download = `${user.cafeName}-table-${table.tableNumber}-qr.png`;
    link.click();
    toast.success(`Table ${table.tableNumber} QR downloaded`);
  };

  const downloadAll = () => {
    tables.forEach((t, i) => setTimeout(() => downloadQR(t), i * 300));
  };

  return (
    <AdminLayout title="QR Codes">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-sm text-gray-500">{tables.length} tables</p>
          <div className="flex items-center gap-2">
            <button
              onClick={regenerateQRs}
              disabled={regenerating}
              className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-900 transition-colors disabled:opacity-60"
            >
              <RefreshCw size={16} className={regenerating ? 'animate-spin' : ''} />
              {regenerating ? 'Regenerating...' : 'Refresh QR (Fix Mobile)'}
            </button>
            {tables.length > 0 && (
              <button
                onClick={downloadAll}
                className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-700 transition-colors"
              >
                <Download size={16} /> Download All
              </button>
            )}
          </div>
        </div>

        {/* Network IP banner */}
        {baseUrl && (
          <div className={`rounded-2xl p-4 border text-sm ${
            baseUrl.includes('localhost')
              ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
              : 'bg-green-50 border-green-200 text-green-800'
          }`}>
            {baseUrl.includes('localhost') ? (
              <>
                <p className="font-semibold mb-1">⚠️ QR codes point to <code>localhost</code></p>
                <p className="text-xs">Mobile phones can't open localhost URLs. Click <strong>"Refresh QR (Fix Mobile)"</strong> to regenerate with your network IP.</p>
              </>
            ) : (
              <>
                <p className="font-semibold mb-1">✅ QR codes are ready for mobile scanning</p>
                <p className="text-xs">Pointing to: <code>{baseUrl}</code> — Make sure your phone is on the same Wi-Fi.</p>
              </>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
          <p className="text-sm text-orange-700 font-medium mb-1">💡 How to use QR codes</p>
          <p className="text-xs text-orange-600">Print each QR code and place it on the corresponding table. Customers scan it to access the digital menu instantly.</p>
        </div>

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
                  <img
                    src={table.qrDataUrl}
                    alt={`Table ${table.tableNumber} QR`}
                    className="w-full rounded-xl"
                  />
                </div>
                <div className="px-3 pb-3 space-y-2">
                  <button
                    onClick={() => downloadQR(table)}
                    className="w-full flex items-center justify-center gap-1.5 bg-orange-600 text-white py-2 rounded-xl text-xs font-semibold hover:bg-orange-700 transition-colors"
                  >
                    <Download size={13} /> Download
                  </button>
                  <a
                    href={table.qrUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-1.5 bg-gray-100 text-gray-700 py-2 rounded-xl text-xs font-medium hover:bg-gray-200 transition-colors"
                  >
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
