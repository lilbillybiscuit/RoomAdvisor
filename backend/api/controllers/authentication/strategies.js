module.exports = function (passport) {
    const YaleCASStrategy = require("@controllers/authentication/strategies/yale-cas");
    passport.use('yalecas', YaleCASStrategy);

    passport.serializeUser( (user, done) => {
        // console.log("serialize user")
        // console.log(user)
        done(null, user);
    });
    passport.deserializeUser( (user, done) => {
        // console.log("deserialize user")
        // console.log(user)
        done(null, user);
    })
}