/**
 * Created by sprint on 16/8/13.
 */
'use strict';
/**
 * Module dependencies.
 *
 *  回收员Dao
 *
 * @private
 */
var md5 = require('js-md5');
var DB = require('../../../db/db');
var jsonResponse = require('../../../response/response');
// var orderDao = require('../order/em_order_dao');

// asc升序  desc降序
var PageCount = 10;
var SQL_TableName = "Em_Employment";
// 系统内部查询字段
var SQL_QueryFieldsOfSys = "em_id,em_name,em_mobile,em_role_type,em_pwd,em_nickname,r_id,push_registration_id,em_status_code,em_star_level";
// 外部查询字段
var SQL_QueryFields = "em_id,em_name,em_role_type,em_mobile,em_nickname,r_id,em_star_level,em_like";

// 查找等待指派订单的回收员 有任务在执行的回收员也会被查出来
var SQL_QueryStandbyEmployeesByRID = "SELECT "+ SQL_QueryFieldsOfSys +" FROM " + SQL_TableName + " WHERE r_id = ? AND em_status_code = 100 ORDER BY em_status_code ASC , em_star_level DESC ";
var SQL_QueryByEM_IDSyS = "SELECT "+ SQL_QueryFieldsOfSys +" FROM " + SQL_TableName + " WHERE em_id = ?";

var SQL_QueryByMobile_PWD = "SELECT "+ SQL_QueryFields +" FROM " + SQL_TableName + " WHERE em_mobile = ? AND em_pwd = ?";
var SQL_Insert = "INSERT INTO " +SQL_TableName + " SET ?";
var SQL_CountByMobile = "SELECT count(em_id) as count FROM "+ SQL_TableName +" WHERE em_mobile=?";
// 更新
var SQL_Update_EMID = "UPDATE "+ SQL_TableName+ " SET ? WHERE em_id = ?";

// 查询用户详情
var SQL_QueryUserInfo_EMID = "SELECT "+ SQL_QueryFields +" FROM " + SQL_TableName + " WHERE em_id = ?";


/**
 * EmployeeDao prototype.
 */
var EmployeeDao = exports = module.exports = {};

// 回收员状态
EmployeeDao.EmployeeStatus =
{

    // 空闲中
    EmployeeStatusIdle :
    {
        code:100,
        msg:"空闲中"
    },

    // 回收中
    EmployeeStatusRecycling :
    {
        code:101,
        msg:"回收中"
    },

};

/**
 * 回收员角色
 * @type {{}}
 */
EmployeeDao.RoleType =
{
    // 收弃宝官方回收员
    SQBRoleType:0,
    // 小区回收员
    XiaoQuRoleType: 1,
};

/**
 * 根据mobile 和 pwd 查询回收员信息
 * @param mobile
 * @param pwd
 */
EmployeeDao.signin = function (query)
{

    var mobile =  query["em_mobile"];
    var pwd =  md5(query["em_pwd"]);

    return DB.query(SQL_QueryByMobile_PWD,[mobile,pwd]).then(DB.resultsFirst);

};




/**
 * 认证用户
 * @param query {emid,token}
 */
EmployeeDao.authenticate = function (query)
{

    return new Promise(function (resolve, reject)
    {

        var emid = query["emid"];
        var token = query["token"];

        // 认证用户
        EmployeeDao.Sys_UserInfo(emid).then(function (emInfo)
        {

            var emToken =  md5( emInfo.em_mobile + emInfo.em_pwd );
            var reqToken = token;

            if(emToken == reqToken)
                resolve(query)
            else
                reject(query);

        }).catch(function () {

            reject(query);
        });

    });

};

/**
 *
 * @param query
 */
EmployeeDao.userInfo = function (query)
{
    var emId =  query["em_id"];

    return DB.query(SQL_QueryUserInfo_EMID,[emId]).then(DB.resultsFirst);

}

/**
 * 更新回收员信息
 * @param userInfo
 * @param emid 回收员id
 */
EmployeeDao.updateUserInfo = function (userInfo, emid)
{

    return DB.query(SQL_Update_EMID,[userInfo,emid]);

};


/**
 * 查询用户订单信息
 * @param uid
 */
EmployeeDao.userOrders = function (query)
{

   // return orderDao.queryByEMUID_Status_Page(query);

};


/**
 * 插入回收员信息
 * @param emInfo 回收员信息
 * @returns {Promise}
 */
var insertEMInfo = function (emInfo)
{
    //md5加密
    emInfo.em_pwd = md5(emInfo.em_pwd);

    return new Promise(function (resolve, reject) {

        DB.query(SQL_Insert,emInfo).then(function () {

            resolve(emInfo);

        }).catch(reject);

    });
}
/**
 * 添加emInfo
 * @param emInfo
 */
EmployeeDao.addUserInfo = function (emInfo)
{
    return EmployeeDao.Sys_CheckAllowAdd(emInfo).then(insertEMInfo);

};

/**
 * 根据uid查询回收员信息
 * @param emid
 */
EmployeeDao.Sys_UserInfo = function (emid)
{
    return DB.query(SQL_QueryByEM_IDSyS,emid).then(DB.resultsFirst);
}

/**
 * 查找待命的回收员 (可指派订单)
 * @param rid
 */
EmployeeDao.Sys_QueryStandbyEmployeeList = function (rid,resolve,reject)
{

    return DB.query(SQL_QueryStandbyEmployeesByRID,rid);

};

/**
 * 检查是否允许添加回收员信息 (主要是判断手机号码是否注册过)
 * @param emInfo
 * @constructor
 */
EmployeeDao.Sys_CheckAllowAdd = function (emInfo)
{

    return new Promise(function (resolve, reject) {

        DB.query(SQL_CountByMobile,emInfo.em_mobile).then(function (results) {

            if(results.length && results[0].count) {

                reject(jsonResponse.jsonError(jsonResponse.ResponseCode.parameterErrorCode,"手机号已注册"));

            }else{

                resolve(emInfo);
            }

        }).catch(function (error) {

            console.log("emInfo="+JSON.stringify(error));

            reject(error);

        });


    });

}