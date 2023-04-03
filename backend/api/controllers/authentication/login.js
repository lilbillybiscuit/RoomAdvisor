
const passport = require("passport");
const isBeta = process.env.NODE_ENV === "beta";
var CLIENT_URL = "http://localhost:3000" || process.env.CLIENT_URL;

exports.loginSuccess = function (request, result) {
    console.log("login success?");
    if (request.user) {
        return result.status(200).json({
            success: true,
            message: "Successfully logged in with CAS",
            user: request.user,
            cookies: request.cookies,
        });
    }
    return result.status(200).json({
        success: false,
        message: "Failed to Login with CAS",
    });
}

exports.loginFailed = function (request, result) {
    result.status(401).json({
        success: false,
        message: "Failed to Login with CAS",
    });
}

exports.logout = function (request, result) {
    console.log("here in logout");
    request.logout();
    result.redirect(`${CLIENT_URL}/logout`); // what...?
}

exports.cas_passport_auth = passport.authenticate("cas", { failureRedirect: "/auth/login/failed" })

exports.cas = function (request, result) {
    // Successful authentication, redirect check if user is valid.

    // INSTEAD OF JUST REDIRECTING, SET USER NETID ON A COOKIE
    // RETRIEVE THE COOKIE FROM /auth/login/success
    console.log("redirect to check user validity");
    result.redirect(`${CLIENT_URL}/viewreviews`);
    
}