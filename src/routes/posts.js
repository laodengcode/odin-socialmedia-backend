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
    folder: 'social_clone/posts',
    allowed_formats: ['jpg','png','jpeg'],
    transformation: [{ width: 1200, crop: 'limit' }]
  }
});
const upload = multer({ storage });

// Create text post
router.post('/', ensureAuth, async (req, res) => {
  const { content } = req.body;
  try {
    const post = await prisma.post.create({
      data: { authorId: req.user.id, content }
    });
    res.json({ post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Create post failed' });
  }
});

// Create post with image
router.post('/image', ensureAuth, upload.single('image'), async (req, res) => {
  try {
    const imageUrl = req.file.path;
    const { content } = req.body;
    const post = await prisma.post.create({
      data: { authorId: req.user.id, content, imageUrl }
    });
    res.json({ post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Create post failed' });
  }
});

// Feed: posts by current user and accepted people they follow
router.get('/feed', ensureAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { authorId: userId },
          {
            author: {
              followers: {
                some: {
                  followerId: userId,
                  status: 'ACCEPTED'
                }
              }
            }
          }
        ]
      },
      include: {
        author: { select: { id: true, username: true, name: true, imageUrl: true } },
        comments: { include: { author: { select: { id: true, username: true, imageUrl: true } } } },
        likes: { include: { user: { select: { id: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Feed error' });
  }
});

// Get single post
router.get('/:id', ensureAuth, async (req, res) => {
  const { id } = req.params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, username: true, name: true, imageUrl: true } },
      comments: { include: { author: { select: { id: true, username: true, imageUrl: true } } } },
      likes: { include: { user: { select: { id: true } } } }
    }
  });
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json({ post });
});

// Delete post
router.delete('/:id', ensureAuth, async (req, res) => {
  const { id } = req.params;
  try {
    // Only author can delete
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ error: 'Not found' });
    if (post.authorId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    await prisma.post.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = router;
