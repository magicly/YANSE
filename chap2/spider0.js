const fs = require('fs');
const http = require("http");

const HTML_PREFIX = 'http://www.mm131.com'
const IMG_PREFIX = 'http://img1.mm131.com/pic'

function download(url, callback) {
  http.get(url, res => {
    let data = [];
    res.on('data', chunk => {
      data.push(chunk)
    });
    res.on("end", function () {
      callback(null, Buffer.concat(data));
    });
  }).on("error", err => {
    callback(err);
  });
}

function getImage(url, dest) {
  console.log(url, dest)
  download(url, (err, data) => {
    if (err) console.log(url, err);
    fs.writeFile(dest, data, err => {
      if (err) console.log(url, err);
      else console.log(url, 'saved...');
    })
  })
}

function getAllImage(tag, id, total) {
  const url = `${IMG_PREFIX}/${id}/`;
  for (let i = 1; i <= total; i++) {
    getImage(url + i + '.jpg', `img/${tag}/${i}.jpg`)
  }
  console.log('download pic finished...')
}
getAllImage('qingchun', 2124, 24);