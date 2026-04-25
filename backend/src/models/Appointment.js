const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  shopAddress: { type: String, required: true },
  contactNumber: { type: String, required: true },
  serviceOfInterest: { type: String, enum: ['Web Building', 'Digital Marketing', 'Menu QR'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
