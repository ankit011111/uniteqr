const express = require('express');
const Order = require('../models/Order');
const auth = require('../middleware/auth');

const router = express.Router();

// POST place order (public - customer)
router.post('/', async (req, res) => {
  try {
    const { cafeId, tableNumber, items, customerPhone } = req.body;
    if (!cafeId || !tableNumber || !items || items.length === 0) {
      return res.status(400).json({ error: 'cafeId, tableNumber, and items required' });
    }
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const order = await Order.create({ cafeId, tableNumber, items, totalAmount, customerPhone: customerPhone || null });
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

// POST create Razorpay order (public - for ₹1500 plan cafes)
router.post('/razorpay/create', async (req, res) => {
  try {
    const Razorpay = require('razorpay');
    const { amount, currency = 'INR', cafeId } = req.body;
    if (!amount || !cafeId) return res.status(400).json({ error: 'amount and cafeId required' });

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const rzOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency,
      receipt: `receipt_${cafeId}_${Date.now()}`
    });

    res.json({ orderId: rzOrder.id, amount: rzOrder.amount, currency: rzOrder.currency, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error('Razorpay error:', err);
    res.status(500).json({ error: 'Payment gateway error' });
  }
});

// POST verify Razorpay payment & mark order PAID (public)
router.post('/razorpay/verify', async (req, res) => {
  try {
    const crypto = require('crypto');
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Mark our order as PAID
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { paymentStatus: 'PAID' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// GET customers for a cafe (admin - ₹1000+ plan only)
router.get('/cafe/:cafeId/customers', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    if (req.user.role !== 'ADMIN' || req.user.cafeId !== req.params.cafeId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const cafe = await User.findOne({ cafeId: req.params.cafeId });
    if (!cafe || cafe.planType < 1000) {
      return res.status(403).json({ error: 'Customer data requires ₹1000+ plan' });
    }

    const customers = await Order.find({
      cafeId: req.params.cafeId,
      customerPhone: { $ne: null }
    })
      .sort({ createdAt: -1 })
      .select('customerPhone tableNumber totalAmount status createdAt items');

    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
