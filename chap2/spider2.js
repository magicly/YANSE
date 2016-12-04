const request = require('request');
const rp = require('request-promise');
const iconv = require('iconv-lite');
const fs = require('fs');
const cheerio = require('cheerio'); // Basically jQuery for node.js
const Promise = require('bluebird');

const HTML_PREFIX = 'http://www.mm131.com'
const IMG_PREFIX = 'http://img1.mm131.com/pic'
const allIds = [];

function getNextId2($) {
  const pre = $(".updown_l");
  let strNext = pre.attr('href');

  strNext = strNext.slice(strNext.lastIndexOf('/') + 1);
  strNext = strNext.slice(0, strNext.indexOf('.'));

  return parseInt(strNext);
}
function getNextId(str) {
  let strNext = str.slice(str.indexOf('updown_l'), str.indexOf('updown_r'))
  strNext = strNext.slice(strNext.lastIndexOf('/') + 1);
  strNext = strNext.slice(0, strNext.indexOf('.'));

  return parseInt(strNext);
}
function getTotalPic2($) {
  const node = $(".content-page .page-ch");
  const text = node.text();
  return parseInt(text.slice(1, text.indexOf('页')), 10);
}
async function getTotalPic(str) {
  str = str.slice(str.indexOf('上一页'), str.indexOf('下一页'))
  const end = str.lastIndexOf('page-en">') + 'page-en">'.length;
  str = str.slice(end);
  str = str.slice(0, str.indexOf('<'));

  return parseInt(str, 10);
}

const N = 200;
let num = 0;
async function getAllImgFrom({tag, id}) {
  console.log(tag, id)
  rp({
    url: HTML_PREFIX + '/' + tag + '/' + id + '.html',
    encoding: null
  }).then(async body => {
    const buf = iconv.decode(body, 'gb2312');
    const jQuery = cheerio.load(buf);
    const totalPic = getTotalPic2(jQuery);
    console.log('totalPic: ', totalPic);

    const promises = [];
    for (let i = 1; i <= totalPic; i++) {
      const promise = getImage(`${IMG_PREFIX}/${id}/${i}.jpg`, `img/${tag}/${id}-${i}.jpg`);
      await promise;
      promises.push(promise);
    }
    // await Promise.all(promises);

    const nextId = getNextId2(jQuery);
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

async function getAllImage() {
  const url = 'http://img1.mm131.com/pic/519/';
  const promises = [];
  for (let i = 1; i < 10; i++) {
    const promise = getImage(url + i + '.jpg', 'img/' + i + '.jpg')
    promises.push(promise);
  }
  try {
    const r = await Promise.all(promises);
    console.log('r: ', r);
  } catch (err) {
    console.log('error: ', err);
  }
  // getImage(url + i + '.jpg', 'img/' + i + '.jpg')
  //   .then(result => {
  //     console.log('result: ', result);
  //   }).catch(err => {
  //     console.log('error: ', err);
  //   });
}
// getAllImage();

// start
//getAllImgFrom({ tag: 'mingxing', id: 243 })
getAllImgFrom({ tag: 'xinggan', id: 2602 })