/**
 * Created by sprint on 16/8/13.
 */
'use strict';

const util = require('util');
const validator = require('validator');
const moment = require('moment');

const response = require('../../../response/response')
const order = require('../../dao/order/order')

const OrderValidator = exports = module.exports = {};

OrderValidator.registerRouter = function (router) {

    /**
     * 添加时数据验证
     */
    router.route("/user_orders").post(function (req,res,next) {

        /**
         * 验证手机
         */
        req.assert('uid', 'uid不能为空').notEmpty();

        if(!res.responseValidatorErrorIfNeed()){
            next();
        }

    });

    /**
     * 查询订单信息
     */
    router.route("/order_info").post(function (req,res,next) {


        req.assert('uid', '用户id不能为空').notEmpty();
        req.assert('oid', '订单id不能为空').notEmpty();

        if(!res.responseValidatorErrorIfNeed()){
            next();
        }


    });

    /**
     * 下单请求过滤 验证参数
     */
    router.route("/insertOrder").post(function (req,res,next) {

        // 必填
        req.assert('uid', '用户id不能为空').notEmpty();

        /**
         * 如果用户自己选择了片区 (可能是为别人下单) 则必须输入ord_addr信息
         */
        if( req.query["rid"] )
        {
            req.assert('addr', '订单详细地址不能为空').notEmpty();

        } else
            {
            // 如果传了下面的字段 就不能为空
            req.assert('addr', '订单详细地址不能为空').optional().notEmpty();
            req.assert('rid', '区域不能为空').optional().notEmpty().isInt();
        }

        if(!res.responseValidatorErrorIfNeed()){
            next();
        }


    });

};
