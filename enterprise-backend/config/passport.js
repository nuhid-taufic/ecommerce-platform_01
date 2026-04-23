const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.API_URL
        ? `${process.env.API_URL}/api/auth/google/callback`
        : "http://localhost:5003/api/auth/google/callback",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        let action = "login";
        if (req.query.state) {
          try {
            const stateObj = JSON.parse(
              Buffer.from(req.query.state, "base64").toString("utf-8"),
            );
            action = stateObj.action || "login";
          } catch (e) {}
        }

        let user = await User.findOne({ email: profile.emails[0].value });

        if (action === "login") {
          if (!user) {
            return done(null, false, { message: "You must register first." });
          }

          if (!user.googleId) {
            user.googleId = profile.id;
            user.avatar = profile.photos[0].value;
            await user.save();
          }
          return done(null, user);
        } else {
          // Action is register
          if (user) {
            // Already exists, just log them in
            if (!user.googleId) {
              user.googleId = profile.id;
              user.avatar = profile.photos[0].value;
              await user.save();
            }
            return done(null, user);
          }

          const newUser = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
            role: "customer",
          });
          user = await newUser.save();
          return done(null, user);
        }
      } catch (err) {
        return done(err, null);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
