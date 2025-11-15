const express = require('express');
const router = express.Router();
const ensureAuth = require('../middleware/ensureAuth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Like a post
router.post('/:postId', ensureAuth, async (req, res) => {
  const { postId } = req.params;
  try {
    const exists = await prisma.like.findUnique({
      where: { postId_userId: { postId, userId: req.user.id } }
    });
    if (exists) return res.status(400).json({ error: 'Already liked' });

    const like = await prisma.like.create({
      data: { postId, userId: req.user.id }
    });
    res.json({ like });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Like failed' });
  }
});

// Unlike a post
router.delete('/:postId', ensureAuth, async (req, res) => {
  const { postId } = req.params;
  try {
    await prisma.like.delete({
      where: { postId_userId: { postId, userId: req.user.id } }
    });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unlike failed' });
  }
});

module.exports = router;
