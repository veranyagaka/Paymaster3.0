const { createPool } = require("mysql2/promise");

const pool = createPool({
    host: "localhost",
    user: "root",
    password:"",
    database:"paymaster",
    port: 3307,
    connectionLimit: 10
})
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to MySQL');
        connection.release();
    } catch (err) {
        console.error('Error connecting to MySQL:', err);
    }
}

// Call the testConnection function
testConnection();
module.exports = pool