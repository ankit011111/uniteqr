const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'EMPLOYEE' }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
