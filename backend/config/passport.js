const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

const createToken = (user) => {
    const payload = {
        id: user._id,
        name: user.name,
        email: user.email
    };

    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
};

passport.use(
    new GoogleStrategy(
        {
            clientID: "353459941295-c1bgvjvp1jtjpr04bi7ano8arftbqatm",
            clientSecret: "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",
            callbackURL: 'http://localhost:5000/api/auth/google/callback'
        },
        async (accessToken, refreshToken, profile, done) => {
            const { id, emails, displayName } = profile;
            try {
                let user = await User.findOne({ email: emails[0].value });
                if (!user) {
                    user = new User({
                        name: displayName,
                        email: emails[0].value,
                        password: id // Mock password, it should be handled differently
                    });
                    await user.save();
                }
                done(null, user);
            } catch (error) {
                done(error, false);
            }
        }
    )
);

passport.use(
    new FacebookStrategy(
        {
            clientID: 'YOUR_FACEBOOK_CLIENT_ID',
            clientSecret: 'YOUR_FACEBOOK_CLIENT_SECRET',
            callbackURL: 'http://localhost:5000/api/auth/facebook/callback',
            profileFields: ['id', 'emails', 'name']
        },
        async (accessToken, refreshToken, profile, done) => {
            const { id, emails, name } = profile;
            try {
                let user = await User.findOne({ email: emails[0].value });
                if (!user) {
                    user = new User({
                        name: `${name.givenName} ${name.familyName}`,
                        email: emails[0].value,
                        password: id // Mock password, it should be handled differently
                    });
                    await user.save();
                }
                done(null, user);
            } catch (error) {
                done(error, false);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user));
});
