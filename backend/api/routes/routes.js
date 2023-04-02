const passport = require("passport");
module.exports = function(app) {
    // Add all the routes to our APIs here
    // app.route([url]) points to a method, tell Express which method it should execute with
    // the .get, .post, .put, .delete, etc methods, and then pass in the method from the controller
    // that we want to execute. An example is shown below:

    // For now, just think of a controller as a group of API methods in the same category, or are
    // related to each other in some way.

    var simplecontroller = require("../controllers/simplecontroller");
    app.route('/api/helloworld').get(simplecontroller.helloworld);
    app.route('/api/cool').get(simplecontroller.send_simple_information);

    // TODO: Refactor all code such that each path begins with /api/*
    // Will need to involve frontend to change all links
    var authcontroller = require("../controllers/authentication/login");
    app.route("/auth/login/success").get(authcontroller.loginSuccess);
    app.route("/auth/login/failed").get(authcontroller.loginFailed);
    app.route("/auth/cas/logout").get(authcontroller.logout);
    app.route("/auth/cas").get(authcontroller.cas_passport_auth, authcontroller.cas);

    var reviewscontroller = require("../controllers/reviews");
    app.route("/viewreviews").get(reviewscontroller.getReviews);
    app.route("/addFavorite").post(reviewscontroller.addFavorite);


}