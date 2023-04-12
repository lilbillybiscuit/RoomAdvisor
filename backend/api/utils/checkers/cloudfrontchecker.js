const config = require("@config")

module.exports = function (request, result, next) {
    // check if NODE_ENV is not production
    if (process.env.NODE_ENV !== "production") {
        return next();
    }
    // check if the request is from CloudFront by checking the headers
    if (request.headers[config.header_name] === config.header_value) return next();
    // if the request is not from CloudFront, then return an unauthorized error
    return result.status(400).json({
        error: "Unauthorized",
        message: "All requests must be made from CloudFront",
        code: 400
    });
}