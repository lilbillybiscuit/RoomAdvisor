const passport = require("passport");
var CLIENT_URL = "http://localhost:3000" || process.env.CLIENT_URL;

exports.loginSuccess = function (request, result) {
    if (request.isAuthenticated()) {
        // redirect user to frontend at /home
        result.redirect(`${CLIENT_URL}/home`);
        return;
    }
    return result.status(401).json({
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
    request.logout();
    result.redirect(`${CLIENT_URL}/logout`);
}

// const yalecas = require("./strategies/yale-cas");
exports.cas_passport_auth = passport.authenticate("yalecas",
    {
        failureRedirect: "/api/auth/login/failed",
        successRedirect: "/api/auth/login/success"
    }
)

exports.checkAuthenticated = function (request, result) {
    if (request.isAuthenticated()) {
        return result.status(200).json({
            authenticated: true,
            message: "User is authenticated",
            user_id: request.user.id,
            user_name: request.user.displayName,
        });
    }
    return result.status(200).json({
        authenticated: false,
        message: "User is not authenticated",
    });
}