/**
 * Created by sprint on 16/8/27.
 */
'use strict';

const moment = require('moment');
const pushService = require('./jpush-service');
const orderTaskService = require('./order-task-service');

// 定时器 一分钟执行一次
const schedule = require('node-schedule');

const channelScanningNewOrder = "scanningNewOrder";
const channelScanningBookOrder = "scanningBookOrder";

//服务周期
const channelCycleService = "scanningCycleServiceOrder";


// 定时任务
const redis = require("redis");

const subscriberClient = redis.createClient();
subscriberClient.psubscribe("__keyevent@0__:expired");
subscriberClient.on("pmessage", function (pattern, channel, expiredKey) {


    // 扫描新订单任务
    if(expiredKey == channelScanningNewOrder)
    {

        let date = moment().local();
        let nextExpiredMillisecond = date.millisecond() + (1000 * 60) ;

        orderTaskService.scanningNewOrder();
        schedQueueClient.set(channelScanningNewOrder, "", "PX", nextExpiredMillisecond);

    } else if(expiredKey == channelScanningBookOrder)
    {
        let date = moment().local();
        let nextExpiredMillisecond = date.millisecond() + (1000 * 60) ;

        orderTaskService.scanningBookOrder();
        schedQueueClient.set(channelScanningBookOrder, "", "PX", nextExpiredMillisecond);

    }else if(expiredKey == channelCycleService)// 每天扫描一次
    {
        let nextFireMillisecond = nextFireCycleServiceTime();
        orderTaskService.scanningCycleService();
        schedQueueClient.set(channelCycleService, "", "PX", nextFireMillisecond);
    }

});

// 创建一个用于存放调度的队列的client
const  schedQueueClient = redis.createClient();

/**
 * TaskService 任务服务
 * 在后台任务扫描服务 目前有:新订单扫描
 */
const TaskService = exports = module.exports = {};

/**
 * 启动服务
 */
TaskService.startService = function ()
{

    startScanningNewOrderSchedule();
    startScanningClockOrderSchedule();

    startCycleServiceTimeSchedule();
}

/**
 * 停止服务
 */
TaskService.stopService = function () {

    subscriberClient.quit();

}


/**
 * 启动扫描新订单任务 扫描频率:30秒一次
 */
const startScanningNewOrderSchedule = function () {

    // 立即启动扫描
    schedQueueClient.set(channelScanningNewOrder, "", "PX", 100, redis.print);

    console.log("startScanningNewOrderSchedule runing....")
}


/**
 * 启动扫描预约订单 提醒任务  扫描频率:每小时的30分启动
 */
const startScanningClockOrderSchedule = function () {

    // 立即启动扫描
    schedQueueClient.set(channelScanningBookOrder, "", "PX", 100, redis.print);
    console.log("ScanningClockOrderSchedule runing....");

}


/**
 * 下一个周期任务触发时间
 */
const nextFireCycleServiceTime = function ()
{
    let today = moment().local();
    let tomorrow = moment().local();
    tomorrow.day(today.day() + 1);
    tomorrow.hour(7);
    tomorrow.minute(0);
    tomorrow.second(0);

    let fireMillisecond = tomorrow.diff(today);

    return fireMillisecond;

    // return 100;
};

/**
 * 启动周期下单任务
 */
const startCycleServiceTimeSchedule = function ()
{

    let nextFireMillisecond = nextFireCycleServiceTime();

    schedQueueClient.set(channelCycleService, "", "PX", nextFireMillisecond , redis.print);
    console.log("channelCycleService runing...."+nextFireMillisecond);
}