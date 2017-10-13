/**
 * Created by sprint on 16/8/13.
 */
'use strict';

const moment = require('moment');

const express = require('express');
const response = require('../../../response/response');
const userDao = require('../../dao/user/user-dao');
const md5 = require('js-md5');
const WXSDKAPI = require('../../dao/wxSDK/WXSDKAPI');

/**
 * UserRouter prototype.
 */
const UserRouter  = module.exports = express.Router();

/**
 * register validater to routes
 */
const validator = require("../validator/user-validator")
validator.registerRouter(UserRouter);


/**
 * routes by signin 登录
 */
UserRouter.post('/wx_signin', function(req, res)
{

    let code = req.query["wx_code"];
    let openId = req.query["wx_openId"];

    // 授权登录
    if(code && code != undefined && openId == undefined)
    {


        WXSDKAPI.requestWXOpenID(code)
                .then(WXSDKAPI.requestUserInfo)
                .then(UserRouter.convertWxUserInfo)
                .then(userDao.addWXUser)
                .then(userDao.queryByOpenID)
                .then(queryUserInfoNextServiceTime)
                .then(res.responseResult)
                .catch(res.responseError);

    }else
    {

        //已授权
        UserRouter.convertQuery(req.query)
            .then(userDao.queryByOpenID)
            .then(queryUserInfoNextServiceTime)
            .then(res.responseResult).catch(res.responseError);
    }

});


/**
 * 查询用户下次服务时间
 * @param userInfo
 * @returns {*}
 */
let queryUserInfoNextServiceTime = function (userInfo)
{
    let last_order_update_time = userInfo.last_order_update_time;
    let cycle_service_type = userInfo.cycle_service_type;

    if(cycle_service_type > 0 &&  last_order_update_time > 0)
    {
        let lastUpdateDate = moment(last_order_update_time);
        lastUpdateDate.day(lastUpdateDate.day() + cycle_service_type);

        // 如果下次服务时间 在今天之后
        if(lastUpdateDate.isAfter(moment()))
        {
            userInfo.next_service_time = "下次上门日期:"+lastUpdateDate.format("YYYY-MM-DD 9:00 ~ 18:00");
        }

    }

    return userInfo;
};

/**
 * routes by userInfo 根据用户id 获取信息
 */
UserRouter.post('/userInfo', function(req, res)
{

    userDao.queryById(req.query["uid"]).then(res.responseResult).catch(res.responseError);

});


/**
 * routes by update user info
 */
UserRouter.post("/update",function (req,res)
{

    UserRouter.convertQuery(req.query)
              .then(userDao.checkAllowAdd)
              .then(userDao.updateById)
              .then(function () {
                  return userDao.queryById(req.query["uid"]);
              })
              .then(res.responseResult)
              .catch(res.responseError);;

});

/**
 * 将微信用户信息 转为收弃宝用户信息
 * @param wxUserInfo
 * @returns {{u_wx_openid: *, u_name: *, u_headimgurl: *}}
 */
UserRouter.convertWxUserInfo = function (wxUserInfo)
{
//     "openid":" OPENID",
//     " nickname": NICKNAME,
//     "sex":"1",
//     "province":"PROVINCE"
//     "city":"CITY",
//     "country":"COUNTRY",
//     "headimgurl":    "http://wx.qlogo.cn/mmopen/g3MonUZtNHkdmzicIlibx6iaFqAc56vxLSUfpb6n5WKSYVY0ChQKkiaJSgQ1dZuTOgvLLrhJbERQQ4eMsv84eavHiaiceqxibJxCfHe/46",
//     "privilege":[
//     "PRIVILEGE1"
//     "PRIVILEGE2"
// ],
//     "unionid": "o6_bmasdasdsad6_2sgVt7hMZOPfL"

    wxUserInfo = JSON.parse(wxUserInfo);

    var userInfo =
    {
        u_wx_openid: wxUserInfo['openid'],
        u_name : UserRouter.filterNickName(wxUserInfo['nickname']),
        u_headimgurl : wxUserInfo['headimgurl']
    };

    return userInfo;

};


/**
 * 过滤用户昵称 微信昵称里面会包含表情等特殊字符
 * @param name
 * @returns {XML|string|void}
 */
UserRouter.filterNickName = function(name)
{
    var ranges = [
        '\ud83c[\udf00-\udfff]',
        '\ud83d[\udc00-\ude4f]',
        '\ud83d[\ude80-\udeff]'
    ];

    return name.replace(new RegExp(ranges.join('|'), 'g'), '');

}
/**
 * convert req.query  to sql params
 * @param query  req.query
 * @returns {Promise}
 */
UserRouter.convertQuery = function (query)
{


    return new Promise(function (resolve)
    {

        var fieldsMap = {

                        "name":"u_name",
                        "wx_openId":"u_wx_openid",
                        "mobile":"u_mobile",
                        "address":"u_addr",
                        "rid":"r_id",
                        "rsid":"r_sid",
                        "uid":"u_id",
                        "u_role_type":"u_type",
                        "cycle_service_type":"cycle_service_type"
                     };
        var newQuery = {};

        for(var key in query) {

            if(!fieldsMap[key]){
                continue;
            }
            newQuery[fieldsMap[key]] = query[key];
        }

        resolve(newQuery);

    });

};

