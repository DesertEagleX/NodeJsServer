/**
 * Created by sprint on 16/8/13.
 */
'use strict';

const util = require('util');
const response = require('../../../response/response')

const FeedBackValidator = exports = module.exports = {};


FeedBackValidator.registerRouter = function (router) {

    /**
     * 登录时参数验证
     */
    router.route("/addFeedback").post(function (req,res,next) {

        req.assert('content', '反馈内容不能为空').notEmpty();

        if(!res.responseValidatorErrorIfNeed())
        {
            next();
        }


    });

};
