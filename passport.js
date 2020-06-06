const passport = require('passport')
const LocalStrategy = require('passport-local');
const User = require('./models/user')

passport.use(new LocalStrategy(
    async function (username, password, done) {
        try {
            let user = await User.findOne({ screen_name: username }, '_id');
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            if (!await user.validPassword(password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);

        } catch (error) {
            console.log('error in localStrategy', error);
            return done(error)
        }
    }
));
passport.serializeUser(function (user, done) {
    done(null, user._id);
});

passport.deserializeUser(function (_id, done) {
    User.findById(_id, function (err, user) {
        done(err, user);
    });
});

module.exports = passport