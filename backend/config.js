module.exports = {
    name: "hello-world",
    version: "1.0.0",
    postgres: {
        host: "localhost",
        port: 5432,
        user: "roomadvisor",
        password: "password",
        database: "roomadvisor"
    },
    redis: {
        host: "localhost",
        port: 6379,
        password: "8e0e9fe37d566e193637d7c42dc03f71"
    },
    session: {
        secret: "iApJbqcC0y6TxfzUUzCBnxBCuznSKK2jxzjfMY3M",
        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            secure: true,
        }
    },
    cloudfront: {
        header_name: "roomadvisor-cloudfront",
        header_value: "aN9EzNP0oYKrNO4nqxkxd8GyKCD1x8Z6FLwymbrP"
    },
    aws: {
        s3: {
            prefix: "9duh2isod0",
            // {prefix}-upload-temp is used for temporary user storage uploads
            // {prefix}-data is used for permanent user file storage
            // {prefix}-thumbnails is used for permanent user file storage of generated thumbnails
        }
    }
}