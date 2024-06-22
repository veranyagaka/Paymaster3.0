const fs = require('fs');
const path = require('path');

/**
 * Get a list of all files in a directory recursively, ignoring hidden files
 * @param {string} dirPath - The directory path
 * @param {Array} arrayOfFiles - The array to collect file paths
 * @returns {Array} - An array of file paths
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
        const filePath = path.join(dirPath, file);
        const isHidden = /^\./.test(file); // Check if file name starts with a dot
        
        if (fs.statSync(filePath).isDirectory()) {
            arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
        } else if (!isHidden) {
            arrayOfFiles.push(filePath);
        }
    });

    return arrayOfFiles;
}

// Example usage
const directoryPath = path.join(__dirname);
const filesList = getAllFiles(directoryPath);
console.log(filesList);
