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
const order = require('../../../wx/dao/order/order');
const moment = require('moment');

const PageCount = 10;

const SQL_TableName = "Ord_Order";
// 回收员订单
const SQL_EM_TableName = "Em_Employment";
// 用户表
const SQL_User_TableName = "U_User";
// 排序字段
const SQL_OrderSort = " ORDER BY ord_date DESC "; // ORDER BY ord_date DESC

//================= Fileds ==================//
// 返回给调用端的字典信息 过滤掉敏感字段
const SQL_QueryFields = "ord_id,u_id,em_id,r_id,u_addr,ord_note,ord_date,visit_date,ord_status,ord_price,ord_art_types";

// 订单链接查询字段 包含回收员信息
const SQL_JOIN_QueryFields = "o.ord_id,o.u_id,o.ord_art_types,o.em_id,o.r_id,o.u_addr,o.ord_note,o.ord_date,o.visit_date,o.ord_end_date,o.ord_status,o.ord_price,e.em_id,e.em_name,e.em_mobile";

// 链接用户表
const SQL_JOIN_UserQueryFileds = "o.ord_id,o.u_id,o.ord_art_types,o.em_id,o.r_id,o.u_addr,o.ord_note,o.ord_date,o.visit_date,o.ord_end_date,o.ord_status,o.ord_price,u.u_name,u.u_mobile";


//================= Query ==================//

// 根据订单状态查询订单
const SQL_JOIN_QueryByStatus = "SELECT "+SQL_JOIN_UserQueryFileds+" FROM "+SQL_TableName +" o  LEFT JOIN "+SQL_User_TableName+" u ON o.u_id = u.u_id WHERE o.ord_status = ? LIMIT ?,"+PageCount;

// 根据订单id查询订单详情
const SQL_JOIN_QueryByID = "SELECT "+SQL_JOIN_QueryFields+" FROM "+SQL_TableName+" o LEFT JOIN "+SQL_EM_TableName+" e ON o.em_id = e.em_id  WHERE u_id = ? AND ord_id = ? ";

// 根据两个结束时间查询
const SQL_QueryByEndDateRange = " SELECT " + SQL_QueryFields + " FROM "+ SQL_TableName +" WHERE ord_end_date >= ? AND ord_end_date <= ?";

/**
 * OrderDao prototype.
 */
const MOrderDao = exports = module.exports = {};

/**
 * 根据订单状态查询订单列表
 * @param query
 */
MOrderDao.queryByStatus = function (query)
{
    let newPage = query["page"] || 1;
    let status = query["ord_status"];
    return DB.query(SQL_JOIN_QueryByStatus,[status,PageCount * (newPage - 1)]);
};

/**
 * 根据两个结束区间查询订单
 * @param query
 */
MOrderDao.queryByEndDateRange = function (query)
{
    let m = moment({hour: 0, minute: 0, seconds: 0});

    // 默认查询当天的订单
    let start_ord_end_date = query["start_ord_end_date"] ? moment(query["start_ord_end_date"]) : m;
    let end_ord_end_date = query["end_ord_end_date"] ? moment(query["end_ord_end_date"]) : m;

    return DB.query(SQL_JOIN_QueryByStatus,[status,PageCount * (newPage - 1)]);
};


/**
 * 将查询结果results根据rid分组
 * @param results
 */
MOrderDao.flatResultsByRID = function (results)
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