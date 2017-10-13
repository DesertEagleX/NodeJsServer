/**
 * Created by sprint on 16/8/13.
 */
'use strict';
/**
 * Module dependencies.
 * @private
 */

/**
 * APIConfig prototype.
 */
var APIConfig = exports = module.exports = {};

APIConfig.isEnableVisitDate = function (dateTime) {

    var visit_time =  dateTime;
    var server_time = new Date().getTime();
    var  time = visit_time - server_time;

    // 服务时间在一小时后
    return (time >= 1000*60*60 );

}