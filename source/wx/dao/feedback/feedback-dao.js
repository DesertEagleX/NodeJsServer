/**
 * Created by sprint on 16/8/20.
 */
'use strict';
/**
 * Module dependencies.
 * @private
 */
const DB = require('../../../db/db');
const jsonResponse = require('../../../response/response')

//反馈表名称
const SQL_TableName = "u_feedback";
// 返回给调用端的字典信息 过滤掉敏感字段
const SQL_QueryFields = "f_id,f_content,f_status,u_id,u_mobile,u_name";

// 添加反馈信息
const SQL_InsertFeedBack = "INSERT INTO " +SQL_TableName + " SET ?";

/**
 * FeedBackDao prototype. 意见与反馈
 */
const FeedBackDao = exports = module.exports = {};


/**
 * 查询所有启用的废品
 */
FeedBackDao.addFeedBack = function (query) {

    return DB.query(SQL_InsertFeedBack,query);

};