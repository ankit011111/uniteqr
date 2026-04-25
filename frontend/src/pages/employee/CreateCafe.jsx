import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Download, Copy, CheckCircle2 } from 'lucide-react';

const CreateCafe = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ cafeName: '', phone: '', tables: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/employee/create-cafe', form);
      setResult(res.data);
      toast.success('Café created successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create café');
    } finally {
      setLoading(false);
    }
  };

  const copyCredentials = () => {
    const text = `UniteQR Login\nCafé: ${result.cafeName}\nUsername: ${result.username}\nPassword: ${result.password}\nAdmin Panel: ${window.location.origin}/admin/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Credentials copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = (table) => {
    const link = document.createElement('a');
    link.href = table.qrDataUrl;
    link.download = `table-${table.tableNumber}-qr.png`;
    link.click();
  };

  const downloadAllQR = () => {
    result.tables.forEach((t, i) => {
      setTimeout(() => downloadQR(t), i * 300);
    });
  };

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 py-5 mb-6">
            <button onClick={() => navigate('/employee')} className="text-gray-500 hover:text-gray-700">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Café Created! 🎉</h1>
          </div>

          {/* Credentials */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 size={20} className="text-green-500" />
              <h2 className="font-semibold text-gray-900">{result.cafeName}</h2>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Username</span>
                <span className="font-mono font-bold text-gray-900">{result.username}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Password</span>
                <span className="font-mono font-bold text-gray-900">{result.password}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Café ID</span>
                <span className="font-mono text-xs text-gray-700">{result.cafeId}</span>
              </div>
            </div>

            <button
              onClick={copyCredentials}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
            >
              {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy Credentials'}
            </button>
          </div>

          {/* QR Codes */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">QR Codes ({result.tables.length} tables)</h3>
              <button
                onClick={downloadAllQR}
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
              >
                <Download size={14} />
                Download All
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {result.tables.map(table => (
                <div key={table.tableNumber} className="border border-gray-100 rounded-xl p-3 text-center">
                  <img src={table.qrDataUrl} alt={`Table ${table.tableNumber}`} className="w-full mx-auto mb-2 rounded" />
                  <p className="text-xs font-medium text-gray-700 mb-2">Table {table.tableNumber}</p>
                  <button
                    onClick={() => downloadQR(table)}
                    className="w-full flex items-center justify-center gap-1 bg-gray-100 text-gray-700 py-1.5 rounded-lg text-xs hover:bg-gray-200 transition-colors"
                  >
                    <Download size={12} />
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/employee')}
            className="w-full mt-4 bg-white text-gray-700 py-3 rounded-xl text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Create Another Café
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-3 py-5 mb-6">
          <button onClick={() => navigate('/employee')} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Create New Café</h1>
            <p className="text-xs text-gray-500">Fill in details to generate QR codes</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Café Name *</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. Sharma Café"
                value={form.cafeName}
                onChange={e => setForm({ ...form, cafeName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner Phone *</label>
              <input
                type="tel"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="9876543210"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Tables *</label>
              <input
                type="number"
                min="1"
                max="50"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. 5"
                value={form.tables}
                onChange={e => setForm({ ...form, tables: e.target.value })}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Creating Café...' : '⚡ Generate QR & Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCafe;
