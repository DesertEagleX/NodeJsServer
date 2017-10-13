/**
 * Created by sprint on 16/9/17.
 */
'use strict';
/**
 * Module dependencies.
 *
 *  回收员订单管理
 *
 * @private
 */
const DB = require('../../../db/db');
const jsonResponse = require('../../../response/response');

const order = require('../../../wx/dao/order/order');

//  回收员DAO
const EMDao = require('../user/em-dao');

// 用户Dao
const UserDao = require('../../../wx/dao/user/user-dao');


const PageCount = 10;
// 订单表
const SQL_TableName = "Ord_Order";
// 用户表
const SQL_User_TablueName = "U_User";
// 排序
const SQL_OrderSort = " ORDER BY ord_date DESC "; // ORDER BY ord_date DESC
const SQL_ORDER_LIMIT = " LIMIT ?,"+PageCount;;


// 更新订单信息
const SQL_UpdateEmployeeOrderInfo = "UPDATE "+ SQL_TableName+ " SET ? WHERE  em_id = ? AND ord_id = ?";

const SQL_UpdateOrderInfo = "UPDATE "+ SQL_TableName+ " SET ? WHERE ord_id = ?";

/**
 *  查询未完成的订单列表
 * @type {string}
 */
const SQL_JOIN_QueryFields = "o.ord_id,o.ord_price,o.ord_art_types,o.u_id,o.em_id,o.r_id,o.u_addr,o.ord_note,o.ord_date,o.visit_date,o.ord_end_date,o.ord_status,u.u_name,u.u_type,u.u_mobile,u.u_headimgurl";


const SQL_QueryOrderInfo = "SELECT " + SQL_JOIN_QueryFields+" FROM "+SQL_TableName+" as o  LEFT JOIN "
    +SQL_User_TablueName+" as u ON o.u_id = u.u_id  WHERE o.ord_id = ?";

const SQL_QueryUndoOrderList = "SELECT " + SQL_JOIN_QueryFields+" FROM "+SQL_TableName+" as o  LEFT JOIN "
                             +SQL_User_TablueName+" as u ON o.u_id = u.u_id  WHERE o.em_id = ? AND o.ord_status < "+order.OrderStaus.OrderStatusCompleted.code + SQL_ORDER_LIMIT;;


/**
 * 已完成
 * @type {string}
 */
const SQL_QueryCompletedOrderList =  "SELECT " + SQL_JOIN_QueryFields+" FROM "+SQL_TableName+" as o  LEFT JOIN "
    +SQL_User_TablueName+" as u ON o.u_id = u.u_id  WHERE o.em_id = ? AND o.ord_status = "+order.OrderStaus.OrderStatusCompleted.code + SQL_OrderSort + SQL_ORDER_LIMIT;



/**
 * 全部订单
 * @type {string}
 */
const SQL_QueryOrderList = "SELECT " + SQL_JOIN_QueryFields+" FROM "+SQL_TableName+" as o  LEFT JOIN "
    +SQL_User_TablueName+" as u ON o.u_id = u.u_id  WHERE o.em_id = ?" + SQL_OrderSort + SQL_ORDER_LIMIT

/**
 * 查询今日订单 包括预约订单
 */
const SQL_QueryTodayOrderList =  "SELECT " + SQL_JOIN_QueryFields+" FROM "+SQL_TableName+" as o  LEFT JOIN "
    +SQL_User_TablueName+" as u ON o.u_id = u.u_id  WHERE o.em_id = ? AND o.ord_status < "+order.OrderStaus.OrderStatusCompleted.code +
    " AND ((UNIX_TIMESTAMP(DATE_FORMAT(FROM_UNIXTIME(o.ord_date/1000),'%Y-%m-%d')) = (UNIX_TIMESTAMP(DATE_FORMAT(SYSDATE(),'%Y-%m-%d'))) AND visit_date IS NULL) "+
    " OR UNIX_TIMESTAMP(DATE_FORMAT(FROM_UNIXTIME(o.visit_date/1000),'%Y-%m-%d')) = (UNIX_TIMESTAMP(DATE_FORMAT(SYSDATE(),'%Y-%m-%d')))) ";


