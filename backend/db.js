const mysql = require('mysql2/promise');
const dbConfig = require('./config.js');
const pool = mysql.createPool(dbConfig);

console.log('dbConfig:', dbConfig);
console.log('Database host:', dbConfig.host);

console.log('Database database:', dbConfig.database);


async function query(sql, values) {
  const connection = await pool.getConnection();
  try {
    const [results] = await connection.execute(sql, values);
    console.log('Connected to the CLOUD MySQL database');
    return results;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
}

const database = {
  query: query,
  pool: pool
};


module.exports = pool;
