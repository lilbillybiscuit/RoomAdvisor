// Import our config file
const config = require("../../config");

// Import some other libraries/SDKs we'll need for this file as well
const { DynamoDBClient, ListTablesCommand } = require("@aws-sdk/client-dynamodb");

exports.helloworld = function (request, result) {
    result.json(config.name);
}


exports.send_simple_information = function(request, result) {
    console.log(request);
    var object = {
        "name": "John",
    };
    result.json(object);
}