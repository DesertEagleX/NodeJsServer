/**
 * Created by sprint on 16/9/4.
 */
'use strict';

var express = require('express');
var md5 = require('js-md5');
var response = require('../../response/response');
/** employee dao **/
var employeeDao = require('../dao/user/em-dao');
var employeeOrderDao = require('../dao/order/em_order_dao');

/**
 * Employee prototype.
 */
var EmployeeRouter = exports = module.exports = express.Router();

/**
 * register validater to routes
 */
var validator = require("../validator/em_validator")
validator.registerRouter(EmployeeRouter);

/**
 * routes by signin 登录信息
 */
EmployeeRouter.post("/signin", function(req, res)
{

    EmployeeRouter.convertQuery(req.query).then(employeeDao.signin).then(function (userInfo)
    {
        let pushId = req.query["push_registration_id"];

        // 每次登录成功后都要更新id
        if(pushId)
        {
            EmployeeDao.updateUserInfo({"push_registration_id":pushId},userInfo.em_id);
        }

        return userInfo;

    }).then(function (userInfo)
    {

        // 两次md5加密 存储在服务器中的md5值 所以必须两次加密
        var reqTokenMD5 = md5(req.query["pwd"]);
        var token = md5(req.query["mobile"] + reqTokenMD5 );

        userInfo.token = token;

        // var data = {token:token,user:userInfo};

        res.responseResult(userInfo);


    }).catch(res.responseError);

});


/**
 * routes by chart 首页统计
 */
EmployeeRouter.post("/home_chart", function(req, res)  {

    EmployeeRouter.convertQuery(req.query).then(employeeOrderDao.orderChart).then(res.responseResult).catch(res.responseError);

});


/**
 * routes by userInfo
 */
EmployeeRouter.post("/user_info", function(req, res)  {


    EmployeeRouter.convertQuery(req.query).then(employeeDao.userInfo).then(function (userInfo)
    {
        EmployeeRouter.convertQuery(req.query).then(employeeOrderDao.orderTotalCount).then(function (result) {

            userInfo.orderCount = result["tcount"];

            res.responseResult(userInfo);

        }).catch(res.responseError);;


    }).catch(res.responseError);

});


/**
 * routes by signup 注册
 */
EmployeeRouter.post("/signup", function(req, res)  {

    EmployeeRouter.convertQuery(req.query).then(employeeDao.addUserInfo).then(res.responseResult).catch(res.responseError);

});


/**
 * 将参数转为数据库字典名称
 * @param query
 */
EmployeeRouter.convertQuery = function (query) {

    return new Promise(function (resolve) {

        var fieldsMap = {"emid":"em_id","rid":"r_id","status":"ord_status","addr":"u_addr","mobile":"em_mobile","pwd":"em_pwd","name":"em_name","push_id":"push_registration_id"};
        var newQuery = {};

        for(var key in query) {

            if(!fieldsMap[key]) {
                newQuery[key] = query[key];
                continue;
            }
            newQuery[fieldsMap[key]] = query[key];
        }

        resolve(newQuery);

    });

};