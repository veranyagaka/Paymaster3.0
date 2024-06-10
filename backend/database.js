const { createPool } = require("mysql2");

const pool = createPool({
    host: "localhost",
    user: "root",
    password:"",
    database:"paymaster",
    connectionLimit: 10
})

module.exports = pool