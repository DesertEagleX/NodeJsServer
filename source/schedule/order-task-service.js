/**
 * Created by gh.li on 16/8/30.
 */
'use strict';
//日期处理
const moment = require('moment');

// WX
const OrderDao = require('../wx/dao/order/order_dao');
// EM_Order_Dao
const EmployOrderDao = require('../em/dao/order/em_order_dao');

// 订单Model
const Order = require('../wx/dao/order/order');
// 微信用户Dao
const WxUserDao = require('../wx/dao/user/user-dao')
/** JPUSH **/
const JPushService = require('./jpush-service');
/** 订单状态微信端消息推送 */
const WXOrderStatusSender = require("../wx/dao/wxSDK/WXOrderStatusSender");
/** 消息发射器 */
const SocketEmitter = require("../socket_emitter/socket_emitter");
/** 消息数据对象 */
const SocketEmitterData = require("../socket_emitter/socket_emitter_data");


/**
 * OrderTaskService 任务服务
 * 在后台任务扫描服务 目前有:新订单扫描 , 预约单通知
 */
const OrderTaskService = exports = module.exports = {};

const pushFailedClockOrderArray = [];

/**
 *
 * 扫描新订单
 */
OrderTaskService.scanningNewOrder = function ()
{

    OrderDao.Sys_QueryWaitingAssignmentOrders() // 查询等待指派的订单
        .then(EmployOrderDao.Sys_AssigningOrders) // 分配回收员
        .then(pushNewOrdersMessages); // 推送消息

};


/**
 * 扫描预约订单
 */
OrderTaskService.scanningBookOrder = function ()
{
    OrderDao.Sys_QueryBookOrdersOfPushMessage().then(pushClockOrdersMessage);
};


/**
 * 扫描周期订单
 */
OrderTaskService.scanningCycleService = function ()
{
    WxUserDao.querySettingCycleServiceUserList().then(function (users)
    {

        for(let index in users)
        {
            let user = users[index];
            let cycle_service_type = user.cycle_service_type;

            let date = moment();
            let lastUpdateDate = moment(user.last_order_update_time);
            let days = date.diff(lastUpdateDate,"days");

            // 如果相差天数等于用设置的天数
            if(days >= cycle_service_type)
            {
                OrderDao.assertUserCanInserOrder({u_id:user.u_id})
                    .then(OrderDao.fillOrderInfo)
                    .then(OrderDao.checkOrderInfo)
                    .then(OrderDao.insertOrder);
            }


        }

    });
};

/**
 * 使用JPush推送消息
 * @constructor
 */
const JPushNewOrderMessage = function (orders)
{

    for(let index in orders)
    {
        let order = orders[index];

        for (let index in order.emplyees)
        {
            let employee = order.emplyees[index];
            let message = createJPushMessage(order,employee.push_registration_id);
            JPushService.pushMessage(message).then(function () {
                
            });
        }
    }

};

/**
 * 将订单信息转化为可以发送的推送消息
 * @param order
 */
const createJPushMessage = function (content,pushId)
{
    return new Promise(function (resolve, reject)
    {
        let data = new SocketEmitterData("new_order",pushId,content);
        resolve(data);

    });
};

/**
 * 指派订单(如果该订单只有一个回收员则直接指派 无需抢单
 * @param order 订单信息
 * @param employee 指派的回收员
 */
const assignOrder = function (orderInfo,employee)
{
    // 将订单指派给回收员
    EmployOrderDao.updateOrderInfo(orderInfo.ord_id,{"em_id":employee.em_id,"ord_status":Order.OrderStaus.OrderStatusWaitingPick.code})
        .then(function ()
        {
            // 更新字段信息
            orderInfo.em_id = employee.em_id;
            orderInfo.ord_status = Order.OrderStaus.OrderStatusWaitingPick.code;

            // 推送消息给用户
            WXOrderStatusSender.sendOrderStatusTempleMessage(orderInfo);

            return orderInfo;

        });

};


/**
 * 推送新订单消息
 * @param orders 订单列表
 */
const pushNewOrdersMessages = function (orders) {


    for(let index in orders)
    {
        let orderInfo = orders[index];

        // 如果该订单只有一个回收员可以接单 则直接指派不在抢单
        if(orderInfo.emplyees.length == 1)
        {
            // 直接指派订单
            assignOrder(orderInfo,orderInfo.emplyees[0]);

            console.log("新订单 系统自动指派订单给 | " + orderInfo.emplyees[0].em_name);

        }else
        {
            let emitSuccess = true;

            console.log("新订单  | " + orderInfo.u_addr);
            // 如果该订单可以被多个回收员接单 则推送都回收员端 让回收员抢单
            for (let i in orderInfo.emplyees)
            {
                let employee = orderInfo.emplyees[i];

                let data = new SocketEmitterData("new_order",employee.em_id,orderInfo);
                let result = SocketEmitter.emit(data);

                if(!result)
                    emitSuccess = false;

                console.log("新订单: "+ employee.em_id+" 推送结果:"+emitSuccess);
            }



            // 推送成功后 更新订单状态 已分配回收员
            if(emitSuccess && orderInfo.emplyees.length)
                OrderDao.updateOrderInfo({"ord_status":Order.OrderStaus.OrderStatusWaitingRecycleMember.code},orderInfo.ord_id);

            // required
            emitSuccess = true;
        }


    }
}



/**
 * 推送预约订单消息
 * @param order
 */
const pushClockOrdersMessage = function (orders)
{

    for(let index in orders)
    {
        let order = orders[index];

        // var visitDateString = moment(order.visit_date).format('mm-dd HH:MM');
        // var message = {msg:"预约订单提前: "+visitDateString+" 地址:"+order.u_addr,registration_id:order.push_registration_id,ord_id:order.ord_id};
        //
        //
        // var message = {msg:"您有一个预约订单 请尽快出发 地址:"+order.u_addr,registration_id:employee.push_registration_id,ord_id:order.ord_id,em_id:employee.em_id};

        let data = new SocketEmitterData("book_order_clock",order.em_id,order);
        let result = SocketEmitter.emit(data);
    }

};


