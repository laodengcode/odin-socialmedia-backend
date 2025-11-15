const express = require('express');
const router = express.Router();
const ensureAuth = require('../middleware/ensureAuth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'social_clone/profiles',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 800, crop: 'limit' }]
  }
});
const upload = multer({ storage });

// List users
router.get('/', ensureAuth, async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, username: true, name: true, bio: true, imageUrl: true, createdAt: true }
  });
  res.json({ users });
});

// Get profile by ID
router.get('/:id', ensureAuth, async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      name: true,
      bio: true,
      imageUrl: true,
      createdAt: true,
      posts: { orderBy: { createdAt: 'desc' }, include: { likes: true, comments: true } }
    }
  });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

// Update profile
router.patch('/me', ensureAuth, async (req, res) => {
  const { name, bio } = req.body;
  try {
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, bio }
    });
    const { passwordHash: _, ...safe } = updated;
    res.json({ user: safe });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

// Upload profile photo
router.post('/me/photo', ensureAuth, upload.single('photo'), async (req, res) => {
  try {
    // multer-storage-cloudinary stores file info in req.file
    const imageUrl = req.file.path; // cloudinary secure url
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { imageUrl }
    });
    const { passwordHash: _, ...safe } = updated;
    res.json({ user: safe });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;
