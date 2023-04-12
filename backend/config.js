module.exports = {
    name: "hello-world",
    version: "1.0.0",
    postgres: {
        host: "localhost",
        port: 5432,
        user: "postgres",
        password: "f2863a1386c1819243d502b7",
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
    }
}