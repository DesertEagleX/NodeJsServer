/**
 * Created by sprint on 16/8/13.
 */
'use strict';

var util = require('util');
var response = require('../../../response/response')

var UserValidator = exports = module.exports = {};


UserValidator.registerRouter = function (router) {


    /**
     * 登录时参数验证
     */
    router.route("/wx_signin").post(function (req,res,next) {

        // code 和 openid 必须传一个
        var code = req.query["wx_code"];
        var openId = req.query["wx_openId"];

        if( (!code || code == undefined)  && (!openId || openId == undefined ))
        {
            res.responseError("缺少 wx_code 或 wx_openId 参数");
            return;
        }

        next();


    });

    /**
     * 更新用户数据拦截
     */
    router.route("/update").post(function (req,res,next) {

        req.assert('uid', 'uid不能为空').notEmpty();
        req.assert('mobile', '请填写手机号').optional().notEmpty().isMobilePhone("zh-CN");
        req.assert('address', '请输入回收地址').optional().notEmpty();
        req.assert('rid', '请选择区域').optional().notEmpty().isInt();

        if(!res.responseValidatorErrorIfNeed()){
            next();
        }


    });


};
