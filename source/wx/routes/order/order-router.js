/**
 * Created by sprint on 16/8/13.
 */
'use strict';

const express = require('express');
const response = require('../../../response/response');
const orderDao = require('../../dao/order/order_dao');
const Order = require('../../dao/order/order');
const orderArticleDao = require("../../dao/ord_article/order_article_dao");
const WXOrderStatusSender = require("../../dao/wxSDK/WXOrderStatusSender");
const moment = require('moment');

/**
 * OrderRouter prototype.
 */
const OrderRouter = exports = module.exports = express.Router();

/**
 * register validater to routes
 */
const validator = require("../validator/order-validator")
validator.registerRouter(OrderRouter);

/**
 * routes by user_orders 查询用户订单信息
 */
OrderRouter.post("/user_orders", function(req, res)
{

    OrderRouter.convertQuery(req.query).then(orderDao.userOrders).then(res.responseResult).catch(res.responseError);

});

/**
 * routes by orderinfo 查询用户订单信息
 */
OrderRouter.post("/order_info", function(req, res)
{
    OrderRouter.convertQuery(req.query)
                .then(orderDao.orderInfo)
                .then(function (order)
                {
                    // 根据订单id查询订单废品信息
                   return orderArticleDao.queryByOrderId(order.ord_id).then(function (articles)
                    {
                        order.articles = articles;
                        return order;
                    });

                }).then(res.responseResult)
                .catch(res.responseError);

});

/**
 * routes by insertOrder 下单
 */
OrderRouter.post("/insertOrder", function(req, res)
{
    OrderRouter.convertQuery(req.query)
        .then(orderDao.assertUserCanInserOrder)
        .then(orderDao.fillOrderInfo)
        .then(orderDao.checkOrderInfo)
        .then(orderDao.insertOrder)
        .then(function (orderInfo)
        {
            orderInfo.ord_status = Order.OrderStaus.OrderStatusWaitingAssignment.code;
            WXOrderStatusSender.sendNewOrderNotify(orderInfo);
            return orderInfo;
        })
        .then(res.responseResult)
        .catch(res.responseError);

});


// 取消订单
let cancelOrder = function (query)
{
    return new Promise(function (resolve,reject)
    {
       return orderDao.orderInfo(query).then(function (orderInfo) {


            // 如果回收员还没有出发 可以取消订单
            if(orderInfo.ord_status < Order.OrderStaus.OrderStatusAlreadyStarting.code)
            {

                orderDao.updateOrderInfo({ord_status:Order.OrderStaus.OrderStatusCanceld.code},orderInfo.ord_id)
                    .then(function (result)
                    {
                        orderInfo.ord_status = Order.OrderStaus.OrderStatusCanceld.code;
                        WXOrderStatusSender.sendOrderStatusTempleMessage(orderInfo);
                    })
                    .then(resolve).catch(reject);


                return;
            }

            reject("回收员已出发无法取消订单");

        });

    });
};


/**
 * 取消订单
 */
OrderRouter.post("/cancelOrder", function(req, res)
{

    OrderRouter.convertQuery(req.query)
        .then(cancelOrder)
        .then(function ()
        {
            return "订单已取消";
        })
         .then(res.responseResult)
         .catch(res.responseError);

});


/**
 * 获取可预约的时间列表
 */
OrderRouter.post("/visit_date_list",function (req,res)
{
    let m = moment();
    let day = m.day();
    let hour = m.hour();
    let dates = [];
    let dayMap = {0:"今天",1:"明天",2:"后天"};

    m.minute(0);

    // 10点    16点

    for(let i = 0;i < 2 ;i++)
    {
        let date = {};
        dates.push(date);


        if(m.hour() + 1 <=10)
        {
            m.hour(10);

        }else if(m.hour() + 1 <= 16)
        {
            m.hour(16);

        }else
        {
            m.day(m.day() + 1);
            m.hour(10);
            m.minute(0);
        }

       //计算相差天数
        let a = moment(m.format("YYYYMMDD"));
        let b = moment(moment().format("YYYYMMDD"));

        let days =  a.diff(b,"days");
        date.date = m.format( dayMap[days]+" MM月DD日");

        date.hous = [];

        for(let h = m.hour() ;h < 18 ;h+=6)
        {
            m.hour(h);

            let time = {};
            time.milliseconds = m.valueOf();

            if(h < 10)
                time.hour = m.format("早上 HH:mm");
            else if(h<12)
                time.hour = m.format("中午 HH:mm");
            else
                time.hour = m.format("下午 HH:mm");


            date.hous.push(time)
        }

        // // 9点上班 18点下班
        // if(m.hour()+2 > 18)
        // {
        //     m.day(m.day() + 1);
        //     m.hour(9);
        //     m.minute(0);
        //
        // }else if(m.hour() < 9 && m.hour()+2 < 9)
        // {
        //     m.hour(9);
        //
        // }else
        // {
        //     m.hour(m.hour()+2);
        // }

        // 计算相差天数
        // let a = moment(m.format("YYYYMMDD"));
        // let b = moment(moment().format("YYYYMMDD"));
        //
        // let days =  a.diff(b,"days");
        // date.date = m.format( dayMap[days]+" MM月DD日");
        //
        // date.hous = [];
        //
        // for(let h = m.hour() ;h <= 18;h++)
        // {
        //     let time = {};
        //     time.milliseconds = m.valueOf();
        //
        //     if(h < 10)
        //         time.hour = m.format("早上 HH:mm");
        //     else if(h<12)
        //         time.hour = m.format("中午 HH:mm");
        //     else
        //         time.hour = m.format("下午 HH:mm");
        //
        //     m.hour(m.hour()+1);
        //     date.hous.push(time)
        // }
    }

    res.responseResult(dates);

});

/**
 * 将参数转为数据库字典名称
 * @param query
 */
OrderRouter.convertQuery = function (query)
{

    return new Promise(function (resolve) {

        var fieldsMap = {"uid":"u_id","rid":"r_id","oid":"ord_id","ord_art_types":"ord_art_types"
                        ,"status":"ord_status","addr":"u_addr","comment":"ord_note","visit_date":"visit_date"};
        var newQuery = {};

        for(var key in query)
        {

            if(!fieldsMap[key])
            {
                newQuery[key] = query[key];
                continue;
            }

            newQuery[fieldsMap[key]] = query[key];
        }

        resolve(newQuery);

    });

};