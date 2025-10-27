import express from 'express';
import Plot from '../models/Plot.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Get all approved & available plots
router.get('/', async (req, res) => {
  try {
    const { city, soilType, minSize, maxSize, waterAvailability } = req.query;
    const filter = { isAvailable: true, verificationStatus: 'approved' };

    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (soilType) filter.soilType = soilType;
    if (waterAvailability) filter.waterAvailability = waterAvailability;
    if (minSize) filter['size.value'] = { $gte: Number(minSize) };
    if (maxSize) filter['size.value'] = { ...filter['size.value'], $lte: Number(maxSize) };

    const plots = await Plot.find(filter)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ plots });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch plots', error: error.message });
  }
});

// Get plots of logged-in landowner
router.get('/my-plots', authenticate, authorize('landowner'), async (req, res) => {
  try {
    const plots = await Plot.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ plots });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch plots', error: error.message });
  }
});

// Get single plot by ID
router.get('/:id', async (req, res) => {
  try {
    const plot = await Plot.findById(req.params.id).populate('owner', 'name email phone address');
    if (!plot) return res.status(404).json({ message: 'Plot not found' });
    res.json({ plot });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch plot', error: error.message });
  }
});

// Create new plot (with images)
router.post('/', authenticate, authorize('landowner'), upload.array('images', 10), async (req, res) => {
  try {
    const plotData = JSON.parse(req.body.plotData);
    const images = req.files?.map(file => `/uploads/${file.filename}`) || [];

    const plot = new Plot({
      ...plotData,
      owner: req.user._id,
      images,
    });

    await plot.save();
    res.status(201).json({ message: 'Plot listed successfully', plot });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create plot', error: error.message });
  }
});

// Update plot details
router.put('/:id', authenticate, authorize('landowner'), async (req, res) => {
  try {
    const plot = await Plot.findOne({ _id: req.params.id, owner: req.user._id });
    if (!plot) return res.status(404).json({ message: 'Plot not found' });

    Object.assign(plot, req.body);
    await plot.save();

    res.json({ message: 'Plot updated successfully', plot });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update plot', error: error.message });
  }
});

// Delete a plot
router.delete('/:id', authenticate, authorize('landowner'), async (req, res) => {
  try {
    const plot = await Plot.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!plot) return res.status(404).json({ message: 'Plot not found' });

    res.json({ message: 'Plot deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete plot', error: error.message });
  }
});

// Upload or Reupload documents (replaces old docs)
router.post('/:id/upload-documents', authenticate, authorize('landowner'), upload.array('documents', 5), async (req, res) => {
  try {
    const plot = await Plot.findOne({ _id: req.params.id, owner: req.user._id });
    if (!plot) return res.status(404).json({ message: 'Plot not found' });

    const documents = req.files.map(file => ({
      name: file.originalname,
      url: `/uploads/${file.filename}`,
      type: req.body.type || 'other',
    }));

    // Replace old documents with new ones
    plot.documents = documents;
    await plot.save();

    res.json({ message: 'Documents uploaded successfully', plot });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload documents', error: error.message });
  }
});

export default router;