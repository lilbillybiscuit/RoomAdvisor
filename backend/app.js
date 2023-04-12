require('module-alias/register')
// Declare the Express server and the port that it will listen on
var express = require("express");
var app = express();
var port = process.env.PORT || 4000;

const isProduction = process.env.NODE_ENV === "production";

const passport = require("passport");
passport.serializeUser( (user, done) => {
    done(null, user);
});
passport.deserializeUser( (user, done) => {
    done(null, user);
})


// Declare external packages
var config = require("@config"); //Do not push this to the repository

// Define the middleware that will be used by the server
var cors = require("cors");
const session = require('express-session');
const RedisStore = require("connect-redis").default
const redisClient = require("@utils/database/redis-pool");

// Declare some middleware (functions that can modify the request and response objects)
app.use(express.urlencoded( { extended: true }));
app.use(express.json());
// use express-session for session management

if (isProduction) {
    app.use(
        session({
            store: new RedisStore({
                client: redisClient
            }),
            secret: config.session.secret,
            resave: false,
            saveUninitialized: false,
            secure: true,
            httpOnly: true,
            cookie: {
                maxAge: config.session.cookie.maxAge,
                secure: config.session.cookie.secure,
            },
        })
    );
    app.use(
        cors({
            credentials: true,
            // clientIp
            origin: process.env.CLIENT_URL,
            methods: "GET, POST, PUT, DELETE"
        })
    )
} else {
    app.use(session({
        secret: "f9aisdf",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: config.session.cookie.maxAge,
            secure: config.session.cookie.secure,
        }
    }));


    app.use(
        cors({
            credentials: true,
            origin: "http://localhost:3000",
            methods: "GET, POST, PUT, DELETE",
        })
    );
}

// Initialize passport strategies
const YaleCASStrategy = require("@controllers/authentication/strategies/yale-cas");
passport.use(YaleCASStrategy);

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
