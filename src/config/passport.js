const prisma = require("../prismaClient");
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      { 
        usernameField: 'username',  // Changed from 'email' to 'username'
        passwordField: 'password' 
      }, 
      async (username, password, done) => {
        try {
          console.log('Login attempt with:', username);
          
          // Find user by username OR email (flexible)
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { username: username },
                { email: username }
              ]
            }
          });

          if (!user) {
            console.log('User not found:', username);
            return done(null, false, { message: 'Incorrect username or password.' });
          }

          const match = await bcrypt.compare(password, user.passwordHash);
          
          if (!match) {
            console.log('Password mismatch for:', username);
            return done(null, false, { message: 'Incorrect username or password.' });
          }

          console.log('Login successful:', user.username);
          return done(null, user);
        } catch (err) {
          console.error('Passport error:', err);
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    console.log('Serializing user:', user.id);
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      console.log('Deserializing user:', id);
      const user = await prisma.user.findUnique({ where: { id } });
      done(null, user);
    } catch (err) {
      console.error('Deserialize error:', err);
      done(err);
    }
  });
};