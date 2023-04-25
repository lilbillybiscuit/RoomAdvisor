const utilfunctions = require("@utils/utilfunctions");
module.exports = function(app) {
    // Add all the routes to our APIs here
    // app.route([url]) points to a method, tell Express which method it should execute with
    // the .get, .post, .put, .delete, etc methods, and then pass in the method from the controller
    // that we want to execute. An example is shown below:

    // For now, just think of a controller as a group of API methods in the same category, or are
    // related to each other in some way.

    var simplecontroller = require("@controllers/simplecontroller");
    app.route('/api/helloworld').get(simplecontroller.helloworld);
    app.route('/api/cool').get(simplecontroller.send_simple_information);

    // TODO: Refactor all code such that each path begins with /api/*
    // Will need to involve frontend to change all links
    var authcontroller = require("@controllers/authentication/login");

    app.route("/auth/login/success").get(utilfunctions.deprecated, authcontroller.loginSuccess); // Deprecated
    app.route("/auth/login/failed").get(utilfunctions.deprecated, authcontroller.loginFailed); // Deprecated
    app.route("/auth/cas/logout").get(utilfunctions.deprecated, authcontroller.logout); // Deprecated
    app.route("/auth/cas") // Deprecated
        .get(utilfunctions.deprecated, authcontroller.cas_passport_auth)

    app.route("/api/auth/login/success").get(authcontroller.loginSuccess);
    app.route("/api/auth/login/failed").get(authcontroller.loginFailed);
    app.route("/api/auth/logout").get(authcontroller.logout);
    app.route("/api/auth/login")
        .get(authcontroller.cas_passport_auth)
        .post(authcontroller.cas_passport_auth);

    app.route("/api/auth/check").get(authcontroller.checkAuthenticated);

    var reviewscontroller = require("@controllers/reviews/reviews");
    app.route("/api/comments/reviews/:rid").get(reviewscontroller.getReviews);
    app.route("/api/comments/ratings/:rid").get(reviewscontroller.getRatings);
    app.route("/api/comments/addComment").post(reviewscontroller.addComment);
    app.route("/api/comments/comment/:uid").get(reviewscontroller.getComment);
    app.route("/api/comments/:rid").get(reviewscontroller.getComments);
    app.route("/api/comments/comment/:uid").put(reviewscontroller.editComment);
    
     // TO DELETE
    app.route("/viewreviews").get(utilfunctions.deprecated, reviewscontroller.getReviews);
    // app.route("/addFavorite").post(utilfunctions.deprecated, reviewscontroller.addFavorite);

    app.route("/api/reviews").get(utilfunctions.returnSuccessNotImplemented);
    app.route("/api/reviews").post(utilfunctions.returnSuccessNotImplemented);
    app.route("/api/reviews/:id").get(utilfunctions.returnSuccessNotImplemented);
    app.route("/api/reviews/:id").put(utilfunctions.returnSuccessNotImplemented);

    let dummy = (req, res) => {
        res.json({
            "id": "Pierson-123-AbCdEf",
            "college": "Pierson",
            "entryway": "D",
            "suite_number": "12",
            "accessible": false,
            "pictures": [
                "https://example.roomadvisor.io/f17cac40-8e85-4a67-b1cc-3f3ac185decf.jpg"
            ],
            "size": 900.0,
            "owners": [
                {
                "user_id": "98765",
                "name": "Alice Thompson",
                "url": "https://example.roomadvisor.io/api/users/98765"
                }
            ],
            "numpeople": 4,
            "numdoubles": 1,
            "numsingles": 2,
            "rooms": [
                "https://example.roomadvisor.io/api/rooms/10w9an",
                "https://example.roomadvisor.io/api/rooms/0d9an2",
                "https://example.roomadvisor.io/api/rooms/fjs9ak"
            ]
        });
        return;
    }

    var suitescontroller = require("@controllers/suites/suites");
    app.route("/api/suites/:id").get(suitescontroller.getSuiteInfo);
    app.route("/api/suites/:id").put(suitescontroller.modSuite);
    app.route("/api/suites/:id").delete(suitescontroller.delSuite);
    // app.route("/api/suites").get(suitescontroller.getSuites);
    app.route("/api/suites").get(dummy);
    app.route("/api/suites").post(suitescontroller.addSuite);

    var roomscontroller = require("@controllers/rooms/rooms");
    app.route("/api/rooms/").get(roomscontroller.getRoomInfo);
    app.route("/api/rooms/").post(roomscontroller.addRoom);
    app.route("/api/rooms/:id").get(roomscontroller.getRooms);
    app.route("/api/rooms/:id").put(roomscontroller.modRoom);
    app.route("/api/rooms/:id").delete(roomscontroller.delRoom);

    var userscontroller = require("@controllers/users/users");
    app.route("/api/users/:id").get(utilfunctions.returnSuccessNotImplemented);
    var errors = require("@controllers/errors/errors");
    app.route("*", errors.notFound);
}
