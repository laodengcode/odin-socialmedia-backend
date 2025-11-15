const prisma = require("../prismaClient");
const express = require('express');
const router = express.Router();
const ensureAuth = require('../middleware/ensureAuth');

// Send follow request
router.post('/:userId', ensureAuth, async (req, res) => {
  const { userId } = req.params;
  if (userId === req.user.id) return res.status(400).json({ error: 'Cannot follow yourself' });

  try {
    // check existing
    const existing = await prisma.follow.findFirst({
      where: {
        followerId: req.user.id,
        followingId: userId
      }
    });

    if (existing) return res.status(400).json({ error: 'Follow exists or pending' });

    const follow = await prisma.follow.create({
      data: { followerId: req.user.id, followingId: userId }
    });
    res.json({ follow });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Follow failed' });
  }
});

// Accept a follow request (for the person being followed)
router.patch('/:id/accept', ensureAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const follow = await prisma.follow.findUnique({ where: { id } });
    if (!follow) return res.status(404).json({ error: 'Not found' });

    // Only the target (following) can accept
    if (follow.followingId !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    const updated = await prisma.follow.update({
      where: { id },
      data: { status: 'ACCEPTED' }
    });
    res.json({ follow: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Accept failed' });
  }
});

// Unfollow / Reject request
router.delete('/:id', ensureAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const follow = await prisma.follow.findUnique({ where: { id } });
    if (!follow) return res.status(404).json({ error: 'Not found' });

    // Either follower or following can remove
    if (follow.followingId !== req.user.id && follow.followerId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.follow.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = router;
