const pool = require("@utils/database/pool");
exports.getReviews = function (request, result) {
    const str = [
        {
            name: "ViewReviews",
            msg: "Test",
        }
    ];
    result.json(str);
}

exports.addFavorite = function (request, result) {
    result.end("NA");
}