/**
 * Created by sprint on 16/8/20.
 */
'use strict';

var express = require('express');
var response = require('../../../response/response');
/** region dao **/
var regionDao = require('../../dao/region/region-dao');

/**
 * RegionRouter prototype. 区域信息API接口
 */
var RegionRouter = exports = module.exports = express.Router();


/**
 * register validater to routes
 */
// var validator = require("../validator/order-validator")
// validator.registerRouter(OrderRouter);

/**
 * routes by regions 查询所有片区
 */
RegionRouter.post("/regions", function(req, res)
{

    regionDao.queryAllSubRegions().then(res.responseResult).catch(res.responseError);

});

/**
 * 获取单个区域详情
 */
RegionRouter.post("/regionInfo", function(req, res)
{

    regionDao.queryById(req.query["rid"]).then(res.responseResult).catch(res.responseError);

});
