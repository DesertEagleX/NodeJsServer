/**
 * Created by sprint on 16/8/13.
 */
'use strict';

const express = require('express');
const Response = require('../../../response/response');
const MOrderDao = require('../dao/MOrderDao');

/**
 * OrderRouter prototype.
 */
const MOrderRouter = exports = module.exports = express.Router();



/**
 * routes by user_orders 查询用户订单信息
 */
MOrderRouter.post("/order_list", function(req, res)
{

    MOrderRouter.convertQuery(req.query).then(MOrderDao.queryByStatus).then(res.responseResult).catch(res.responseError);

});


/**
 * 将参数转为数据库字典名称
 * @param query
 */
MOrderRouter.convertQuery = function (query) {

    return new Promise(function (resolve) {

        var fieldsMap = {"uid":"u_id","rid":"r_id","oid":"ord_id","ord_art_types":"ord_art_types","status":"ord_status","addr":"u_addr","comment":"ord_note","visit_date":"visit_date"};
        var newQuery = {};

        for(var key in query) {

            if(!fieldsMap[key]){
                newQuery[key] = query[key];
                continue;
            }
            newQuery[fieldsMap[key]] = query[key];
        }

        resolve(newQuery);

    });

};