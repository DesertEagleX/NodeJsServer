/**
 * Created by sprint on 16/8/13.
 */
'use strict';
/**
 * Module dependencies.
 * @private
 */
const DB = require('../../../db/db');
const jsonResponse = require('../../../response/response')
const idGenerator = require("../id_generator/id-generator");

const SQL_TableName = "U_User";

// 返回给调用端的字典信息 过滤掉敏感字段
const SQL_QueryFields = "u_id,u_name,u_mobile,u_addr,r_id,r_sid,u_wx_openid,u_headimgurl,cycle_service_type,last_order_update_time,u_type";
// 插入用户信息
const SQL_Insert = "INSERT INTO " +SQL_TableName + " SET ?";
// 根据手机号统计用户数量 主要是查询手机号是否存在
const SQL_CountByMobileExcludeUID = "SELECT count(u_id) as count FROM "+ SQL_TableName +" WHERE u_mobile=? AND u_id != ?";
// 根据用户id查询是否存在用户
const SQL_CountByUID = "SELECT count(u_id) as count FROM "+ SQL_TableName +" WHERE u_id=?";
const SQL_CountByOpenID = "SELECT count(u_id) as count FROM "+ SQL_TableName +" WHERE u_wx_openid=?";

const SQL_QueryAll = "SELECT "+SQL_QueryFields+" FROM "+SQL_TableName ;

// 查询设置周期服务的用户
const SQL_QuerySettingCycleServiceUserList = SQL_QueryAll +" WHERE cycle_service_type > 0 AND last_order_update_time IS NOT NULL";

// 根据u_id查询用户信息
const SQL_QueryByID = "SELECT "+ SQL_QueryFields +" FROM "+ SQL_TableName +" WHERE u_id=? LIMIT 1";
// 根据open_id查找 用户信息
const SQL_QueryByOpenID = "SELECT "+ SQL_QueryFields +" FROM "+ SQL_TableName +" WHERE u_wx_openid=? LIMIT 1";
// 根据r_id 查找回收员
const SQL_QueryByRID = "SELECT "+ SQL_QueryFields +" FROM "+ SQL_TableName +" WHERE r_id=?";
// 根据u_id查询用户openId
const SQL_QueryOpenIDByID = "SELECT u_wx_openid FROM "+ SQL_TableName +" WHERE u_id=?";
// 根据u_name 和 u_pwd查询用户名称
const SQL_QueryByNamePwd = "SELECT "+SQL_QueryFields+" FROM "+ SQL_TableName +" WHERE u_mobile=? AND u_pwd =? LIMIT 1";
// 根据u_id更新用户信息
const SQL_UpdateByID = "UPDATE "+SQL_TableName+" SET ? WHERE u_id = ?";

/**
 * UserDao prototype.
 */
const UserDao = exports = module.exports = {};



// 常量
UserDao.Const =
{
    // 用户角色类型
    UserRoleType:
    {
        // 家庭用户
        GeneralUserRoleType : 100,
        // 商家超市
        SupermarketRoleType : 200
    },

    // 周期服务器类型
    CycleService:
    {
        // 周期服务订单-每天一次
        CycleServiceOneDayType : 1,
        // 两天一次
        CycleServiceTwoDayType : 2,
        // 三天一次
        CycleServiceThreeDayType : 3,
        // 每周一次
        CycleServiceeeklyType : 7
    },



};

/**
 * 插入数据库 内部方法 不会做数据验证
 * @param userInfo
 * @returns {Promise}
 */
var insertUser = function (userInfo) {

    // 填充用户注册日期
    userInfo.r_date = new Date().getTime();

    return DB.query(SQL_Insert,userInfo).then(function () {

                return userInfo;

    });

};

/**
 * 添加用户信息 会做数据验证
 * @param userInfo 用户信息
 * @returns {Promise}
 */
UserDao.addWXUser = function (userInfo) {

    return UserDao.queryByOpenID(userInfo).catch(function () {

        return  insertUser(userInfo);

    });

};

/**
 * 查询所有用户
 */
UserDao.queryAllUser = function ()
{
    return DB.query(SQL_QueryAll);
};

/**
 * 查询所有设置了周期服务的用户
 */
UserDao.querySettingCycleServiceUserList = function ()
{
    return DB.query(SQL_QuerySettingCycleServiceUserList);
};

/**
 * 根据id查找用户
 * @param uid
 */
