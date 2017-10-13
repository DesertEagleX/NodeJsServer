/**
 * Created by sprint on 16/8/13.
 */


var util = require('util');
var response = require('../../response/response')

var EMValidator = exports = module.exports = {};


EMValidator.registerRouter = function (router) {


    router.route("/signin").post(function (req,res,next)
    {

        req.assert("mobile","mobile参数不能为空或格式错误").notEmpty().isMobilePhone('zh-CN');
        req.assert("pwd","pwd参数不能为空").notEmpty();

        if(!res.responseValidatorErrorIfNeed()){
            next();
        }

    });

    /**
     * 更新用户数据拦截
     */
    router.route("/signup").post(function (req,res,next) {

        req.assert('mobile', '请填写手机号').notEmpty().isMobilePhone("zh-CN");
        req.assert('pwd', '请输入密码').notEmpty().len(6,12);
        req.assert('rid', '请选择区域').notEmpty().isInt();
        req.assert('name', '请填写真实姓名').notEmpty().len(2,10);

        if(!res.responseValidatorErrorIfNeed()){
            next();
        }

    });


};
