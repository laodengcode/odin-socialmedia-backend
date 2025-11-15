require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');

const app = express();
const PORT = process.env.PORT || 4000;

require('./config/passport')(passport); // Passport config

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
app.use(flash());

// Mount routes
app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/posts', require('./routes/posts'));
app.use('/follows', require('./routes/follows'));
app.use('/comments', require('./routes/comments'));
app.use('/likes', require('./routes/likes'));

// Health check
app.get('/', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
