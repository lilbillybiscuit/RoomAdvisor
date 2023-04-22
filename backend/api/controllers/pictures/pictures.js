const config = require("@config");
const pool = require("@utils/database/pool");
// I'm not sure if you actually need these I just chugged them in here

const AWS = require('aws-sdk');
exports.getSignedUrl = function (request, result) {
    const s3 = new AWS.S3({
        accessKeyId: 'AKIAZWVQQ3B5CUJJ4W6H',
        // note: need to properly escape characters
        secretAccessKey: 'ybOdivC\+XLW\/taB5C4muxO\/yRdsaZryQL9yyPEve',
        region: 'us-east-1'
    });

    const params = {
        Bucket: 'buwei-roomadvisor-bucket',
        // no slash in front of the key
        Key: 'buwei-roomadvisor-bucket/hi.HEIC',
        // need to specify content type for some reason otherwise 
        // it returns Signature does not match error
        ContentType: "image/heic",
        Expires: 600 // expiration time in seconds
    };

    const url = s3.getSignedUrl('putObject', params);

    console.log(url); // log the presigned URL to the console for testing
    result.json(url);
}

// testing generating random key for the url, but this need to match the file name
function generateRandomKey(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return result;
}