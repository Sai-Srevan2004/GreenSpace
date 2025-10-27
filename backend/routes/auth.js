import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {

    console.log(req.body,"--------------")
    const { name, email, password, role, phone, address } = req.body;


    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);



    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      address,
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'greenspace_secret_key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus,
        documents: user.documents
      }
    });
  } catch (error) {
    console.log(error.message,"reg")
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'greenspace_secret_key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
});

router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address },
      { new: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
});

router.post('/upload-documents', authenticate, upload.array('documents', 5), async (req, res) => {
  try {
    const documents = req.files.map(file => ({
      name: file.originalname,
      url: `/uploads/${file.filename}`
    }));

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { documents: { $each: documents } } },
      { new: true }
    ).select('-password');

    res.json({ message: 'Documents uploaded successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload documents', error: error.message });
  }
});

export default router;