module.exports = {
    apps: [
        {
            name: "RoomAdvisor Backend",
            script: "app.js",
            instances: "max",
            exec_mode: "cluster",
            autorestart: true,
            watch: true,
            env: {
                NODE_ENV: "production",
                RUN_PM2: "true",
            }
        }
    ]
};