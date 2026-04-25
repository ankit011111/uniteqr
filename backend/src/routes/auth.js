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

    // Check employee first
    let user = await Employee.findOne({ username });
    if (user) {
      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) return res.status(401).json({ error: 'Invalid credentials' });
      const userRole = user.role || 'EMPLOYEE';
      const token = jwt.sign({ id: user._id, role: userRole }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, role: userRole, username: user.username });
    }

    // Check admin
    user = await User.findOne({ username });
    if (user) {
      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) return res.status(401).json({ error: 'Invalid credentials' });
      const token = jwt.sign({ id: user._id, role: 'ADMIN', cafeId: user.cafeId }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, role: 'ADMIN', username: user.username, cafeName: user.cafeName, cafeId: user.cafeId });
    }

    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
