const express = require('express');
const QRCode = require('qrcode');
const Table = require('../models/Table');
const auth = require('../middleware/auth');

const router = express.Router();

// GET tables + QR data for a cafe (admin)
router.get('/:cafeId/tables', auth, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' || req.user.cafeId !== req.params.cafeId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const tables = await Table.find({ cafeId: req.params.cafeId }).sort({ tableNumber: 1 });
    const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

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

// GET public cafe info (for customer menu header)
router.get('/:cafeId/info', async (req, res) => {
  try {
    const User = require('../models/User');
    const cafe = await User.findOne({ cafeId: req.params.cafeId }).select('cafeName cafeId');
    if (!cafe) return res.status(404).json({ error: 'Café not found' });
    res.json({ cafeName: cafe.cafeName, cafeId: cafe.cafeId });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
