/**
 * Created by ligh on 16/9/17.
 */
'use strict';

const express = require('express');
const response = require('../../../response/response');
/** feedback dao **/
const FeedbackDao = require('../../dao/feedback/feedback-dao');

/**
 * FeedbackRouter prototype.
 */
const FeedbackRouter = exports = module.exports = express.Router();


/**
 * register validater to routes
 */
const validator = require("../validator/feedback-validator")
validator.registerRouter(FeedbackRouter);


/**
 * routes by addFeedback 用户反馈
 */
FeedbackRouter.post("/addFeedback", function(req, res)
{

    FeedbackRouter.convertQuery(req.query).then(FeedbackDao.addFeedBack).then(res.responseResult).catch(res.responseError);

});

/**
 * 将参数转为数据库字典名称
 * @param query
 */
FeedbackRouter.convertQuery = function (query) {

    return new Promise(function (resolve) {

        let fieldsMap = {"uid":"u_id","content":"f_content","mobile":"u_mobile","name":"u_name"};
        let newQuery = {};

        for(let key in query) {

            if(!fieldsMap[key]){
                // newQuery[key] = query[key];
                continue;
            }
            newQuery[fieldsMap[key]] = query[key];
        }

        resolve(newQuery);

    });

};