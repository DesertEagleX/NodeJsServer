/**
 * Created by sprint on 17/2/26.
 */
'use strict';

const WXUserDao = require('../user/user-dao');
const WXSDKAPI = require('./WXSDKAPI');
const moment = require('moment');
const Order = require('../../dao/order/order');

const MyWXOpenId = "填写你的openId";


/**
 * WXOrderStatusSender prototype.
 */
const WXOrderStatusSender = exports = module.exports = {};

/**
 * 发送新订单通知
 */
WXOrderStatusSender.sendNewOrderNotify = function (orderInfo)
{
    // 向我发送订单信息 to: sprint
    WXOrderStatusSender.sendOrderStatusTempleMessageToOpenID(MyWXOpenId,orderInfo);


};

/**
 * 想用户微信发送订单状态提醒信息
 * @param orderInfo
 */
WXOrderStatusSender.sendOrderStatusTempleMessage = function (orderInfo)
{
    // 查询用户openid
    WXUserDao.queryOpenIdById(orderInfo.u_id).then(function (result)
    {
        let u_wx_openid = result.u_wx_openid;
        WXOrderStatusSender.sendOrderStatusTempleMessageToOpenID(u_wx_openid,orderInfo);
    });

    // 向我发送订单信息 to: sprint
    WXOrderStatusSender.sendOrderStatusTempleMessageToOpenID(MyWXOpenId,orderInfo);

};

/**
 *
 * @param orderInfo
 * @param reportType
 */
WXOrderStatusSender.sendOrderReportMessage = function (orderInfo,title,reportMessage)
{

    // 查询用户openid
    WXUserDao.queryOpenIdById(orderInfo.u_id).then(function (result)
    {
        let u_wx_openid = result.u_wx_openid;

        let m = moment();
        let updateDate = m.format("YYYY年MM月DD日 HH:mm:ss");

        let message =
        {
            "touser":u_wx_openid,
            "template_id":"CLwDtREaM013tI6wQ7LEG_hUAdalMFBD9VxVVvPEp_Q",
            "url":"填写具体网页地址 用户在微信中点击消息时将打开该网页/my_order_detail.html?orderId="+orderInfo.ord_id,
            "data": {
                "first": {
                    "value": title ,
                    "color": "#173177"
                },

                "keyword1": {
                    "value": "6537778234887" + orderInfo.ord_id,
                    "color": "#173177"
                },

                "keyword2": {
                    "value":reportMessage,
                    // "color": "#173177"
                },

                "keyword3": {
                    "value": updateDate,
                    // "color": "#173177"
                },

                "remark": {
                    "value": "回收地址:  " + orderInfo.u_addr ,
                    // "color": "#173177"
                }
            }
        };

        WXSDKAPI.sendTemplateMessage(message);



    });


};

/**
 * 向指定openId发送订单状态信息
 * @param openId
 * @param orderInfo
 * @private
 */
