const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'menusqr_secret_key_123';

// Unified login for admin + employee
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Run lookups in parallel
    const [employeeUser, adminUser] = await Promise.all([
      Employee.findOne({ username }).lean(),
      User.findOne({ username }).lean()
    ]);

    const user = employeeUser || adminUser;
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    if (employeeUser) {
      const userRole = user.role || 'EMPLOYEE';
      const token = jwt.sign({ id: user._id, role: userRole }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, role: userRole, username: user.username });
    } else {
      const token = jwt.sign({ id: user._id, role: 'ADMIN', cafeId: user.cafeId, planType: user.planType }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, role: 'ADMIN', username: user.username, cafeName: user.cafeName, cafeId: user.cafeId, planType: user.planType });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
