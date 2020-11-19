const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const User = require("../models/user-model.js");

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {}
});

passport.use(
  new GoogleStrategy(
    {
      //options for the google strategy
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/user/google/redirect",
    },
    async (accessToken, refreshToken, profile, done) => {
      // passport callback func
      console.log("pass callback");
      
      try {
        const user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
          done(null, user);
          console.log("User is alreadt extis");
        } else {
          console.log("user NOT");
          const newUser = new User({
            username: profile.displayName,
            signupType: "google",
            email: profile.emails[0].value,
            todos: [],
          });
          try {
            await newUser.save();
            done(null, newUser);
          } catch (error) {
            console.log(
              "Signing up failed with google, please try again later."
            );
          }
        }
      } catch (error) {
        console.log(error);
      }
      /* console.log(profile.displayName);
      console.log(profile.emails[0].value);
      console.log(profile.provider); */
    }
  )
);