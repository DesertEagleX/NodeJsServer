/**
 * Created by ligh on 16/9/17.
 */
'use strict';

/**
 * Module dependencies.
 * @private
 * 订单废品表 管理订单收购的废品信息
 */
const DB = require('../../../db/db');
const jsonResponse = require('../../../response/response');

// 订单废品表名称
const SQL_TableName = "Ord_Art";
//废品表名称
const SQL_Art_ArticleTableName = "Art_Article";

// 返回给调用端的字典信息 过滤掉敏感字段
const SQL_QueryFields = "oa.*,aa.art_name,aa.art_unit,aa.art_img_name";

// 插入订单废品
const SQL_InsertOrderArticle = "INSERT INTO " +SQL_TableName + " SET ?";

// 删除订单所有废品
const SQL_DelOrderArticles = "DELETE FROM "+SQL_TableName +" WHERE o_id = ?";

// 查询订单的废品列表
const SQL_QueryOrderArticles = "SELECT "+ SQL_QueryFields +" FROM " + SQL_TableName +" AS oa LEFT JOIN "+SQL_Art_ArticleTableName+" as aa ON oa.art_id = aa.art_id WHERE o_id = ?";

// 查询订单总价
const SQL_QueryOrderTotalPrice = "SELECT SUM(art_price)as total_price FROM ORD_ART where o_id = ?";

/**
 * OrderArticleDao prototype.
 */
const OrderArticleDao = exports = module.exports = {};


/**
 * 插入订单废品
 */
OrderArticleDao.insertOrderArticle = function (orderArticleInfo) {

    // 删除openid
    delete  orderArticleInfo.openid;


    return DB.query(SQL_InsertOrderArticle,orderArticleInfo);

};

/**
 * 删除订单的所有废品列表
 * @param query [o_id]
 */
OrderArticleDao.delOrderArticles = function (query)
{
    let ordId = query["o_id"];

    DB.query(SQL_DelOrderArticles,ordId);

};

/**
 * 计算订单价格
 * @param order 订单信息
 */
OrderArticleDao.calculateOrderPrice = function (order)
{

    let ordId = order.ord_id;
    return DB.query(SQL_QueryOrderTotalPrice,ordId).then(DB.resultsFirst).then(function (result)
    {
        order.total_price = result.total_price;

        return order;

    });

}

/**
 * 插入多个订单废品
 * @param query = {orderArticles,o_id}
 */
OrderArticleDao.insertOrderArticles = function (query)
{
    // 首先需要删除已存在的列表
    OrderArticleDao.delOrderArticles(query);

    // 废品列表
    let orderArticles = query["orderArticles"];

    for (var i = 0;i<orderArticles.length;i++)
    {
         DB.query(SQL_InsertOrderArticle,orderArticles[i]);
    }
};

/**
 * 查询订单的废品信息
 * @param orderId
 */
OrderArticleDao.queryByOrderId = function (orderId) {

    return DB.query(SQL_QueryOrderArticles,orderId);

};