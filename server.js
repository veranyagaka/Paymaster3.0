const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 3000;
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/landingpage.html');
});
//redirection trial - to signin.php
const { spawn } = require('child_process');
const path = require('path');
app.get('/signin.php', (req, res) => {
    const phpPath = '/opt/lampp/bin/php-cgi'; // Replace 'full/path/to/php-cgi' with the actual path to php-cgi
    const phpScriptPath = path.join(__dirname, 'signin.php');
    
    const php = spawn(phpPath, ['-f', phpScriptPath]);

    php.stdout.on('data', (data) => {
        res.send(data.toString());
    });

    php.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    php.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
});
////ends here
// -registration.php
app.get('/registration.php', (req, res) => {
    const phpPath = '/opt/lampp/bin/php-cgi'; // Replace 'full/path/to/php-cgi' with the actual path to php-cgi
    const phpScriptPath = path.join(__dirname, 'registration.php');
    
    const php = spawn(phpPath, ['-f', phpScriptPath]);

    php.stdout.on('data', (data) => {
        res.send(data.toString());
    });

    php.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    php.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });});
// ends here
app.listen(port, () => {
    console.log(`PayMaster app listening at http://localhost:${port}`);
});