WXOrderStatusSender.sendOrderStatusTempleMessageToOpenID = function (openId,orderInfo)
{
    let m = moment();
    let updateDate = m.format("YYYY年MM月DD日 HH:mm:ss");

    // 新订单
    if(orderInfo.ord_status == Order.OrderStaus.OrderStatusWaitingAssignment.code)
    {
        let message =
        {
            "touser":openId,
            "template_id":"CLwDtREaM013tI6wQ7LEG_hUAdalMFBD9VxVVvPEp_Q",
            "url":"填写具体网页地址 用户在微信中点击消息时将打开该网页/my_order_detail.html?orderId="+orderInfo.ord_id,
            "data": {
                "first": {
                    "value": "您收到一个订单" ,
                    "color": "#173177"
                },

                "keyword1": {
                    "value": "6537778234887" + orderInfo.ord_id,
                    "color": "#173177"
                },

                "keyword2": {
                    "value": Order.OrderStaus.OrderStatusWaitingPick.msg,
                    // "color": "#173177"
                },

                "keyword3": {
                    "value": updateDate,
                    // "color": "#173177"
                },

                "remark": {
                    "value": "回收地址:  " + orderInfo.u_addr ,
                    // "color": "#173177"
                }
            }
        };

        WXSDKAPI.sendTemplateMessage(message);


    }else if(orderInfo.ord_status == Order.OrderStaus.OrderStatusWaitingPick.code)// 已接单
    {
        let message =
        {
            "touser":openId,
            "template_id":"CLwDtREaM013tI6wQ7LEG_hUAdalMFBD9VxVVvPEp_Q",
            "url":"填写具体网页地址 用户在微信中点击消息时将打开该网页/my_order_detail.html?orderId="+orderInfo.ord_id,
            "data": {
                "first": {
                    "value": "回收员已接单 等待上门" ,
                    "color": "#173177"
                },

                "keyword1": {
                    "value": "6537778234887" + orderInfo.ord_id,
                    "color": "#173177"
                },

                "keyword2": {
                    "value": Order.OrderStaus.OrderStatusWaitingPick.msg,
                    // "color": "#173177"
                },

                "keyword3": {
                    "value": updateDate,
                    // "color": "#173177"
                },

                "remark": {
                    "value": "回收地址:  " + orderInfo.u_addr ,
                    // "color": "#173177"
                }
            }
        };

        WXSDKAPI.sendTemplateMessage(message);

        // 回收员已出发
    }else if(orderInfo.ord_status == Order.OrderStaus.OrderStatusAlreadyStarting.code)
    {
        let message =
        {
            "touser":openId,
            "template_id":"CLwDtREaM013tI6wQ7LEG_hUAdalMFBD9VxVVvPEp_Q",
            "url":"填写具体网页地址 用户在微信中点击消息时将打开该网页/my_order_detail.html?orderId="+orderInfo.ord_id,
            "data": {
                "first": {
                    "value": "回收员已出发 请您耐心等待",
                    "color": "#173177"
                },

                "keyword1": {
                    "value": "6537778234887" + orderInfo.ord_id,
                    "color": "#173177"
                },

                "keyword2": {
                    "value": Order.OrderStaus.OrderStatusAlreadyStarting.msg,
                    // "color": "#173177"
                },

                "keyword3": {
                    "value": updateDate,
                    // "color": "#173177"
                },

                "remark": {
                    "value": "回收地址 : " + orderInfo.u_addr,
                    // "color": "#173177"
                }
            }
        };

        WXSDKAPI.sendTemplateMessage(message);

    }else if(orderInfo.ord_status == Order.OrderStaus.OrderStatusCompleted.code)
    {
        let message =
        {
            "touser":openId,
            "template_id":"CLwDtREaM013tI6wQ7LEG_hUAdalMFBD9VxVVvPEp_Q",
            "url":"填写具体网页地址 用户在微信中点击消息时将打开该网页/my_order_detail.html?orderId="+orderInfo.ord_id,
            "data": {
                "first": {
                    "value": "您的订单已完成 欢迎您再次使用",
                    "color": "#173177"
                },

                "keyword1": {
                    "value": "6537778234887" + orderInfo.ord_id,
                    "color": "#173177"
                },

                "keyword2": {
                    "value": Order.OrderStaus.OrderStatusCompleted.msg,
                    // "color": "#173177"
                },

                "keyword3": {
                    "value": updateDate,
                    // "color": "#173177"
                },

                "remark": {
                    "value": "回收地址 : " + orderInfo.u_addr+"\n订单金额 : " + orderInfo.ord_price +" 元",
                    "color": "#DB4D2A"
                }
            }
        };

        WXSDKAPI.sendTemplateMessage(message);

    }else if(orderInfo.ord_status == Order.OrderStaus.OrderStatusCanceld.code)
    {
        let message =
        {
            "touser":openId,
            "template_id":"CLwDtREaM013tI6wQ7LEG_hUAdalMFBD9VxVVvPEp_Q",
            "url":"填写具体网页地址 用户在微信中点击消息时将打开该网页/my_order_detail.html?orderId="+orderInfo.ord_id,
            "data": {
                "first": {
                    "value": "您的订单已取消 欢迎您下次使用",
                    "color": "#173177"
                },

                "keyword1": {
                    "value": "6537778234887" + orderInfo.ord_id,
                    "color": "#173177"
                },

                "keyword2": {
                    "value": Order.OrderStaus.OrderStatusCompleted.msg,
                    // "color": "#173177"
                },

                "keyword3": {
                    "value": updateDate,
                    // "color": "#173177"
                },

                "remark": {
                    "value": "回收地址 : " + orderInfo.u_addr,
                    "color": "#DB4D2A"
                }
            }
        };

        WXSDKAPI.sendTemplateMessage(message);
    }
}
