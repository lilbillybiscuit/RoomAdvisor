const isProduction = process.env.NODE_ENV === 'production';

exports.notFound = function(req, res) {
    var status = 404;
    if (isProduction) status = 416;
    res.status(status).json({
      "error": "Not Found",
      "message": "The resource you requested could not be found.",
      "code": 404,
      "path": req.path
    });
}