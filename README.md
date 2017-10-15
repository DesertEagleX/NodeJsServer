# NodeJsServer

博客地址：http://www.jianshu.com/p/7a10af7aff62

## Modules 清单


     1. Promise 
     2. jpush-sdk （推送）
     3. http
     4. request 
     5. validator（数据验证）
     6. mysql （数据库）
     7. socket.io （长连接）
     8. redis （定时任务）
     9. moment （时间处理）

## 技术点清单

     1. mysql 事务管理（见：db.js）
     2. 数据库查询封装（见：db.js）
     2. socket.io 长连接 （见：socket_emitter.js）
     3. 请求数据合法性验证 （见：*_validator.js）
     4. 微信授权 （见：WXSDKAPI.js）
     5. 向公众号用户发送模板消息（见：WXOrderStatusSender.js）


为了保证服务器能正常启动，项目工程未做大的改动，只是删剪了一些敏感信息，启动服务器之前需配置如下信息：

    db -> config -> db-config.js

    // DB数据库配置文件
    'use strict';
    
    module.exports = {
        mysql: {
            host: '127.0.0.1', // mysql服务器地址
            user: 'root', // 数据库用户名
            password: '', // 数据库密码
            database:'db_recycle', // 用户端数据库
            port: 3306 // 端口
        }
    };

另外 `SQL` 文件你可以在工程根目录找到.


如有问题请尽量在微信公众号（`DevTipss`）文章下评论，私信超时后无法进行回复，所以请尽量留下评论。
