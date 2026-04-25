const express = require('express');
const Appointment = require('../models/Appointment');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { fullName, shopAddress, contactNumber, serviceOfInterest } = req.body;
    if (!fullName || !shopAddress || !contactNumber || !serviceOfInterest) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const appt = await Appointment.create({ fullName, shopAddress, contactNumber, serviceOfInterest });
    res.json({ success: true, id: appt._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
