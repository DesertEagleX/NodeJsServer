/**
 * Created by sprint on 16/8/13.
 */
'use strict';
/**
 * Module dependencies.
 * @private
 */
const DB = require('../../../db/db');
const jsonResponse = require('../../../response/response');
const userDao = require('../user/user-dao');
const regionDao = require('../region/region-dao');
const idDao = require('../id_generator/id-generator');
const order = require('./order');

const PageCount = 10;

const SQL_TableName = "Ord_Order";
// 回收员订单
const SQL_EM_TableName = "Em_Employment";

//================= Fileds ==================//

// 返回给调用端的字典信息 过滤掉敏感字段
const SQL_QueryFields = "ord_id,u_id,u_type,em_id,r_id,u_addr,ord_note,ord_date,visit_date,ord_status,ord_price,ord_art_types";
// 订单链接查询字段 包含回收员信息
const SQL_JOIN_QueryFields = "o.ord_id,o.u_id,o.ord_art_types,o.em_id,o.r_id,o.u_addr,o.ord_note,o.ord_date,o.visit_date,o.ord_end_date,o.ord_status,o.ord_price,e.em_id,e.em_name,e.em_mobile";


// 排序字段
const SQL_OrderSort = " ORDER BY ord_date DESC "; // ORDER BY ord_date DESC


//================= Update ==================//
// 添加订单
const SQL_InsertOrder = "INSERT INTO " +SQL_TableName + " SET ?";
// 更新订单状态
const SQL_UpdateOrderStatusByID = "UPDATE "+ SQL_TableName+ " SET ? WHERE ord_id = ?";

//================= Query ==================//
// 查询用户订单列表
const SQL_QueryByUID_StartIndex = "SELECT "+ SQL_QueryFields +" FROM " + SQL_TableName +" WHERE u_id = ? "+SQL_OrderSort + " LIMIT ?,"+PageCount;
// 根据订单状态查询用户订单
const SQL_QueryByUID_Status_StartIndex = "SELECT "+ SQL_QueryFields +" FROM " + SQL_TableName +" WHERE u_id = ? AND ord_status = ? "+SQL_OrderSort+" LIMIT ?,"+PageCount;

//查询用户未完成订单数量
const SQL_QueryUserUndoOrderCount = "SELECT count(ord_id) as count FROM "+SQL_TableName +" WHERE u_id = ? AND ord_status<"+order.OrderStaus.OrderStatusCompleted.code;

// 查询订单详情
// const SQL_QueryByID = "SELECT "+ SQL_QueryFields +" FROM " + SQL_TableName + " WHERE u_id = ? AND ord_id = ? ";

const SQL_QueryByID = "SELECT "+SQL_JOIN_QueryFields+" FROM "+SQL_TableName+" o LEFT JOIN "+SQL_EM_TableName+" e ON o.em_id = e.em_id  WHERE u_id = ? AND ord_id = ? ";

// 查询等待指派的订单
const SQL_QueryWaitingAssignmentOrders = "SELECT "+ SQL_QueryFields +" FROM " + SQL_TableName + " WHERE ord_status = "+order.OrderStaus.OrderStatusWaitingAssignment.code +" OR ord_status ="+order.OrderStaus.OrderStatusWaitingRecycleMember.code ;
// 查询当前时间+1小时 的预约订单  提前半小时通知回收员
const SQL_QueryBookOrdersOfPushMessage = "SELECT o.ord_id,o.ord_art_types,o.u_addr,o.em_id,o.visit_date,e.push_registration_id FROM ord_order " +
                                            "o LEFT JOIN em_employment e on o.em_id = e.em_id WHERE o.em_id > 0 AND " +
                                            " UNIX_TIMESTAMP(DATE_FORMAT(FROM_UNIXTIME(o.visit_date/1000),'%Y-%m-%d %h:%i')) >=  (UNIX_TIMESTAMP(DATE_FORMAT(SYSDATE(),'%Y-%m-%d %h:%i')))" +
                                            " AND UNIX_TIMESTAMP(DATE_FORMAT(FROM_UNIXTIME(o.visit_date/1000),'%Y-%m-%d %h:%i')) = (UNIX_TIMESTAMP(DATE_FORMAT(SYSDATE(),'%Y-%m-%d %h:%i')) + 60 * 60)";


/**
 * OrderDao prototype.
 */
const OrderDao = exports = module.exports = {};


/**
 * 查询用户订单
 * @param uid 用户id
 * @param status 用户状态
 * @param page 用户page
 */
OrderDao.userOrders = function (query)
{

    let uid = query["u_id"];
    let status = query["ord_status"];
    let page = query["page"] || 1;

    // 查询指定状态的订单
    if(status)
    {

        return DB.query(SQL_QueryByUID_Status_StartIndex,[uid,status,PageCount * (page - 1)]);

    }else{

        return DB.query(SQL_QueryByUID_StartIndex,[uid,PageCount * (page - 1)]);
    }

};

