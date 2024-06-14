const { createPool } = require("mysql2/promise");

const pool = createPool({
    host: "localhost",
    user: "root",
    password:"",
    database:"paymaster",
    port: 3307,
    connectionLimit: 10
})

module.exports = pool