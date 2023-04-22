const config = require("@config");
const pool = require("@utils/database/pool");
// I'm not sure if you actually need these I just chugged them in here

const AWS = require('aws-sdk');
exports.getSignedUrl = function (request, result) {
    const s3 = new AWS.S3({
        accessKeyId: 'AKIA5OY4ERV5ZEH22UFM',
        // note: need to properly escape characters
        secretAccessKey: 'HAUiE3q\/\+NDJqbI3q6GODiMF1ysnsvHdW\+o1XHpm',
        region: 'us-east-2'
    });

    const params = {
        Bucket: 'roomadvisorsandbox-upload-temp',
        // no slash in front of the key
        Key: 'roomadvisorsandbox-upload-temp/hi.HEIC',
        // need to specify content type for some reason otherwise 
        // it returns Signature does not match error
        ContentType: "image/heic",
        Expires: 600 // expiration time in seconds
    };

    const url = s3.getSignedUrl('putObject', params);

    // console.log(url); // log the presigned URL to the console for testing
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