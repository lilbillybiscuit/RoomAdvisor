const { Pool } = require('pg');
const config = require('@config');

const pool = new Pool({
    user: config.postgres.user,
    host: config.postgres.host,
    database: config.postgres.database,
    password: config.postgres.password,
    port: config.postgres.port,
})

module.exports = pool;