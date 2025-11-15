const express = require('express');
const router = express.Router();
const ensureAuth = require('../middleware/ensureAuth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create comment
router.post('/:postId', ensureAuth, async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Empty comment' });

  try {
    const comment = await prisma.comment.create({
      data: { postId, authorId: req.user.id, content }
    });
    res.json({ comment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Create comment failed' });
  }
});

// Delete comment
router.delete('/:id', ensureAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) return res.status(404).json({ error: 'Not found' });
    if (comment.authorId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    await prisma.comment.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete comment failed' });
  }
});

module.exports = router;
