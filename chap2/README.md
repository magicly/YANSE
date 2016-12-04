从网络上抓取美女图片只需要三步：
1. 找到包含美女图片的网页
2. 提取美女图片url
3. 下载图片

# 找目标网页

很简单， 大家都有自己资源吧（欢迎pull request共享）， 我就不细说了，实在没有的可以看这里[美女](https://www.baidu.com/s?wd=美女), [大美女](https://www.google.com.hk/search?q=美女)。
我从百度搜索里面找了一个网站， 从首页挑了一个稍微未成年适宜的（以免有高中生看此文）， 我们今天就分析它。 http://www.mm131.com/qingchun/2124.html

# 提取图片url

需要会一些html知识， 查看第一步里的页面源码， 找到图片的src即可。 可以用chrome的元素审查工具查看你感兴趣的图片， 找到dom节点。
```
<img alt="优星馆赵婉妮甜美笑容令人着迷(图1)" src="http://img1.mm131.com/pic/2124/1.jpg">
```

点击下一页可以找到更多的图片， 经过分析，发现图片的url跟页面url有一定关系， 只需要把页面url里面最后id（数字部分）替换到图片里面即可。
```
picUrl = imgUrlPrefix + id + '/' + i + '.jpg'
```
其中i表示第几张图片， 可以页面里找到，总共有多少张图片：
```
<span class="page-ch">共24页</span>
```

这样我只要for循环一下， 就可以得到每个页面里面包含的所有图片了！啊哈哈哈！ 算是我运气好， 一般而言不会这么简单的， 页面跟里面包含的图片未必有如此简单直直接的关系。

# 下载图片

从第二步里已经获取了某个页面下所有的图片url， 这个时候有N多种方法把图片下载下来。

比如一个一个手下！哈哈， 太累！ 可以迅雷！（别说你没有用过， 可是你怎么知道用迅雷批量下载一批url么？）还可以用[wget](https://www.gnu.org/software/wget/)，或者[curl](https://curl.haxx.se/)。请自行google如何安装使用， 或者[RTFM](https://zh.wikipedia.org/wiki/RTFM)。

ps， wget很强大， 可以直接下载整个网站！ curl的网址https://curl.haxx.se怎么总感觉色色的。

# Show me the code!
经过上面的分析，我们可以写出最简单版本， 即给定某个url， 下载里面包含的所有图片。 下面我们用Node.js完成上面三个步骤， naive版本：
```
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
```
这里有几个问题需要解决：
1. 总数24是我们写死的， 每个页面不一样， 我们应该每个页面提取
2. html的url是写死的， 我们如何知道下一个页面的url呢

再次对dom结构进行分析， 发现总数是包含在这里的：
```
<span class="page-ch">共24页</span>
```
最简单的， 我们可以字符串处理， 用indexOf， substring等得到结果：
```
function getTotalPic(str) {
  const startStr = '<span class="page-ch">共'
  str = str.slice(str.indexOf(startStr) + startStr.length);
  str = str.slice(0, str.indexOf('页'));
  console.log('totalPic: ', str)

  return parseInt(str, 10);
}
```
那要怎么从当前页面知道下一个页面的url呢。 你可以这样问自己， 你是怎么找到下一页的呢？ 哦， 页面里面有“上一组”和“下一组”！
```
<div class="updown"><a href="http://www.mm131.com/qingchun/2119.html" class="updown_l">俏皮女生卓芷伊清晨私房小乳沟微露</a> <a href="http://www.mm131.com/qingchun/2161.html" class="updown_r">菠萝社美女柳侑绮比基尼清新写真</a> </div>
```
于是我们可以解析出来下一个url:
```
function getNextId(str) {
  let strNext = str.slice(str.indexOf('updown_l'), str.indexOf('updown_r'))
  strNext = strNext.slice(strNext.lastIndexOf('/') + 1);
  strNext = strNext.slice(0, strNext.indexOf('.'));

  return parseInt(strNext);
}
```
这里我解析的是下一组页面， 然后我们就可以写个递归程序
1. 提取图片url
2. 找到下一组图片url， 如果没有则结束， 否则调到1继续。
这样我们就可以把整个网站的图片都下载下来了。代码看[这里](./spider1.js)。

# 有待改进
前面所讲的知识虽然简陋， 但是已经可以完全作出一个爬虫， 抓取任何你想要的东西了。 这里我们给出几个可以改善或者有可能需要解决的问题：
1. 直接用字符串操作”显得“很low， 而且稍微复杂点的页面， 可能要做比较多的工作提取所想要的东西。 可以用正则表达式改进， 当然写好一个正确高效的正则表达式也是很考验人的。推荐使用[cheerio](https://github.com/cheeriojs/cheerio)。
```
Fast, flexible, and lean implementation of core jQuery designed specifically for the server. 
```
简单来说就是在Node.js里面可以用jQuery操作DOM结构！can't Diaoer any more!

2. 一般网站都会有反爬虫机制， 比如访问太多会弹出验证码或者返回非正常内容（如404）， 甚至直接封IP。
对于IP访问次数有限制的， 我们可以用代理服务器，google一下一堆教程以及免费代理。
弹出验证码， 现在简单点的验证码已经可以直接用OCR软件比较好地识别了， 比如google的[tesseract](https://github.com/tesseract-ocr/tesseract)。如何使用请自行google。
对于很复杂的验证码， 如果你有能力， 可以自己用机器学习训练模型去做识别， 也可以用更”强大“的人肉识别！请自行google打码平台。

3. 有些网站是需要登录注册的， 你可以自己手动注册一个账号， 先模拟登录， 获取到登录cookie， 然后每次爬取的时候带上cookie就可以了。

ok， 爬虫相关的基础知识讲得差不多了， 总结一下一个爬虫无非就是：
1. 找到初始链接，获取初始页面html
2. 分析页面结构， 用字符串、正则表达式、DOM结构处理工具等提取感兴趣的内容， 并找到下一个页面的url
3. 递归进行1和2.

希望大家善用技术， 造福人类！欢迎交流~
