/**
 * Created by sprint on 16/9/1.
 */
'use strict';

var DB = require('../../../db/db');

var SQL_TableName = "Tickets64";

// 下一条id
var SQL_NextID = "REPLACE INTO " + SQL_TableName + " (stub) VALUES ('a')";
var SQL_GetLastID = "SELECT  LAST_INSERT_ID() as id  FROM "+ SQL_TableName;

// 对外生成器
var IDGenerator = exports = module.exports = {};

/**
 * 生成下一个ID  必须使用通过connection
 * @returns {Promise}
 */
IDGenerator.nextID = function () {

    return new Promise(function (resolve, reject) {

        DB.connection().then(function (connection) {

                var query = connection.query(SQL_NextID,null,function (error,results) {

                            if (error)
                            {
                                connection.release();
                                reject();

                            }else{

                                connection.query(SQL_GetLastID,null,function (error,results) {

                                    if(error)
                                    {
                                        reject();

                                    }else{

                                        resolve(results[0]["id"]);
                                    }

                                    connection.release();
                                });
                            }

                        });

                    });


    });

}