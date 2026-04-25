const express = require('express');
const os = require('os');
const QRCode = require('qrcode');
const Table = require('../models/Table');
const auth = require('../middleware/auth');

const router = express.Router();

// Helper: get local network IP (falls back to localhost)
function getBaseUrl() {
  if (process.env.BASE_URL) return process.env.BASE_URL;
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return `http://${iface.address}:5173`;
      }
    }
  }
  return 'http://localhost:5173';
}

// GET tables + fresh QR data for a cafe (admin)
router.get('/:cafeId/tables', auth, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' || req.user.cafeId !== req.params.cafeId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const tables = await Table.find({ cafeId: req.params.cafeId }).sort({ tableNumber: 1 });
    const BASE_URL = getBaseUrl();

    const tablesWithQR = await Promise.all(tables.map(async (t) => {
      const qrUrl = `${BASE_URL}/cafe/${t.cafeId}/table/${t.tableNumber}`;
      const qrDataUrl = await QRCode.toDataURL(qrUrl, { margin: 1, width: 256 });
      return {
        _id: t._id,
        tableNumber: t.tableNumber,
        qrUrl,
        qrDataUrl
      };
    }));

    res.json(tablesWithQR);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST regenerate QR codes for all tables of a cafe (admin)
router.post('/:cafeId/tables/regenerate', auth, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' || req.user.cafeId !== req.params.cafeId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const tables = await Table.find({ cafeId: req.params.cafeId }).sort({ tableNumber: 1 });
    const BASE_URL = getBaseUrl();

    const tablesWithQR = await Promise.all(tables.map(async (t) => {
      const qrUrl = `${BASE_URL}/cafe/${t.cafeId}/table/${t.tableNumber}`;
      const qrDataUrl = await QRCode.toDataURL(qrUrl, { margin: 1, width: 256 });
      // Persist updated qrUrl to DB
      await Table.findByIdAndUpdate(t._id, { qrUrl });
      return {
        _id: t._id,
        tableNumber: t.tableNumber,
        qrUrl,
        qrDataUrl
      };
    }));

    res.json({ success: true, tables: tablesWithQR, baseUrl: BASE_URL });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET public cafe info (for customer menu header)
router.get('/:cafeId/info', async (req, res) => {
  try {
    const User = require('../models/User');
    const cafe = await User.findOne({ cafeId: req.params.cafeId }).select('cafeName cafeId');
    if (!cafe) return res.status(404).json({ error: 'Cafe not found' });
    res.json({ cafeName: cafe.cafeName, cafeId: cafe.cafeId });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
