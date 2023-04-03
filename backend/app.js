
// Declare the Express server and the port that it will listen on
var express = require("express");
var app = express();
var port = process.env.PORT || 4000;

const isBeta = process.env.NODE_ENV === "beta";
const isProduction = process.env.NODE_ENV === "production" || isBeta;

// Declare Yale CAS authentication
const YaleCASStrategy = require("passport-cas2").Strategy;
const passport = require("passport");
const cas = new YaleCASStrategy(
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

passport.use(cas);
passport.serializeUser( (user, done) => {
    done(null, user);
});
passport.deserializeUser( (user, done) => {
    done(null, user);
})


// Declare external packages
var config = require("./config"); //Do not push this to the repository

// Define the middleware that will be used by the server
var cors = require("cors");
var session = require("express-session");
var cookieSession = require("cookie-session");

// Declare some middleware (functions that can modify the request and response objects)
app.use(express.urlencoded( { extended: true }));
app.use(express.json());
// use express-session for session management

if (isProduction) {
    app.set("trust proxy", 1);
    app.use(
        cookieSession({
            name: "__session",
            keys: ["key1"],
            maxAge: 24 * 60 * 60 * 100,
            secure: true,
            httpOnly: true,
        })
    );
    app.use(
        cors({
            credentials: true,
            // clientIp
            origin: isBeta? "https://beta.roomadvisor.org": "https://roomadvisor.org",
            methods: "GET, POST, PUT, DELETE",
        })
    )
} else {
    app.use(
        cookieSession({
            name: "__session",
            keys: ["key1"],
            maxAge: 24 * 60 * 60 * 100,
        })
    );
    app.use(
        cors({
            credentials: true,
            // clientIp
            origin: "http://localhost:3000",
            methods: "GET, POST, PUT, DELETE",
        })
    );
}

app.use(passport.initialize());
app.use(passport.session());

// Asynchronous server startup: allows support for multiprocessing
module.exports.listen = () => {

    // Declare the routes for the API, imported from the routes.js file
    // Don't worry about how this works now, just define all of your routes in routes.js
    var routes = require("./api/routes/routes");
    routes(app);

    // Start the server
    app.listen(port, function () {
        console.log(`PID ${process.pid}: API listening on port ${port}`);
    });
};

module.exports.listen();