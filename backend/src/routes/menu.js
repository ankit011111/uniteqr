const express = require('express');
const MenuItem = require('../models/MenuItem');
const auth = require('../middleware/auth');

const router = express.Router();

// GET menu (public - no auth required)
router.get('/:cafeId', async (req, res) => {
  try {
    const items = await MenuItem.find({ cafeId: req.params.cafeId, available: true });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET all menu items including unavailable (admin)
router.get('/:cafeId/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' || req.user.cafeId !== req.params.cafeId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const items = await MenuItem.find({ cafeId: req.params.cafeId });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST new menu item (admin)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    const { name, price, category, description, imageUrl, available } = req.body;
    const item = await MenuItem.create({
      cafeId: req.user.cafeId,
      name, price, category, description, imageUrl,
      available: available !== undefined ? available : true
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update menu item (admin)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    const item = await MenuItem.findOneAndUpdate(
      { _id: req.params.id, cafeId: req.user.cafeId },
      req.body,
      { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE menu item (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    const item = await MenuItem.findOneAndDelete({ _id: req.params.id, cafeId: req.user.cafeId });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
