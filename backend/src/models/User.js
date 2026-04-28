const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  cafeName: { type: String, required: true },
  phone: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'ADMIN' },
  cafeId: { type: String, required: true, unique: true },
  planType: { type: Number, default: 500, enum: [500, 1000, 1500] },
  upiId: { type: String, default: '' },
  createdBy: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
