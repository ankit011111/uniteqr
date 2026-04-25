const express = require('express');
const Order = require('../models/Order');
const auth = require('../middleware/auth');

const router = express.Router();

// POST place order (public - customer)
router.post('/', async (req, res) => {
  try {
    const { cafeId, tableNumber, items } = req.body;
    if (!cafeId || !tableNumber || !items || items.length === 0) {
      return res.status(400).json({ error: 'cafeId, tableNumber, and items required' });
    }
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const order = await Order.create({ cafeId, tableNumber, items, totalAmount });
    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET order by ID (public - customer order tracking)
router.get('/track/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET all orders for a cafe (admin)
router.get('/cafe/:cafeId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' || req.user.cafeId !== req.params.cafeId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const orders = await Order.find({ cafeId: req.params.cafeId })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update order status (admin)
router.put('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    const { status } = req.body;
    const validStatuses = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, cafeId: req.user.cafeId },
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
