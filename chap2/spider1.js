const request = require('request');
const rp = require('request-promise');
const iconv = require('iconv-lite');
const fs = require('fs');
const Promise = require('bluebird');

const HTML_PREFIX = 'http://www.mm131.com'
const IMG_PREFIX = 'http://img1.mm131.com/pic'
const allIds = [];

function getNextId(str) {
  let strNext = str.slice(str.indexOf('updown_l'), str.indexOf('updown_r'))
  strNext = strNext.slice(strNext.lastIndexOf('/') + 1);
  strNext = strNext.slice(0, strNext.indexOf('.'));

  return parseInt(strNext);
}
function getTotalPic(str) {
  const startStr = '<span class="page-ch">共'
  str = str.slice(str.indexOf(startStr) + startStr.length);
  str = str.slice(0, str.indexOf('页'));
  console.log('totalPic: ', str)

  return parseInt(str, 10);
}

const N = 1;
let num = 0;
async function getAllImgFrom({tag, id}) {
  console.log(tag, id)
  rp({
    url: HTML_PREFIX + '/' + tag + '/' + id + '.html',
    encoding: null
  }).then(async body => {
    const buf = iconv.decode(body, 'gb2312');
    const totalPic = getTotalPic(buf);
    console.log('totalPic: ', totalPic);

    const promises = [];
    for (let i = 1; i <= totalPic; i++) {
      const promise = getImage(`${IMG_PREFIX}/${id}/${i}.jpg`, `img/${tag}/${id}-${i}.jpg`);
      await promise;
      promises.push(promise);
    }
    // await Promise.all(promises);

    const nextId = getNextId(buf);
    console.log('nextId: ', nextId)
    allIds.push(nextId);
    if (num++ >= N) {
      console.log('num is ', num);
      console.log('finished: ', allIds);
      return;
    }
    getAllImgFrom({ tag, id: nextId })
  }).catch(err => {
    console.log('request error: ', id, err);
    console.log('finished: ', allIds);
  })
}

function getImage(url, dest) {
  console.log('getImage: ', url, dest)
  return new Promise((resolve, reject) => {
    request(url)
      .on('end', () => {
        console.log('end....')
        resolve('ok');
      })
      .on('error', error => {
        console.log('error in getImage: ', error)
        reject(error);
      }).pipe(fs.createWriteStream(dest))
  })
}

getAllImgFrom({ tag: 'xinggan', id: 2602 })