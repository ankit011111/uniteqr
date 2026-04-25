require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/employee', require('./routes/employee'));
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/cafe', require('./routes/cafe'));
app.use('/api/owner', require('./routes/owner'));
app.use('/api/appointment', require('./routes/appointment'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'MenuSQR API running' }));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || '';
const JWT_SECRET = process.env.JWT_SECRET || 'menusqr_secret_key_123';

const seedInitialUsers = async () => {
  const Employee = require('./models/Employee');
  
  // Seed Default Employee
  const existingEmp = await Employee.findOne({ username: 'employee' });
  if (!existingEmp) {
    const hash = await bcrypt.hash('employee123', 10);
    await Employee.create({ username: 'employee', passwordHash: hash, role: 'EMPLOYEE' });
    console.log('✅ Default employee seeded: username=employee, password=employee123');
  }

  // Seed Owner
  const existingOwner = await Employee.findOne({ username: 'Ankit.mi11' });
  if (!existingOwner) {
    const hash = await bcrypt.hash('Jaishreer@m', 10);
    await Employee.create({ username: 'Ankit.mi11', passwordHash: hash, role: 'OWNER' });
    console.log('✅ Owner seeded: username=Ankit.mi11');
  }
};

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    await seedInitialUsers();
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('👉 Please set MONGO_URI in your .env file');
    process.exit(1);
  });
