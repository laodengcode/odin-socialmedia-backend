// src/app.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');

require('./config/passport')(passport);

const app = express();

// Trust proxy - CRITICAL for Railway/Heroku
app.set('trust proxy', 1);

// CORS Configuration - MUST be before other middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:5173',        // Vite dev server
      'http://localhost:3000',        // Alternative dev port
      'http://127.0.0.1:5173',        // Alternative localhost
      process.env.FRONTEND_URL,       // Production frontend URL from .env
    ].filter(Boolean); // Remove undefined values

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie']
};

app.use(cors(corsOptions));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    proxy: true, // Trust the reverse proxy
    cookie: { 
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-origin in production
      domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost' // Don't set domain in production
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Mount routes
app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/posts', require('./routes/posts'));
app.use('/follows', require('./routes/follows'));
app.use('/comments', require('./routes/comments'));
app.use('/likes', require('./routes/likes'));

// Health check
app.get('/', (req, res) => res.json({ ok: true }));

module.exports = app;