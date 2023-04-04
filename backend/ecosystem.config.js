module.exports = {
    apps: [
        {
            name: "RoomAdvisor Backend",
            script: "app.js",
            instances: "max",
            exec_mode: "cluster",
            autorestart: true,
            watch: true,
            env_beta: {
                NODE_ENV: "production",
                RUN_PM2: "true",
                API_URL: "https://beta.roomadvisor.io/api",
                PORT: 4000,
                CLIENT_URL: "https://beta.roomadvisor.io",
            },
            env_prod: {
                NODE_ENV: "production",
                RUN_PM2: "true",
                API_URL: "https://roomadvisor.io/api",
                PORT: 4000,
                CLIENT_URL: "https://roomadvisor.io",
            }
        }
    ]
};