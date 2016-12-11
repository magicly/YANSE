var sleep = function (time) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve('data');
        }, time);
    })
};

var start = async function (time) {
    // 在这里使用起来就像同步代码那样直观
    console.log('start');
    const result = await sleep(time);
    console.log('end', Date.now());
};

start(1000);

t2 = Date.now();
while (true) {
  if (Date.now() - t2 > 3000) break;
}

start(2000);