const YaleCASStrategy = require("passport-cas2").Strategy;
const yalecas = new YaleCASStrategy(
    {
        version: "CAS2.0",
        casURL: "https://secure.its.yale.edu/cas",
    },
    // This is the `verify` callback
    function (req, profile, done) {
        // console.log(req);
        // profile get returned to the '/auth/login/success' route as req.user
        var result_profile= {
          id: "yale-"+profile.id,
          displayName: profile.displayName,
        }
        // therefore syntax = done(null, {data returned to the route})
        done(null, result_profile);
    }
);

module.exports = yalecas;