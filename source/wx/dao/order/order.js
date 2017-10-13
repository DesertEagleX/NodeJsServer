/**
 * Created by sprint on 16/8/13.
 */
'use strict';
/**
 * Module dependencies.
 * @private
 */

/**
 * Order prototype.
 */
const Order = exports = module.exports = {};


//订单状态
Order.OrderStaus = {

    //下单成功 等待指派回收员
    OrderStatusWaitingAssignment :{
        code:100,
        msg:"下单成功 等待指派回收员"
    },

    //已通知 等待回收人员确认
    OrderStatusWaitingRecycleMember :{
        code:102,
        msg:"已派单 等待回收人员确认"
    },

    //已指派回收员 等待上门回收
    OrderStatusWaitingPick :{
        code:103,
        msg:"等待回收员上门"
    },

    //回收员已出发
    OrderStatusAlreadyStarting :{
        code:104,
        msg:"回收员正赶赴目的地"
    },


    //回收员已回收 正常流程
    OrderStatusCompleted :{
        code:200,
        msg:"已回收"
    },

    //用户取消订单 (暂不支持回收员取消订单)
    OrderStatusCanceld :{
        code:300,
        msg:"订单已取消"
    },

    //当状态码 > 300 就是系统触发的订单状态

    //系统取消订单 (疑难订单或者联系不上用户)
    OrderStatusSysCanceld :{
        code:400,
        msg:"订单已取消"
    },

};


/**
 * 响应错误状态
 * @type {{}}
 */
Order.ResponseErrorStatus =
{
    /***
     * 有未完成订单
     */
    UnDoOrderError : 201

};

/**
 * 判断 visit_time 是否是否可以预约
 * @param visit_time 预约时间 (时间戳 getTime)
 * @returns {boolean}
 */
Order.checkVisitTime = function (visit_time) {

    var server_time = new Date().getTime();
    var  time = visit_time - server_time;

    // 服务时间在一小时后
    return (time >= 1000*60*60 );

}