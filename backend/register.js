const bcrypt = require('bcrypt');
const database = require('./database.js')

async function registerUser(userData) {
    const { username, email, password } = userData;
    try {
      // Hash the password using bcrypt
      const saltRounds = 10; // Adjust salt rounds as needed
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      // Insert user data into the database
      await database.query('INSERT INTO admin (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);
      console.log('User registered successfully!'); // Or handle success response
  
    } catch (err) {
      console.error(err);
      // Handle errors (e.g., duplicate username, database connection issues)
    }
  }
  
  // Example usage (assuming user data is received from another source like a command-line argument or API request)
  const userData = { username: 'vera', email: 'vera.nyagaka@strathmore.edu', password: '123' };
  registerUser(userData);