const express = require('express');
const User = require('../models/User');
const Order = require('../models/Order');
const Employee = require('../models/Employee');
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

router.get('/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'OWNER') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const cafes = await User.find({ role: 'ADMIN' });
    const employees = await Employee.find({ role: 'EMPLOYEE' });
    const orders = await Order.find();
    const appointments = await Appointment.find().sort({ createdAt: -1 });

    const totalCafes = cafes.length;

    // Calculate employee performance
    const employeeStats = employees.map(emp => {
      const createdByEmp = cafes.filter(c => c.createdBy === emp.username);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const createdToday = createdByEmp.filter(c => new Date(c.createdAt) >= today);

      return {
        _id: emp._id,
        username: emp.username,
        totalCreated: createdByEmp.length,
        createdToday: createdToday.length
      };
    });

    // Calculate cafe performance
    const cafeStats = cafes.map(cafe => {
      const cafeOrders = orders.filter(o => o.cafeId === cafe.cafeId);
      const completed = cafeOrders.filter(o => o.status === 'COMPLETED');
      const revenue = completed.reduce((sum, o) => sum + o.totalAmount, 0);

      return {
        cafeName: cafe.cafeName,
        cafeId: cafe.cafeId,
        phone: cafe.phone,
        createdBy: cafe.createdBy || 'Unknown',
        planType: cafe.planType || 500,
        totalOrders: cafeOrders.length,
        revenue,
        createdAt: cafe.createdAt
      };
    }).sort((a, b) => b.totalOrders - a.totalOrders);

    const planBreakdown = {
      plan500: cafeStats.filter(c => c.planType === 500).length,
      plan1000: cafeStats.filter(c => c.planType === 1000).length,
      plan1500: cafeStats.filter(c => c.planType === 1500).length,
    };

    res.json({
      totalCafes,
      employeeStats,
      cafeStats,
      planBreakdown,
      appointments
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new employee
router.post('/employees', auth, async (req, res) => {
  try {
    if (req.user.role !== 'OWNER') return res.status(403).json({ error: 'Forbidden' });
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    
    const existing = await Employee.findOne({ username });
    if (existing) return res.status(400).json({ error: 'Username already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const employee = await Employee.create({ username, passwordHash });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update employee (password)
router.put('/employees/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'OWNER') return res.status(403).json({ error: 'Forbidden' });
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password required' });

    const passwordHash = await bcrypt.hash(password, 10);
    await Employee.findByIdAndUpdate(req.params.id, { passwordHash });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete employee
router.delete('/employees/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'OWNER') return res.status(403).json({ error: 'Forbidden' });
    
    // Prevent deleting self
    if (req.params.id === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });

    await Employee.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
