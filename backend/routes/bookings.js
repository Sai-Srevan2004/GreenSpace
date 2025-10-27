import express from 'express';
import Booking from '../models/Booking.js';
import Plot from '../models/Plot.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, authorize('gardener'), async (req, res) => {
  try {
    const { plotId, startDate, endDate, message } = req.body;

    const plot = await Plot.findById(plotId).populate('owner');

    if (!plot) {
      return res.status(404).json({ message: 'Plot not found' });
    }

    if (!plot.isAvailable) {
      return res.status(400).json({ message: 'Plot is not available' });
    }

    if (plot.verificationStatus !== 'approved') {
      return res.status(400).json({ message: 'Plot is not verified' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = Math.ceil((end - start) / (1000 * 60 * 60 * 24 * 30));
    const totalAmount = plot.pricePerMonth * months;

    const booking = new Booking({
      plot: plotId,
      gardener: req.user._id,
      landowner: plot.owner._id,
      startDate,
      endDate,
      message,
      totalAmount
    });

    await booking.save();

    res.status(201).json({ message: 'Booking request sent successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create booking', error: error.message });
  }
});

router.get('/gardener', authenticate, authorize('gardener'), async (req, res) => {
  try {
    const bookings = await Booking.find({ gardener: req.user._id })
      .populate('plot')
      .populate('landowner', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
  }
});

router.get('/landowner', authenticate, authorize('landowner'), async (req, res) => {
  try {
    const bookings = await Booking.find({ landowner: req.user._id })
      .populate('plot')
      .populate('gardener', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('plot')
      .populate('gardener', 'name email phone')
      .populate('landowner', 'name email phone');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.gardener._id.toString() !== req.user._id.toString() &&
        booking.landowner._id.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ booking });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch booking', error: error.message });
  }
});

router.put('/:id/approve', authenticate, authorize('landowner'), async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      landowner: req.user._id
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = 'approved';
    await booking.save();

    const plot = await Plot.findById(booking.plot);
    plot.isAvailable = false;
    await plot.save();

    res.json({ message: 'Booking approved successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve booking', error: error.message });
  }
});

router.put('/:id/reject', authenticate, authorize('landowner'), async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const booking = await Booking.findOne({
      _id: req.params.id,
      landowner: req.user._id
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = 'rejected';
    booking.rejectionReason = rejectionReason;
    await booking.save();

    res.json({ message: 'Booking rejected', booking });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject booking', error: error.message });
  }
});

router.put('/:id/complete', authenticate, authorize('landowner'), async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      landowner: req.user._id
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = 'completed';
    await booking.save();

    const plot = await Plot.findById(booking.plot);
    plot.isAvailable = true;
    await plot.save();

    res.json({ message: 'Booking marked as completed', booking });
  } catch (error) {
    res.status(500).json({ message: 'Failed to complete booking', error: error.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.gardener.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (booking.status === 'approved') {
      return res.status(400).json({ message: 'Cannot cancel approved booking' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel booking', error: error.message });
  }
});

export default router;