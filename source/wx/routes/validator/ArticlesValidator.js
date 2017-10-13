/**
 * Created by ligh on 2017/2/18.
 */
'use strict';

var util = require('util');
var response = require('../../../response/response')

var ArticlesValidator = exports = module.exports = {};


ArticlesValidator.registerRouter = function (router)
{

    /**
     * 获取废品信息时 需要做验证
     */
    router.route("/articles").post(function (req,res,next) {


        req.assert('user_id', 'user_id参数不能空').notEmpty();

        if(!res.responseValidatorErrorIfNeed()){
            next();
        }


    });


};