/**
 * 查询预约订单
 */
const SQL_QueryVisitOrderList =  "SELECT " + SQL_JOIN_QueryFields+" FROM "+SQL_TableName+" as o  LEFT JOIN "
    +SQL_User_TablueName+" as u ON o.u_id = u.u_id  WHERE o.em_id = ? AND o.ord_status < "+order.OrderStaus.OrderStatusCompleted.code +
    " AND o.visit_date > 0";



/**
 * 今日未完成订单数量
 * @type {string}
 */
const SQL_QueryTodayCount = "SELECT count(ord_id) FROM "+SQL_TableName +
                        "  WHERE ord_status < "+order.OrderStaus.OrderStatusCompleted.code +
                        "  AND em_id=? "+
                        "  AND ((UNIX_TIMESTAMP(DATE_FORMAT(FROM_UNIXTIME(ord_date/1000),'%Y-%m-%d')) = (UNIX_TIMESTAMP(DATE_FORMAT(SYSDATE(),'%Y-%m-%d'))) AND visit_date IS NULL) "+
                         " OR UNIX_TIMESTAMP(DATE_FORMAT(FROM_UNIXTIME(visit_date/1000),'%Y-%m-%d')) = (UNIX_TIMESTAMP(DATE_FORMAT(SYSDATE(),'%Y-%m-%d')))) ";

/**
 * 查询未完成预约订单数量
 * @type {string}
 */
const SQL_QueryVistOrderCount =   " SELECT count(ord_id) FROM Ord_Order WHERE visit_date > 0 " +
                                "  AND ord_status < "+order.OrderStaus.OrderStatusCompleted.code +
                                "  AND em_id=?";


/**
 * 查询未完成订单数量
 * @type {string}
 */
const SQL_QueryUndoOrderCount =   " SELECT count(ord_id) FROM Ord_Order " +
    "  WHERE ord_status < "+order.OrderStaus.OrderStatusCompleted.code +
    "  AND em_id=?";

/**
 * 今日统计
 * @type {string}
 */
const SQL_QueryTodayChart = "SELECT ( "+ SQL_QueryTodayCount +" ) as tcount," +
                                    "("+SQL_QueryVistOrderCount+") as vcount,"+
                                    "("+SQL_QueryUndoOrderCount+") as ucount"




/**
 * 查询回收员订单数量
 * @type {string}
 */
const SQL_QueryEmOrderTotalCount =   " SELECT count(ord_id) as tcount FROM Ord_Order " +
                                    "  WHERE ord_status = "+order.OrderStaus.OrderStatusCompleted.code +
                                    "  AND em_id=?";




/**
 * EmployeeOrderDao prototype.
 */
const EmployeeOrderDao = exports = module.exports = {};

EmployeeOrderDao.orderChart = function (query)
{
    let em_id = query["em_id"];
    return DB.query(SQL_QueryTodayChart,[em_id,em_id,em_id]).then(DB.resultsFirst);

};

/**
 * 查询回收员订单详情
 * @param em_id 回收员id
 * @param ord_id 订单id
 */
EmployeeOrderDao.EMOrderInfo = function (query)
{
    let ord_id = query["ord_id"];
    let em_id = query["em_id"];

    return DB.query(SQL_QueryOrderInfo,[ord_id]).then(DB.resultsFirst);
}


/**
 * 查询未完成订单列表
 * @param query
*/
EmployeeOrderDao.orderUndoList = function (query)
{

    let emId = query["em_id"];
    let page =   query["page"] || 1;

    return DB.query(SQL_QueryUndoOrderList,[emId,PageCount * (page - 1)]);

}

/**
 * 已完成订单列表
 * @param query
 */
EmployeeOrderDao.orderCompletedList = function (query)
{

    let emId = query["em_id"];
    let page =   query["page"] || 1;

    return DB.query(SQL_QueryCompletedOrderList,[emId,PageCount * (page - 1)]);

}

/**
 * 全部订单
 * @param query
 */
