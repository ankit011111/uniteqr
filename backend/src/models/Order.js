const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  cafeId: { type: String, required: true },
  tableNumber: { type: Number, required: true },
  items: [{
    name: String,
    price: Number,
    qty: Number,
    menuItemId: mongoose.Schema.Types.ObjectId
  }],
  totalAmount: { type: Number, required: true },
  customerPhone: { type: String },
  paymentStatus: { type: String, enum: ['PENDING', 'PAID'], default: 'PENDING' },
  status: {
    type: String,
    enum: ['PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED'],
    default: 'PLACED'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
