import express from 'express';
import User from '../models/User.js';
import Plot from '../models/Plot.js';
import Booking from '../models/Booking.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/users', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { role, verificationStatus } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (verificationStatus) filter.verificationStatus = verificationStatus;

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
});

router.get('/users/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
});

router.put('/users/:id/verify', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { verificationStatus, rejectionReason } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.verificationStatus = verificationStatus;
    user.isVerified = verificationStatus === 'approved';

    if (verificationStatus === 'rejected') {
      user.rejectionReason = rejectionReason;
    }

    await user.save();

    res.json({ message: 'User verification status updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update verification status', error: error.message });
  }
});

router.get('/plots', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { verificationStatus } = req.query;
    const filter = {};

    if (verificationStatus) filter.verificationStatus = verificationStatus;

    const plots = await Plot.find(filter)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ plots });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch plots', error: error.message });
  }
});

router.get('/plots/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const plot = await Plot.findById(req.params.id)
      .populate('owner', 'name email phone address');

    if (!plot) {
      return res.status(404).json({ message: 'Plot not found' });
    }

    res.json({ plot });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch plot', error: error.message });
  }
});

router.put('/plots/:id/verify', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { verificationStatus, rejectionReason } = req.body;

    const plot = await Plot.findById(req.params.id);

    if (!plot) {
      return res.status(404).json({ message: 'Plot not found' });
    }

    plot.verificationStatus = verificationStatus;

    if (verificationStatus === 'rejected') {
      plot.rejectionReason = rejectionReason;
      plot.isAvailable = false;
    }

    await plot.save();

    res.json({ message: 'Plot verification status updated', plot });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update verification status', error: error.message });
  }
});

router.get('/bookings', authenticate, authorize('admin'), async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('plot')
      .populate('gardener', 'name email phone')
      .populate('landowner', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
  }
});

router.get('/stats', authenticate, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalGardeners = await User.countDocuments({ role: 'gardener' });
    const totalLandowners = await User.countDocuments({ role: 'landowner' });
    const pendingVerifications = await User.countDocuments({ verificationStatus: 'pending' });

    const totalPlots = await Plot.countDocuments();
    const availablePlots = await Plot.countDocuments({ isAvailable: true, verificationStatus: 'approved' });
    const pendingPlots = await Plot.countDocuments({ verificationStatus: 'pending' });

    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ status: 'approved' });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });

    res.json({
      stats: {
        users: {
          total: totalUsers,
          gardeners: totalGardeners,
          landowners: totalLandowners,
          pendingVerifications
        },
        plots: {
          total: totalPlots,
          available: availablePlots,
          pending: pendingPlots
        },
        bookings: {
          total: totalBookings,
          active: activeBookings,
          pending: pendingBookings
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
});

export default router;