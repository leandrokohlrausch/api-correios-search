'use strict'

const fs = require('fs');

module.exports = {

  eachFilesPath : (path, callback) => {
    fs.readdir(path, (err, files) => {
      files.forEach((file) => {
        callback(file);
      });
    });
  }

};