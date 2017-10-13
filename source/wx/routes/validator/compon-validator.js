/**
 * Created by sprint on 16/8/13.
 */
'use strict';

var response = require('../../../response/response');
var userDao = require('../../dao/user/user-dao');
var emDao = require('../../.././em/dao/user/em-dao');
var md5 = require('js-md5');

var excludeRouter = [];

/**
 * 通用过滤器
 * @param options
 * @returns {Function}
 * @constructor
 */
var CommonValidator = function(options)
{

    return function (req,res,next)
    {

        req.query = Object.keys(req.body).length > 0 ? req.body : req.query;

        // 解决跨域问题
        res.append('Access-Control-Allow-Origin',"*");

        // 微信
        if(req.path.startsWith("/wx"))
        {

            WXCommonValidator(req,res,next);

        } else if(req.path.startsWith("/em"))
        {

            EMCommonValidator(req,res,next);

        }else
        {
            next();
        }

    };
};

/**
 * 微信端通用验证器
 * @param req
 * @param res
 * @param next
 */
var WXCommonValidator = function (req,res,next)
{


    // 分页数据
    req.assert('page', 'page格式错误').optional().notEmpty().isInt({min: 1});

    var isSignin = req.path.indexOf('wx_signin') >= 0;

    /**
     * 如果不是登录接口 需要验证身份的合法性
     */
    if( !isSignin )
    {
        req.assert("uid","uid参数不能为空").notEmpty();
        
    }

    if(!res.responseValidatorErrorIfNeed())
    {
            next();
    }
}

/**
 * 回收员端通用验证器
 * @param req
 * @param res
 * @param next
 * @constructor
 */
var EMCommonValidator = function (req,res,next)
{

    var isSignup = req.path.indexOf('signup') >= 0;
    var isSignin = req.path.indexOf('signin') >= 0;

    if(isSignup || isSignin) {

        next();

        return;
    }

    req.assert("emid","emid参数不能为空").notEmpty();
    req.assert("token","token参数不能为空").notEmpty();

    if(!res.responseValidatorErrorIfNeed()) {

        req.query = req.query || req.body;

        emDao.Sys_UserInfo(req.query['emid']).then(function (emInfo) {

                var emToken =  md5( emInfo.em_mobile + emInfo.em_pwd );
                var reqToken = req.query['token'];

                if(emToken == reqToken) {

                    next();

                } else {

                   res.responseError({code:response.ResponseCode.parameterErrorCode,"msg":"token不合法"});
                }


            }).catch(res.responseError);

    }

}


module.exports = CommonValidator;