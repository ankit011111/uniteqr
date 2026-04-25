const express = require('express');
const Order = require('../models/Order');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/:cafeId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN' || req.user.cafeId !== req.params.cafeId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { filter } = req.query;
    const cafeId = req.params.cafeId;
    let dateFilter = {};

    const now = new Date();
    if (filter === 'day') {
      const start = new Date(now); start.setHours(0, 0, 0, 0);
      dateFilter = { createdAt: { $gte: start } };
    } else if (filter === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { createdAt: { $gte: start } };
    }

    const orders = await Order.find({ cafeId, ...dateFilter });
    const completed = orders.filter(o => o.status === 'COMPLETED');

    const revenue = completed.reduce((sum, o) => sum + o.totalAmount, 0);

    // Top items
    const itemCount = {};
    completed.forEach(order => {
      order.items.forEach(item => {
        itemCount[item.name] = (itemCount[item.name] || 0) + item.qty;
      });
    });
    const topItems = Object.entries(itemCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Orders by status
    const statusCounts = {
      PLACED: 0, ACCEPTED: 0, PREPARING: 0, READY: 0, COMPLETED: 0
    };
    orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });

    res.json({
      totalOrders: orders.length,
      completedOrders: completed.length,
      revenue,
      topItems,
      statusCounts
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
