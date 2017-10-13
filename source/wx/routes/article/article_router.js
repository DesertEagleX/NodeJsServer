/**
 * Created by ligh on 16/9/17.
 */
'use strict';

const express = require('express');
const response = require('../../../response/response');
/** article dao **/
const articleDao = require('../../dao/article/article_dao');

const WXUserDao = require('../../dao/user/user-dao');
// 废品价格信息
const ArticlePriceDao = require('../../dao/article_price/article_price_dao');

/**
 * ArticleRouter prototype.
 */
const ArticleRouter = exports = module.exports = express.Router();


/**
 * register validater to routes
 */
const validator = require("../validator/ArticlesValidator")
validator.registerRouter(ArticleRouter);


/**
 * routes by articles 根据用户id查询用户废品及价格信息
 */
ArticleRouter.post("/articles", function(req, res)  {

    WXUserDao.queryById(req.query["user_id"]).then(function (userInfo)
   {
       // 验证用户有没有设置地址 如果没有设置地址 价格显示为超市价格
        if(!userInfo.r_id)
        {
            return WXUserDao.Const.UserRoleType.SupermarketRoleType;
        }

        // 返回用户设置的类型
        return userInfo.u_type;

    }).then(ArticlePriceDao.queryArticlesAndPriceByUserType).then(res.responseResult).catch(res.responseError);

});

/**
 * routes by articles 根据用户角色类型 查询废品及价格信息
 */
ArticleRouter.post("/articles_by_userType", function(req, res)  {

    ArticlePriceDao.queryArticlesAndPriceByUserType(req.query["u_type"]).then(res.responseResult).catch(res.responseError);

});
