const YaleCASStrategy = require("passport-cas2").Strategy;

const yalecas = new YaleCASStrategy(
    {
        version: "CAS2.0",
        casURL: "https://secure.its.yale.edu/cas",
    },
    // This is the `verify` callback
    function (req, profile, done) {
        // profile get returned to the '/auth/login/success' route as req.user

        // therefore syntax = done(null, {data returned to the route})
        done(null, profile);
    }
);

module.exports = yalecas;