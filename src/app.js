// src/app.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');

require('./config/passport')(passport); // Passport config must use the prisma client we created

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Mount routes (same as before)
app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/posts', require('./routes/posts'));
app.use('/follows', require('./routes/follows'));
app.use('/comments', require('./routes/comments'));
app.use('/likes', require('./routes/likes'));

// Health check
app.get('/', (req, res) => res.json({ ok: true }));

module.exports = app;
