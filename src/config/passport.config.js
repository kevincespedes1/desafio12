

import passport from "passport";
import GitHubStrategy from 'passport-github2'
import userService from '../dao/models/user.model.js'

const initializePassport = () => {
    passport.use('github', new GitHubStrategy({
        clientID: "Iv1.a2603f69781a99e1",
        clientSecret: '21fb3a506202b74a24d240946ec8fb19f901949c',
        callbackURL: 'http://localhost:8080/api/sessions/githubcallback'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await userService.findOne({ email: profile._json.email })
            if (!user) {
                let newUser = {
                    first_name: profile._json.name,
                    last_name: profile._json.name,
                    age: 19,
                    email: profile._json.email,
                    password: ''
                }
                let result = await userService.create(newUser);
                done(null, result);
            }
            else {
                done(null, user);
            }
        } catch (error) {
            return done(error)
        }
    }));
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });
    passport.deserializeUser(async (id, done) => {
        let user = await userService.findById(id);
        done(null, user);
    })
}
export default initializePassport;