const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const validator = require('express-validator');
const response = require('./response/response');
const commonValidator = require('./wx/routes/validator/compon-validator');


//========================== 微信 ==============================//


// 用户接口
const WX_UserRouter = require('./wx/routes/user/user-router');
// 订单
const WX_OrderRouter = require('./wx/routes/order/order-router');
// 区域
const WX_RegionRouter = require('./wx/routes/region/region-router');

// 废品
const WX_ArticleRouter = require('./wx/routes/article/article_router');
// 废品分类
const WX_ArticleCategoryRouter = require('./wx/routes/article/articleCategory_router');

//用户反馈
const WX_FeedBackRouter = require('./wx/routes/feedback/feedback_router');

// 回收员
const EM_Router = require('./em/routes/em_router');
const EM_OrderRouter = require('./em/routes/em_order_router');



//========================== 后台管理 ==============================//
const Manger_orderRouter = require('./manager/order/router/MOrderRouter');

const app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(express.static('public'));
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(response());
app.use(validator());
app.use(commonValidator());


// 微信端 API
app.use('/wx/user', WX_UserRouter);
app.use('/wx/order', WX_OrderRouter);
app.use('/wx/region', WX_RegionRouter);
app.use('/wx/article', WX_ArticleRouter);
app.use('/wx/article', WX_ArticleCategoryRouter);
app.use('/wx/feedback',WX_FeedBackRouter);

// 回收员端API
app.use('/em/', EM_Router);
app.use('/em/', EM_OrderRouter);
app.use('/em/', WX_ArticleRouter);


// 后台管理
app.use('/manager/order', Manger_orderRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}



// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;

console.log("server  runing......");
