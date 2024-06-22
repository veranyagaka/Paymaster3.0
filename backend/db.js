const mysql = require('mysql2/promise');
const dbConfig = require('./config.js');
console.log('dbConfig:', dbConfig);
console.log('Database configuration:', dbConfig.host);

console.log('Database configuration:', dbConfig.database);

async function connectToDatabase() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to the CLOUD MySQL database');
    return connection;
  } catch (err) {
    console.error('Error connecting to CLOUD MySQL:', err);
    throw err;
  }
}

module.exports = connectToDatabase;