EmployeeOrderDao.orderList = function (query)
{

    let emId = query["em_id"];
    let page =   query["page"] || 1;

    return DB.query(SQL_QueryOrderList,[emId,PageCount * (page - 1)]);

}

/**
 * 查询今日订单
 * @param query
 */
EmployeeOrderDao.todayOrderList = function (query)
{

    let emId = query["em_id"];

    return DB.query(SQL_QueryTodayOrderList,[emId]);

}

/**
 * 查询预约订单
 * @param query
 */
EmployeeOrderDao.visitOrderList = function (query)
{

    let emId = query["em_id"];

    return DB.query(SQL_QueryVisitOrderList,[emId]);

}

/**
 * 获取回收员完成订单总数量
 * @param query
 */
EmployeeOrderDao.orderTotalCount = function (query)
{
    let em_id = query["em_id"];
    return DB.query(SQL_QueryEmOrderTotalCount,[em_id]).then(DB.resultsFirst);
}

/**
 * 查询订单信息
 * @param query
 * @returns {*}
 */
EmployeeOrderDao.orderInfo = function (query)
{
    let ord_id = query["ord_id"];

    return DB.query(SQL_QueryOrderInfo,[ord_id]).then(DB.resultsFirst);
}


/**
 * 更新订单信息
 */
EmployeeOrderDao.updateOrderInfo = function (em_id, ord_id, orderInfo)
{
    return DB.query(SQL_UpdateEmployeeOrderInfo,[orderInfo,em_id,ord_id]);
}

/**
 * 更新订单信息
 */
EmployeeOrderDao.updateOrderInfo = function (ord_id, orderInfo)
{
    return DB.query(SQL_UpdateOrderInfo,[orderInfo,ord_id]);
}


/**
 * 指派订单
 * @param order 订单信息
 * @constructor
 */
EmployeeOrderDao.Sys_AssigningOrder = function (order)
{
    return new Promise(function (resolve, reject) {

        var rid = order.r_id;

        // 查出来的回收员已经按照 星级和忙碌状态排好序 (查询片区下的所有用户 )
        EMDao.Sys_QueryStandbyEmployeeList(rid).then(function (employeeList)
        {
            console.log("employee = employeeList == "+employeeList.length );

            var standbyEmployeeList = employeeList;

            // 如果是小区用户的订单
            if (order.u_type == UserDao.Const.UserRoleType.GeneralUserRoleType)
            {
                // 查询改片区下有没有专门回收小区的回收员
                var xiaoQumployeeList = [];

                for (var index in employeeList)
                {
                    let employee = employeeList[index];
                    if (employee.em_role_type == EMDao.RoleType.XiaoQuRoleType)
                        xiaoQumployeeList.push(employee);
                }

                if(xiaoQumployeeList.length > 0)
                    standbyEmployeeList = xiaoQumployeeList;

            }else
            {

                // 商家超市回收员
                var storeEmployeeList = [];

                for (var index in employeeList)
                {
                    let employee = employeeList[index];
                    if (employee.em_role_type != EMDao.RoleType.XiaoQuRoleType)
                        storeEmployeeList.push(employee);
                }

                if (storeEmployeeList.length > 0)
                    standbyEmployeeList = storeEmployeeList;
            }

            order.emplyees = standbyEmployeeList;
            resolve(order);

        }).catch(reject);


    });

};


/**
 * 为订单分配回收员 只做分配 不会将任务推送给回收员 也不会变更状态
 * @waring 系统只会获取第一个订单的r_id 要保证传入的订单数组 都在一个r_id下
 * @param orders 该区域下的订单列表
 */
EmployeeOrderDao.Sys_AssigningOrders = function (orders)
{

    return new Promise(function (resolve, reject) {

        if(!orders.length)
        {
            reject();
            return;
        }

        var assignCount = 0;

        for(var i = 0; i<orders.length; i++)
        {
            var order = orders[i];
            var rid = order.r_id;


            EmployeeOrderDao.Sys_AssigningOrder(order).then(function (orderInfo) {

                assignCount +=1;

                if(assignCount == orders.length)
                {
                    resolve(orders);
                }

            }).catch(reject);


        }

    });

};