/**
 * 断言用户可以下单 会验证是否有未完成订单
 */
OrderDao.assertUserCanInserOrder = function (query) {

    let uid = query["u_id"];

    return new Promise(function (resolve, reject) {

        DB.query(SQL_QueryUserUndoOrderCount,uid).then(DB.resultsFirst).then(function (result) {

               let undoCount = result.count;

                if(undoCount <= 0)
                {
                    resolve(query);

                }else
                {
                    reject(jsonResponse.jsonError(order.ResponseErrorStatus.UnDoOrderError,"您有未完成订单"));
                }

        }).catch(reject);

    });
};

/**
 * 查询订单详情
 * @param [uid,ord_id]
 */
OrderDao.orderInfo = function (query)
{

    let uid = query["u_id"];
    let ord_id = query["ord_id"];

    return DB.query(SQL_QueryByID,[uid,ord_id]).then(DB.resultsFirst);

};


/**
 * 添加订单信息
 * @param orderInfo
 */
OrderDao.insertOrder = function (orderInfo)
{
    // 删除openid
    delete  orderInfo.openid;


    return new Promise(function (resolve, reject) {

        OrderDao.fillOrderInfo(orderInfo).then(function (orderInfo) {

            DB.query(SQL_InsertOrder, orderInfo).then(function () {

                resolve(orderInfo);

            }).catch(reject);

        }).catch(reject);
    });
};

/**
 * 更新订单信息
 */
OrderDao.updateOrderInfo = function (orderInfo, ord_id)
{

    return DB.query(SQL_UpdateOrderStatusByID,[orderInfo,ord_id]);

};


/**
 * 查询等待指派的订单
 */
OrderDao.Sys_QueryWaitingAssignmentOrders = function ()
{

    return DB.query(SQL_QueryWaitingAssignmentOrders);
};

/**
 * 查询+30分钟时的订单 该方法一般由order-task-service调用
 */
OrderDao.Sys_QueryBookOrdersOfPushMessage = function ()
{

    return DB.query(SQL_QueryBookOrdersOfPushMessage);

};


/**
 * 将查询结果results根据rid分组
 * @param results
 */
OrderDao.flatResultsByRID = function (results)
{

    return new Promise(function (resolve, reject) {

        let ridOrdersMap = {};
        // 将区域放入字典中
        for(var i=0; i< results.length ; i++) {

            let order = results[i];

            if(ridOrdersMap[order.r_id]){

                ridOrdersMap[order.r_id].push(order);

            }else{

                ridOrdersMap[order.r_id] = [order];
            }
        };


        resolve(ridOrdersMap);

    });

}


/**
 * 检查订单信息
 */
OrderDao.checkOrderInfo = function (orderInfo)
{

    delete orderInfo.wx_openId;

    return new Promise(function (resolve, reject) {

        // 如果存在r_id区域 并且r_id下面没有子区域 证明选择的时是片区
        regionDao.checkExistRegionByID(orderInfo.r_id).then(function (count) {

            if(count)
            {
                resolve(orderInfo);

            }else{

                reject(jsonResponse.jsonError(jsonResponse.ResponseCode.parameterErrorCode,"非法的片区信息"));
            }

        }).catch(reject);

    });

}

/**
 * 填充订单信息
 */
OrderDao.fillOrderInfo = function (orderInfo)
{
    // 订单时间
    orderInfo.ord_date =  new Date().getTime();

    return OrderDao.fillOrderAddrInfoIfNeed(orderInfo).then(OrderDao.fillOrderId);


};


/**
 * 填充订单id
 * @param orderInfo
 * @returns {Promise}
 */
OrderDao.fillOrderId = function (orderInfo)
{

    return new Promise(function (resolve, reject) {

        idDao.nextID().then(function (ordId) {

            orderInfo.ord_id = ordId;
            resolve(orderInfo);

        }).catch(reject);

    });

};
/**
 * 填充订单地址信息
 * @param orderInfo
 * @returns {Promise}
 */
OrderDao.fillOrderAddrInfoIfNeed = function (orderInfo)
{

    return new Promise(function (resolve, reject) {

        if(!orderInfo.r_id)
        {
            let uid = orderInfo.u_id;

            userDao.queryById(uid).then(function (userInfo)
            {
                // 用户所在片区id
                orderInfo.r_id = userInfo.r_id;
                // 用户角色(商家或者小区用户)
                orderInfo.u_type = userInfo.u_type;
                // 用户地址信息
                orderInfo.u_addr =   orderInfo.u_addr || userInfo.u_addr;

                resolve(orderInfo);

            });

        }else{

            resolve(orderInfo);
        }
    });
};