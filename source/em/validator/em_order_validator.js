/**
 * Created by ligh on 16/9/17.
 */

var util = require('util');
var response = require('../../response/response')

var EMOrderValidator = exports = module.exports = {};


EMOrderValidator.registerRouter = function (router) {

    /**
     * 确认订单
     */
    router.route("/confirmOrder").post(function (req,res,next) {

        req.assert("articles","articles参数不能为空").notEmpty();
        req.assert("order_id","order_id参数不能为空").notEmpty();
        req.assert("u_type","u_type参数不能为空").notEmpty();
        req.assert("emid","emid参数不能为空").notEmpty();
        req.assert("user_id","user_id参数不能为空").notEmpty();

        if(!res.responseValidatorErrorIfNeed()){
            next();
        }

    });

    /**
     * 计算订单价格
     */
    router.route("/calculate_articlesprice").post(function (req,res,next) {

        req.assert("articles","articles参数不能为空").notEmpty();
        req.assert("order_id","order_id参数不能为空").notEmpty();
        req.assert("u_type","u_type参数不能为空").notEmpty();
        req.assert("emid","emid参数不能为空").notEmpty();

        if(!res.responseValidatorErrorIfNeed()){
            next();
        }

    });


    /**
     * 接单
     */
    router.route("/acceptOrder").post(function (req,res,next) {

        req.assert("order_id","order_id参数不能为空").notEmpty();
        req.assert("emid","emid参数不能为空").notEmpty();

        if(!res.responseValidatorErrorIfNeed()){
            next();
        }

    });

    /**
     * 更新订单状态
     */
    router.route("/updateOrderStatus").post(function (req,res,next) {

        req.assert("emid","emid参数不能为空").notEmpty();
        req.assert("order_id","order_id参数不能为空").notEmpty();
        req.assert("ordStatus","ordStatus参数不能为空").notEmpty();

        if(!res.responseValidatorErrorIfNeed()){
            next();
        }

    });



}
