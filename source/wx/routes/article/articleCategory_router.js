/**
 * Created by ligh on 2017/4/29.
 */
'use strict';

const express = require('express');
const response = require('../../../response/response');

const ArticleCategoryDao = require('../../dao/article/articleCategory_dao');

/**
 * ArticleCategoryRouter prototype.
 */
const ArticleCategoryRouter = exports = module.exports = express.Router();

/**
 * routes by art_categories 查询所有分类
 */
ArticleCategoryRouter.post("/art_categories", function(req, res)  {

    ArticleCategoryDao.queryAllIfEnable().then(res.responseResult).catch(res.responseError);

});