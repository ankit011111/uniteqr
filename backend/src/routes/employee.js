const express = require('express');
const os = require('os');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const User = require('../models/User');
const Table = require('../models/Table');
const MenuItem = require('../models/MenuItem');
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

const DEFAULT_MENU = [
  { name: 'Espresso', price: 80, category: 'Coffee', description: 'Rich, bold single shot of espresso', imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&q=80' },
  { name: 'Cappuccino', price: 120, category: 'Coffee', description: 'Espresso with steamed milk foam', imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=80' },
  { name: 'Cold Coffee', price: 150, category: 'Coffee', description: 'Chilled coffee blended with milk and ice', imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80' },
  { name: 'Masala Chai', price: 40, category: 'Tea', description: 'Spiced Indian tea with ginger and cardamom', imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80' },
  { name: 'Burger', price: 180, category: 'Food', description: 'Crispy chicken burger with fresh veggies', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80' },
  { name: 'Grilled Sandwich', price: 120, category: 'Food', description: 'Toasted sandwich with cheese and veggies', imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&q=80' },
  { name: 'French Fries', price: 90, category: 'Snacks', description: 'Crispy golden fries with seasoning', imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80' },
  { name: 'Pasta', price: 200, category: 'Food', description: 'Creamy white sauce pasta with herbs', imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91798d792b?w=400&q=80' },
  { name: 'Chocolate Cake', price: 160, category: 'Desserts', description: 'Moist chocolate cake slice with frosting', imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80' },
  { name: 'Mango Smoothie', price: 130, category: 'Drinks', description: 'Fresh mango blended with yogurt and honey', imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&q=80' },
];

// Create café (employee only)
router.post('/create-cafe', auth, async (req, res) => {
  if (req.user.role !== 'EMPLOYEE') {
    return res.status(403).json({ error: 'Employee access only' });
  }

  try {
    const { cafeName, phone, tables, planType } = req.body;
    if (!cafeName || !phone || !tables) {
      return res.status(400).json({ error: 'cafeName, phone, and tables are required' });
    }

    const numTables = parseInt(tables);
    if (isNaN(numTables) || numTables < 1 || numTables > 50) {
      return res.status(400).json({ error: 'Tables must be between 1 and 50' });
    }

    const selectedPlan = planType ? parseInt(planType) : 500;

    // Generate unique cafeId, username, password
    const cafeId = uuidv4().split('-')[0];
    const username = cafeName.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 100);
    const password = String(Math.floor(100000 + Math.random() * 900000));
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin user
    const user = await User.create({ 
      cafeName, phone, username, passwordHash, cafeId, planType: selectedPlan, createdBy: req.user.username 
    });

    // Create tables and generate QRs
    const BASE_URL = getBaseUrl();
    const tableData = [];
    for (let i = 1; i <= numTables; i++) {
      const qrUrl = `${BASE_URL}/cafe/${cafeId}/table/${i}`;
      const qrDataUrl = await QRCode.toDataURL(qrUrl, { margin: 1, width: 256 });
      const table = await Table.create({ cafeId, tableNumber: i, qrUrl });
      tableData.push({ tableNumber: i, qrUrl, qrDataUrl, _id: table._id });
    }

    // Seed 10 default menu items
    const menuItems = DEFAULT_MENU.map(item => ({ ...item, cafeId }));
    await MenuItem.insertMany(menuItems);

    res.json({
      success: true,
      cafeName,
      cafeId,
      username,
      password,
      tables: tableData
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username conflict, please try again' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
