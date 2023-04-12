module.exports = {
    // This is the function that will be called when the user tries to access a protected route
    // It will check if the user is logged in, and if they are, it will call the next() function
    // which will allow the user to access the protected route
    // If the user is not logged in, it will redirect them to the login page
    ensureAuthenticated: function (request, result, next) {
        if (request.isAuthenticated()) {
            return next();
        }
        result.redirect("/login");
    }
}