UserDao.queryById = function (uid) {


    return new Promise(function (resolve, reject) {

        DB.query(SQL_QueryByID,uid).then(function (results) {

            if(results.length) {

                resolve(results[0]);

            } else {

                reject(jsonResponse.jsonError(jsonResponse.ResponseCode.parameterErrorCode,"用户id不存在"));
            }

        }).then(DB.resultsFirst).catch(reject);

    });
};

//==================== 微信相关 =========================//
/**
 * 根据微信 openid 获取用户信息
 * @param query [u_wx_openid]
 */
UserDao.queryByOpenID = function (query) {


    const  openId = query["u_wx_openid"];

    return DB.query(SQL_QueryByOpenID,openId).then(DB.resultsFirst);
}


/**
 * 根据r_id查找用户
 * @param r_id
 */
UserDao.queryByRId = function (rid) {

    return new Promise(function (resolve, reject) {

        DB.query(SQL_QueryByRID,rid).then(function (results) {

            if(results) {

                resolve(results);

            } else {

                reject(jsonResponse.jsonError(jsonResponse.ResponseCode.parameterErrorCode,"用户id不存在"));
            }

        }).then(DB.resultsFirst).catch(reject);

    });

};

/**
 * 根据用户id查询openId
 * @param uid 用户id
 * @returns {Promise}
 */
UserDao.queryOpenIdById = function (uid)
{
    return new Promise(function (resolve, reject) {

        DB.query(SQL_QueryOpenIDByID,uid).then(function (results) {

            if(results.length) {

                resolve(results[0]);

            } else {

                reject(jsonResponse.jsonError(jsonResponse.ResponseCode.parameterErrorCode,"用户id不存在"));
            }

        }).then(DB.resultsFirst).catch(reject);

    });
};

/***
 * 更新用户信息
 * @param userInfo
 */
UserDao.updateById = function (userInfo) {

    var uid = userInfo.u_id;
    delete userInfo.u_id;
    delete userInfo.u_pwd; // 禁止更新密码

    /**
     * remove key if value null
     */
    for(var key in userInfo) {

        if(!userInfo[key]) {

            delete userInfo[key];
        }
    }

    return new Promise(function (resolve, reject) {

         DB.query(SQL_UpdateByID,[userInfo,uid]).then(function (results) {

             resolve();

         }).catch(function () {

             reject(jsonResponse.jsonError(jsonResponse.ResponseCode.sysErrorCode,"服务器异常"));

         });

    });

};

/**
 * 统计数量
 * @param mobile
 */
UserDao.countByMobileExcludeUID = function (mobile,uid) {

    return new Promise(function (resolve, reject) {

        DB.query(SQL_CountByMobileExcludeUID,[mobile,uid]).then(function (result) {


            resolve(result[0].count);


        }).catch(function (error) {

            reject(error);

        });


    });

};




/**
 * 断言openid 不存在
 * @param query [openid]
 */
UserDao.assertWXUserInfoNotExist = function (query) {


    const openId = query['u_wx_openid'];


    return new Promise(function (resolve, reject) {

        DB.query(SQL_CountByOpenID,[openId]).then(function (results) {

            if(results.length && results[0].count == 0)
            {
                resolve(query);

            }else{

                reject(query);
            }

        }).catch(function (error) {

            reject(jsonResponse.jsonError(jsonResponse.ResponseCode.sysErrorCode,"服务器异常"));

        });

    });

};


/**
 * 检查用是否存
 * @param uid 用户id 如果用户存在会将uid返回给调用者 否则返回信息
 */
UserDao.checkUserxistByUID = function (uid) {

    return new Promise(function (resolve, reject) {

        DB.query(SQL_CountByUID,uid).then(function (results) {

           if(results.length && results[0].count)
           {
               resolve(uid);

           }else{
               reject(jsonResponse.jsonError(jsonResponse.ResponseCode.parameterErrorCode,"用户不存在"));
           }

        }).catch(function (error) {

            reject(jsonResponse.jsonError(jsonResponse.ResponseCode.sysErrorCode,"服务器异常"));

        });


    });

};

/**
 * 判断是否允许插入该用户
 * @param userInfo
 */
UserDao.checkAllowAdd = function (userInfo) {

    return new Promise(function (resolve, reject) {

        UserDao.countByMobileExcludeUID(userInfo["u_mobile"],userInfo["u_id"]).then(function (count) {

            if(count == 0) {

                resolve(userInfo);

            }else{

                reject(jsonResponse.jsonError(jsonResponse.ResponseCode.parameterErrorCode,"手机号已存在"));
            }

        }).catch(function (error) {

            reject(jsonResponse.jsonError(jsonResponse.ResponseCode.sysErrorCode,"服务器异常"));
        })

    });

}
