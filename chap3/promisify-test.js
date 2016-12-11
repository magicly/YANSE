const Promise = require('bluebird');

const fs = Promise.promisifyAll(require('fs'));

fs.readFileAsync('./README.md').then(data => {
  console.log(data)
});