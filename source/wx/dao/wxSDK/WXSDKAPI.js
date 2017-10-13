/**
 * Created by ligh on 2016/11/19.
 */
'use strict';

const request = require('request');
const qs = require('querystring');
const WXSDKConfig = require('./WXSDKConfig');

/**
 * WXSDKAPI prototype.
 */
var WXSDKAPI = exports = module.exports = {};

/**
 * 根据用户授权后获取的code 请求openId
 * @param code
 */
WXSDKAPI.requestWXOpenID = function (code) {

    // 请求参数
    var params =
    {
        appid: WXSDKConfig.AppId,
        secret: WXSDKConfig.AppSecret,
        code: code,
        grant_type: WXSDKConfig.Grant_Type
    };

    // 请求选项
    var options =
    {
        method: 'get',
        url: WXSDKConfig.URL.OAuth2AccessToken_URL + qs.stringify(params)
    };

    return new Promise(function (resolve, reject)
    {
        // 发起请求
        request(options, function (err, res, body)
        {

            if (res)
            {
                resolve(res.body);

            } else
            {
                reject(err);
            }
        })

    });

};

/**
 * 查询微信用户信息
 * @param query {access_token,openid}
 */
WXSDKAPI.requestUserInfo = function (query) {

    query = JSON.parse(query);

    // 请求参数
    var params =
    {
        access_token: query['access_token'],
        openid: query['openid'],
        lang: 'zh_CN'
    };

    // 请求选项
    var options =
    {
        method: 'get',
        url: WXSDKConfig.URL.WXUserInfo_URL+qs.stringify(params)
    };

    return new Promise(function (resolve, reject)
    {
        // 发起请求
        request(options, function (err, res, body)
        {
            if (res)
            {
                resolve(res.body);

            } else
            {
                reject(err);
            }
        })

    });

};

/**
 * 请求用户accessToken
 * @returns {Promise}
 */
WXSDKAPI.requstAccessToken = function ()
{

    // 请求选项
    var options =
    {
        method: 'get',
        url: WXSDKConfig.URL.APIAccessToken_URL
    };

    return new Promise(function (resolve, reject)
    {
        // 发起请求
        request(options, function (err, res, body)
        {
            if (res)
            {
                resolve(JSON.parse(res.body));

            } else
            {
                reject(err);
            }
        })

    });
};

/**
 * 发送模板消息
 */
WXSDKAPI.sendTemplateMessage = function (message)
{

    return new Promise(function (resolve, reject)
    {

        WXSDKAPI.requstAccessToken().then(function (query)
        {

            // let p =
            // {
            //     "touser":"oBYjjvolMnw_58D1Egxlfe2b8w7U",
            //     "template_id":"CLwDtREaM013tI6wQ7LEG_hUAdalMFBD9VxVVvPEp_Q",
            //     "url":"http://weixin.qq.com/download",
            //     "data":{
            //         "first":
            //         {
            //             "value":"回收员已出发",
            //             "color":"#173177"
            //         },
            //
            //         "keyword1":
            //         {
            //             "value":"784-44848311",
            //             "color":"#173177"
            //         },
            //
            //         "keyword2":
            //         {
            //             "value":"2015-01-01 12:00:00",
            //             "color":"#173177"
            //         },
            //
            //         "keyword3":
            //         {
            //             "value":"2014年9月22日",
            //             "color":"#173177"
            //         },
            //
            //         "remark":
            //         {
            //             "value":"回收员已出发 请您在家等待回收员上门！",
            //             "color":"#173177"
            //         }
            //     }
            // // };

            // 请求选项
            var options =
            {
                method: 'post',
                url:  WXSDKConfig.URL.SendTemplateMessage_URL+"access_token="+query["access_token"],
                json:message
            };

            return new Promise(function (resolve, reject)
            {
                // 发起请求
                request(options, function (err, res, body)
                {
                    console.log(body);

                    if (res)
                    {
                        resolve(body);

                    } else
                    {
                        reject(err);
                    }
                })

            });


        });
    });
};


