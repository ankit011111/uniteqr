const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  cafeId: { type: String, required: true },
  tableNumber: { type: Number, required: true },
  qrUrl: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Table', tableSchema);
