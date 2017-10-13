/**
 * Created by ligh on 16/9/17.
 */
'use strict';

const express = require('express');
const response = require('../../response/response');

const DB = require('../../db/db');

const orderDao = require('../dao/order/em_order_dao');
const Order = require('../../wx/dao/order/order');
const orderArticleDao = require("../../wx/dao/ord_article/order_article_dao");
const ArticlePriceDao = require('../../wx/dao/article_price/article_price_dao');
const WXUserDao = require('../../wx/dao/user/user-dao');
const WXOrderStatusSender = require("../../wx/dao/wxSDK/WXOrderStatusSender");
const moment = require('moment');

// 片区未开通
const Order_ReportRegionUnOpen = 1;
// 订单延误
const Order_ReportDeplay = 2;

/**
 * EmployeeOrderRouter prototype.
 */
const EmployeeOrderRouter = exports = module.exports = express.Router();

/**
 * register validater to routes
 */
const validator = require("../validator/em_order_validator")
validator.registerRouter(EmployeeOrderRouter);

/**
 * 回收员接单
 * 参数: rid,order_id,emid
 */
EmployeeOrderRouter.post("/acceptOrder",function (req,res)
{
    // 转换参数
    EmployeeOrderRouter.convertQuery(req.query).then(orderDao.orderInfo).then(function (orderInfo)
    {

        let ordId = orderInfo.ord_id;
        let emId = orderInfo.em_id;

         // 订单已被抢
        if(emId > 0 || orderInfo.ord_status > Order.OrderStaus.OrderStatusWaitingPick.code)
        {
            // 订单已被其他回收员抢
            res.responseError(response.jsonError(response.ResponseCode.failedCode,"来晚了 订单已被抢"));

        }
        else
        {

            // 订单未被抢走
            orderDao.updateOrderInfo(ordId,{"em_id":req.query["emid"],ord_status:Order.OrderStaus.OrderStatusWaitingPick.code})
                .then(function ()
            {
                // 更新字段信息
                orderInfo.em_id = req.query["emid"];
                orderInfo.ord_status = Order.OrderStaus.OrderStatusWaitingPick.code;

                // 推送消息给用户
                WXOrderStatusSender.sendOrderStatusTempleMessage(orderInfo);

                return orderInfo;

            }).then(res.responseResult)
              .catch(function ()
            {

                res.responseError(response.jsonError(response.ResponseCode.failedCode,"抢单失败"));
            });
        }


    }).catch(res.responseError);

});


/**
 * 更改订单状态 (出发) 参数(order_id,emid,ordStatus)
 */
EmployeeOrderRouter.post("/updateOrderStatus",function (req,res)
{

    EmployeeOrderRouter.convertQuery(req.query).then(function (query)
    {

        let em_id = query["em_id"];
        let ord_id = query["ord_id"];
        let ord_status = query["ord_status"];

        orderDao.EMOrderInfo(query).then(function (orderInfo)
        {
            return orderDao.updateOrderInfo(ord_id,{"ord_status":ord_status}).then(function (result) {

                orderInfo.ord_status = ord_status;

                WXOrderStatusSender.sendOrderStatusTempleMessage(orderInfo);

                return result;
            });

        }).then(res.responseResult)
          .catch(res.responseError);

    });

});

/**
 * 计算订单废品价格
 */
EmployeeOrderRouter.post("/calculate_articlesprice",function (req,res)
{

    try{

        //确认收货的废品
        let articlesJSONString =  req.query["articles"];
        let orderId = req.query["order_id"];
        let emid = req.query["emid"];
        let uType = req.query["u_type"];

        // 回收的废品信息
        let articles = JSON.parse(articlesJSONString);

        ArticlePriceDao.calculateArticlesPrice(uType,articles).then(res.responseResult).catch(res.responseError);;

    }catch(e)
    {
        res.responseError("articles参数格式错误");
    };

});


/**
 * 确认订单 article :{o_id,art_id,art_count,art_price}
 */
