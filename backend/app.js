require('module-alias/register')
// Declare the Express server and the port that it will listen on
var express = require("express");
var app = express();
var port = process.env.PORT || 4000;

const isProduction = process.env.NODE_ENV === "production";

const passport = require("passport");
// Initialize passport strategies
var strategies = require("@controllers/authentication/strategies");
strategies(passport);


// Declare external packages
var config = require("@config"); //Do not push this to the repository

// Define the middleware that will be used by the server
var cors = require("cors");
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
// const RedisStore = require("connect-redis").default
// const redisClient = require("@utils/database/redis-pool");

// Declare some middleware (functions that can modify the request and response objects)
app.use(express.urlencoded( { extended: true }));
app.use(express.json());
// use express-session for session management

if (isProduction) {
    app.use(
        session({
            store: new pgSession({
                pool: require("@utils/database/pool"),
                tableName: "session",
                createTableIfMissing: true,
            }),
            secret: config.session.secret,
            resave: false,
            saveUninitialized: true,
            secure: true,
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
        saveUninitialized: true,
        store: new pgSession({
            pool: require("@utils/database/pool"),
            tableName: "session",
            createTableIfMissing: true,
        }),
        cookie: {
            maxAge: config.session.cookie.maxAge,
            secure: false,

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
