const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  cafeId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  available: { type: Boolean, default: true },
  description: { type: String },
  imageUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
