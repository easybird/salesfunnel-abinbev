import passport from 'passport';
import expressSession from 'express-session';
import cookieParser from 'cookie-parser';
import { Strategy } from 'passport-local';

/** Exported data **/
export function initialisePassport(app, secret) {
    app.use(cookieParser());
    app.use(expressSession({
        secret: secret,
        resave: false,
        saveUninitialized: false
    }));
    app.use(passport.initialize());
    app.use(passport.session());
}

export function addLocalStrategyForUserAuthentication() {
    passport.use(new Strategy(function (username, password, done) {
        //crypto.pbkdf2

        //later go to DB!
        if (username === password) {
            done(null, {
                //TODO change username by id from db
                id: username,
                name: username
            });
        } else {
            done(null, null);
        }
        //done(new Error('Error during authentication'));
    }));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (userId, done) {
        getAuthenticatedUser(userId)
            .then(function (userObject) {
                done(null, userObject);
            })
            .catch(function (err) {
                done(err, null);
            })
    });
}

export function doUserAuthentication(redirectObject) {
    return passport.authenticate('local', redirectObject);
}

export function getAuthenticatedUser(userId) {
    return new Promise(function (resolve, reject) {
        //TODO add DB call
        resolve({id: userId, name: userId})
    });
}