/**
 * Created by sprint on 16/8/13.
 */
'use strict';

/**
 * ResponseCode prototype.
 */
var ResponseCode = exports = module.exports = {

    /**
     * 成功code
     */
    successCode : 200,

    /**
     * 失败
     */
    failedCode : -200,

    /**
     * 参数错误
     */
    parameterErrorCode : -100,

    /**
     * 服务器错误
     */
    sysErrorCode : 500,




};



var JSONResponse = function(options) {

    return function (req,res,next) {

        /**
         * 响应成功信息
         * @param result 响应的json或者data 内部会根据有没有code和msg判断
         * @returns {Promise}
         */
        res.responseResult = function (result) {

            return new Promise(function (resolve) {

                if(result && result.code && result.msg) {

                    res.json(result);

                }else{

                    res.json(JSONResponse.jsonResult(result));
                }

                resolve();

            });

        };


        /**
         * 响应错误信息
         * @param result 错误json数据
         * @returns {Promise}
         */
        res.responseError = function (result) {


            return new Promise(function (resolve) {


                if(result && result.code && result.msg) {

                    res.json(result);

                }else{

                    // 默认系统错误
                    res.json(JSONResponse.jsonError(ResponseCode.sysErrorCode,result));
                }

                resolve();

            });

        };

        /**
         * 如果有错误的话 响应错误信息
         * @returns {boolean}
         */
        res.responseValidatorErrorIfNeed = function () {

            /**
             * 数据校验失败 直接返回
             */
            var mappedErrors = req.validationErrors();
            if (mappedErrors) {
                res.json({code:ResponseCode.parameterErrorCode,"msg":"参数错误",error:mappedErrors});
                return true;
            }
            return false;
        };

        next();

    };
};

/**
 * 响应的基本格式
 * @param code 响应码
 * @param msg  响应的消息
 * @param data 响应的数据信息
 */
JSONResponse.json = function (code,msg,data) {

    return {code:code,msg:msg,data:data};

};

/**
 * get json for error
 * @param code
 * @param msg
 * @returns {{code, msg, data}}
 */
JSONResponse.jsonError = function (code,msg) {

    return JSONResponse.json(code,msg);
};


/**
 * get json for result
 * @param data
 * @returns {{code, msg, data}}
 */
JSONResponse.jsonResult = function (data) {

    return JSONResponse.json(ResponseCode.successCode,"操作成功",data);
};


/**
 * 响应状态码
 * @type {JSONResponse}
 */
JSONResponse.ResponseCode = ResponseCode;


module.exports = JSONResponse;