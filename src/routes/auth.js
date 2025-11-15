const prisma = require("../prismaClient");
const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');

// Register
router.post('/register', async (req, res) => {
  const { username, email, password, name } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'Missing fields' });

  try {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });
    if (existing) return res.status(400).json({ error: 'Email or username already used' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, email, passwordHash, name }
    });

    // auto-login after register
    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: 'Login after register failed' });
      // don't return passwordHash
      const { passwordHash: _, ...safe } = user;
      res.json({ user: safe });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(400).json({ error: info?.message || 'Login failed' });

    req.login(user, (err) => {
      if (err) return next(err);
      const { passwordHash: _, ...safe } = user;
      return res.json({ user: safe });
    });
  })(req, res, next);
});

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ error: 'Session destruction failed' });
      res.clearCookie('connect.sid');
      res.json({ ok: true });
    });
  });
});

// Current user
router.get('/me', (req, res) => {
  if (!req.user) return res.status(401).json({ user: null });
  const { passwordHash: _, ...safe } = req.user;
  res.json({ user: safe });
});

module.exports = router;
