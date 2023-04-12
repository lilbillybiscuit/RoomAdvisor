// transparent middleware to warn of deprecation
exports.deprecated = function (request, result, next) {
    // use red color for deprecation
    console.warn("\x1b[31m%s\x1b[0m", "WARNING: " + request.originalUrl + " is deprecated and may not work in production. It will be removed in the future.");
    return next();
}
