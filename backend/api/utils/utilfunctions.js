// transparent middleware to warn of deprecation
exports.deprecated = function (request, result, next) {
    // use red color for deprecation
    console.warn("\x1b[31m%s\x1b[0m", "WARNING: " + request.originalUrl + " is deprecated and may not work in production. It will be removed in the future.");
    return next();
}

exports.returnSuccessNotImplemented = function (request, result) {
    // return a 200 status code with a message saying that the endpoint is not implemented
    result.status(200).json({ "message": "This endpoint is not implemented yet, but this is a success response" });
}

exports.returnErrorNotImplemented = function (request, result) {
    // return a 501 status code with a message saying that the endpoint is not implemented
    result.status(501).json({ "message": "This endpoint is not implemented yet, but this is a failure response" });
}