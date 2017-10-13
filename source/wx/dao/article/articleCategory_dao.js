/**
 * 废品分类表
 */

'use strict';
/**
 * Module dependencies.
 * @private
 */
const DB = require('../../../db/db');
const jsonResponse = require('../../../response/response');

const C_Enable = 1;

// 分类表
const SQL_TableName = "Art_Category";

// 返回给调用端的字典信息 过滤掉敏感字段
const SQL_QueryFields = "c_id,c_name,c_enable,c_img_name";

// 查询废品所有启用废品列表
const SQL_QueryEnableAll =  "SELECT "+ SQL_QueryFields +" FROM " + SQL_TableName + " WHERE c_enable = " + C_Enable;


/**
 * ArticleDao prototype.
 */
const ArticleCategoryDao = exports = module.exports = {};

/**
 * 查询所有启用的废品
 */
ArticleCategoryDao.queryAllIfEnable = function ()
{
    return DB.query(SQL_QueryEnableAll);
};

/**
 * 查询分类废品及价格信息
 */
ArticleCategoryDao.queryAllArticles = function () {

};