/**
 * Created by sprint on 16/8/13.
 */
'use strict';

/** 引入 mysql 模块 */
const mysql = require('mysql');

/** mysql 配置信息 **/
const config = require('./config/db-config');

/** Promise **/
const promise = require('promise');

/** 事务队列 **/
const queues = require('mysql-queues');

/** 使用连接池，提升性能 **/
const pool = mysql.createPool( config.mysql );

const jsonResponse = require('../response/response');

const DEBUG = true;


/**
 * DB prototype.
 */
const DB = exports = module.exports = {};

/**
 * 是否开启事务 默认为false 如果开启事务 需要手动调用transManger 执行事务
 * @type {boolean}
 */
var openTransactionFlag = false;


/**
 * 事务管理者
 *
 * 事例:
 * DB.startTransaction().then(function (transManger)
 {

     transManger.query(SQL_InsertOrder,Order);
     // transManger.query(SQL_InsertOrder,Order);
     // DB.query()..

     transManger.executeTransaction(function (error) {

         if(error)
         {
             reject(error);
         }else {
             resolve();
         }
     });

 });
 *
 */
DB.TransactionMangaer = new (function () {

    var that = this;
    var emptyFun = function () {};

    /**
     * 查询队列的总数量
     * @type {number}
     */
    that.queryQueuseTotalCount = 0;

    /**
     * 当前执行的查询队列位置
     * @type {number}
     */
    that.queryQueuesCurrentIndex = 0;

    /**
     *
     * @type {emptyFun}
     */
    that.commitCallback = emptyFun;

    /**
     * 事务  通过connection.startTransaction()获得
     */
    that.transaction;

    /**
     * mysql链接 通过DB.connection()获得
     */
    that.connection;

    /**
     * 开启事务
     * @returns {Promise}
     */
    that.startTransaction = function () {

         // clear to zero
        that.queryQueuseTotalCount = 0;
        that.queryQueuesCurrentIndex = 0;

        return new Promise(function (resolve, reject) {

            // 如果已经开启了事务 则不需要再次开启
            if(that.transaction && that.connection)
            {
                resolve(that);

            }
            else
            {
                //获取事务
                DB
                    .connection()
                    .then(function (connection) {

                         queues(connection,DEBUG);

                        //启动事务
                        var transaction = connection.startTransaction();

                        that.transaction = transaction;
                        that.connection = connection;

                        resolve(that);

                 })
                    .catch(reject);

            }

        });

    };


    /**
     * 回滚事务
     */
    that.rollbackTransaction = function () {

        if(that.transaction)
        {
            that.transaction.rollback();
        }

        return that.release();

    };

    /**
     * 释放
     * @returns {Promise}
     */
    that.release = function () {

        return new Promise(function (resolve, reject) {

            /**
             * 释放conneciton将开启事务标记关闭
             * @type {boolean}
             */
            openTransactionFlag = false;

            that.transaction = null;
            that.queryQueuesCurrentIndex = 0;
            that.queryQueuseTotalCount = 0;

            if(that.connection)
            {
                that.connection.release();
            }

            resolve();
        });

    };

    /**
     * 执行事务 addQuery的所有SQL都会被执行
     *
     * @param callback 执行完成后回调
     */
    that.executeTransaction = function (callback) {

        that.commitCallback = callback || emptyFun;
        openTransactionFlag = false;

        if(that.transaction)
        {
            that.transaction.execute();
        }
    }

    /**
     * 事务查询
     */
    that.query = function (sql,params) {


        that.queryQueuseTotalCount += 1;

        return new Promise(function (resolve, reject) {


            if(!that.transaction)
            {
                reject();
                return;
            }


            that.transaction.query(sql,params,function (error,results)
            {

                that.queryQueuesCurrentIndex =   that.queryQueuesCurrentIndex + 1;

                if(error)
                    {
                        that.error = error;
                        that.commitCallback(error);

                        /** 回滚事务 **/
                        that.rollbackTransaction();
                        reject(error);


                    }else
                    {
                        /** 如果当前是最后一个query **/
                       if(that.queryQueuesCurrentIndex == that.queryQueuseTotalCount)
                       {
                            that.commitCallback();

                            that.release();
                       }

                        resolve(results);
                    }

            });


        });

    };
});


/**
 * 启动事务
 * @returns {Promise}
 */
DB.startTransaction = function () {

    openTransactionFlag = true;

    return DB.TransactionMangaer.startTransaction();

};

/**
 * 立即执行SQL语句
 * @param sql SQL语句
 * @param params SQL参数
 * @returns {Promise}
 */
DB.excueteQuery = function (sql,params) {

    return new Promise(function (resolve, reject) {

        DB.connection().then(function (connection) {

            var query = connection.query({sql:sql,timeout:10000},params,function (error,results) {

                //必须释放连接
                connection.release();

                if (error) {

                    console.log("myql connection error="+JSON.stringify(error));
                    reject(jsonResponse.jsonError(jsonResponse.ResponseCode.sysErrorCode,JSON.stringify(error)));

                } else {

                    // console.log("syncExcueteQuery="+JSON.stringify(results));
                    resolve(results);
                }

            });

        }).catch(reject);

    });
};


/**
 * 立即执行SQL语句
 * @param sql SQL语句
 * @param params SQL参数
 * @returns {Promise}
 */
DB.syncExcueteQuery = function (sql,params,resolve,reject)
{


        DB.connection().then(function (connection) {

            var query = connection.query({sql:sql,timeout:10000},params,function (error,results) {

                //必须释放连接
                connection.release();

                if (error) {

                    console.log("myql connection error="+JSON.stringify(error));
                    reject(jsonResponse.jsonError(jsonResponse.ResponseCode.sysErrorCode,JSON.stringify(error)));

                } else {

                    resolve(results);
                }

            });

        }).catch(reject);


};
/**
 *
 *  @param sql 执行的SQL语句
 * @param params 执行SQL的参数
 * @param openTransaction 是否开启事务 默认为false不开启
 */
DB.query = function (sql,params)
{

    // 如果需要开启事务不会立即执行 而是是把query 放到 TransactionMangaer 中
        if(openTransactionFlag)
        {
            return DB.TransactionMangaer.query(sql,params);

        }else
        {
            return DB.excueteQuery(sql,params);
        }

};


DB.syncQuery = function (sql,params,resolve,reject)
{
    DB.syncExcueteQuery(sql,params,resolve,reject);
};

/**
 * 拿到results 统计的数量 不是length
 * @param results
 * @returns {Promise}
 */
DB.resultsCount = function (results) {

    return new Promise(function (resolve, reject) {

        if(results.length)
        {
            resolve(results[0].count);

        }else{

            resolve(0);
        }
    });
};

/**
 * 从results中提取第一个元素
 * @param results
 */
DB.resultsFirst = function (results) {

    return new Promise(function (resolve, reject) {

        if(results.length)
        {
            resolve(results[0]);

        }else{

            reject(jsonResponse.jsonError(jsonResponse.ResponseCode.parameterErrorCode,"查询的信息不存在"));
        }
    });

};


/**
 * create db conneciton
 * @returns {Promise}
 */
DB.connection = function () {


    return new Promise(function (resolve, reject) {

        pool.getConnection(function(err, connection) {

            //如果有错误
            if(connection){

                resolve(connection);

            }else{
                console.log("getConnection error :"+JSON.stringify(err));
                // connection.release();
                reject(err);
            }
        });

    });
};


console.log("db runging......");

