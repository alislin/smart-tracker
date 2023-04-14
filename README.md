
### 使用方式

```js
    npm i
    npm run start
```

chrome打开: localhost:3000

打开控制台

随便点击页面上的元素

查看控制台console.log的输出即可

调用

```html
    <script src="./dist/tracker.min.js"></script>
    <script>
        Tracker
            .config({
                per: 0.9,
                api: "http://api.gateway.com",
            })
            .install();

        Tracker.appendData({userid:"123456"});
    </script>

```

