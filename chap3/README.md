
# callback hell

```
step1(function (value1) {
    step2(value1, function(value2) {
        step3(value2, function(value3) {
            step4(value3, function(value4) {
                // Do something with value4
            });
        });
    });
});
```

# promise 

![Promise](https://mdn.mozillademos.org/files/8633/promises.png)

```
promisedStep1
.then(promisedStep2)
.then(promisedStep3)
.then(promisedStep4)
.then(function (value4) {
    // Do something with value4
})
.catch(function (error) {
    // Handle any error from all above steps
})
```
[Bluebird](https://github.com/petkaantonov/bluebird)的promisify和promisifyAll可以把callback形式的api转成promise。
```
const Promise = require('bluebird');

const fs = Promise.promisifyAll(require('fs'));

fs.readFileAsync('./README.md').then(data => {
  console.log(data)
});
```

# generator

感觉已过时， 请用promise和async/await吧。

# async/await

```
var sleep = function (time) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve();
        }, time);
    })
};

var start = async function () {
    // 在这里使用起来就像同步代码那样直观
    console.log('start');
    await sleep(3000);
    console.log('end');
};

start();
```
当前最新的Node.js v7已经支持async/await了， 只是需要开启flag。
```
node --harmony-async-await await-test.js
```

# others
1. [RxJS](https://github.com/Reactive-Extensions/RxJS)
不知道RxJS的， 知道AngularJS吧。 ng2核心是基于RxJS的！
RxJS需要对stream和函数式编程有比较升入的了解， 后面再讲。
```
$http.get(url) 
  .map(value => value + 1) 
  .filter(value => value !== null) 
  .forEach(value => console.log(value)) 
  .subscribe((value) => { 
    console.log('do something.'); 
  }, (err) => { 
    console.log(err); 
  }); 
```
2. [async](https://github.com/caolan/async)
3. ...


# refs
1. https://github.com/i5ting/asynchronous-flow-control
2. https://cnodejs.org/topic/560dbc826a1ed28204a1e7de
3. http://sporto.github.io/blog/2012/12/09/callbacks-listeners-promises/
4. https://github.com/petkaantonov/bluebird
5. https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise
6. https://promisesaplus.com/
7. https://github.com/caolan/async
8. http://www.ruanyifeng.com/blog/2015/05/async.html
9. http://www.alloyteam.com/2015/12/hey-async-await-me/
10. https://cnodejs.org/topic/5640b80d3a6aa72c5e0030b6
11. https://blog.leancloud.cn/3910/

> Written with [StackEdit](https://stackedit.io/).