EmployeeOrderRouter.post("/confirmOrder", function(req, res)
{

    try{

        //确认收货的废品
        let articlesJSONString =  req.query["articles"];
        let orderId = req.query["order_id"];
        let emid = req.query["emid"];
        let userId = req.query["user_id"];
        let uType = req.query["u_type"];

        // 回收的废品信息
        let articles = JSON.parse(articlesJSONString);

        ArticlePriceDao.calculateArticlesPrice(uType,articles).then(function (articles)
        {
            // 订单金额
            let totalPrice = 0;


            for(let i in articles)
            {
                let article = articles[i];
                article.o_id = orderId;
                totalPrice = totalPrice +  parseFloat( article.art_price );

                delete article.oa_id;
                delete article.art_unit;
            }

            // 保留两位小数
            totalPrice = totalPrice.toFixed(2);

            DB.startTransaction().then(function (transManger)
            {
                //在这里面执行的SQL语句都将会被事务管理
                orderArticleDao.insertOrderArticles({"o_id":orderId,"orderArticles":articles});
                // 更新订单状态
                orderDao.updateOrderInfo(orderId,{"ord_status":Order.OrderStaus.OrderStatusCompleted.code,"ord_price":totalPrice,"ord_end_date":new Date().getTime()});
                // 更新用户最后订单信息
                WXUserDao.updateById({"u_id":userId,"last_order_update_time":new Date().getTime()});
                orderDao.orderInfo({"ord_id":orderId}).then(WXOrderStatusSender.sendOrderStatusTempleMessage);

                // 执行事务
                transManger.executeTransaction(function (error)
                {

                    // 事务执行失败 executeTransaction方法将会自动回滚
                    if(error)
                    {
                        res.responseError(error)
                    }
                    else
                    {
                        // 执行执行成功
                        res.responseResult();
                    }

                });

            }).catch(res.responseError);


        }).catch(res.responseError);




    }catch(e)
    {
        res.responseError("articles参数格式错误");
    };

});


/**
 * 订单详情[ordId,emId]
 */
EmployeeOrderRouter.post("/orderInfo",function (req,res)
{

    EmployeeOrderRouter.convertQuery(req.query).then(orderDao.EMOrderInfo).then(function (order)
    {
         return orderArticleDao.queryByOrderId(req.query["order_id"]).then(function (articles)
        {
            order.articles = articles;
            return order;

        }).then(res.responseResult)
           .catch(res.responseError);


    }).catch(res.responseError);


});


/**
 * routes by orders 回收员订单列表
 */
EmployeeOrderRouter.post("/orders", function(req, res)
{

    var status =  req.query["status"];

    if(status == 0)
        EmployeeOrderRouter.convertQuery(req.query).then(orderDao.orderUndoList).then(res.responseResult).catch(res.responseError);
    else if(status == 1)
        EmployeeOrderRouter.convertQuery(req.query).then(orderDao.orderCompletedList).then(res.responseResult).catch(res.responseError);
    else if(status == 2)
        EmployeeOrderRouter.convertQuery(req.query).then(orderDao.orderList).then(res.responseResult).catch(res.responseError);
    else if(status == 3) // 今日订单
        EmployeeOrderRouter.convertQuery(req.query).then(orderDao.todayOrderList).then(res.responseResult).catch(res.responseError);
    else if(status == 4) // 预约订单
        EmployeeOrderRouter.convertQuery(req.query).then(orderDao.visitOrderList).then(res.responseResult).catch(res.responseError);

});


/**
 * 订单问题报告
 */
EmployeeOrderRouter.post("/order_report",function (req,res)
{

    EmployeeOrderRouter.convertQuery(req.query).then(orderDao.EMOrderInfo).then(function (orderInfo)
    {
        let reportType = req.query["report_type"];

        if(reportType == Order_ReportRegionUnOpen)
        {
            orderDao.updateOrderInfo(orderInfo.ord_id,{"ord_status":Order.OrderStaus.OrderStatusSysCanceld.code});
            WXOrderStatusSender.sendOrderReportMessage(orderInfo,"尊敬的用户很抱歉提醒您 您所在区域暂未开通  如有疑问请联系客服或回收员","暂未开通该片区");

        }else if(reportType == Order_ReportDeplay)
        {
            WXOrderStatusSender.sendOrderReportMessage(orderInfo,"尊敬的用户很抱歉提醒您 订单较多您的订单将被延迟至明天回收 如有疑问请联系客服或回收员","订单延误");
        }

        res.responseResult();

    }).catch(res.responseError);


});


/**
 * 将参数转为数据库字典名称
 * @param query
 */
EmployeeOrderRouter.convertQuery = function (query)
{

    return new Promise(function (resolve) {

        var fieldsMap = {"emid":"em_id","ordStatus":"ord_status","order_id":"ord_id","art_id":"art_id","art_count":"art_count","art_price":"art_price"};

        var newQuery = {};

        for(var key in query) {

            if(!fieldsMap[key]) {
                newQuery[key] = query[key];
                continue;
            }
            newQuery[fieldsMap[key]] = query[key];
        }

        resolve(newQuery);

    });

};


