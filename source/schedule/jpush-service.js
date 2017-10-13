/**
 * Created by sprint on 16/8/27.
 */


var JPush = require("jpush-sdk");
var client = JPush.buildClient('631e7dc839ed604f0b56e70b', 'e5552fb533de7501648f3ce0');

/**
 * PushService 推送服务
 *
 */
var JPushService = exports = module.exports = {};


/**
 * 向Android平台发起推送
 * @param msg 推送的消息
 */
JPushService.pushMessage = function (msg)
{

    return new Promise(function (resolve, reject) {

            client.push().setPlatform(JPush.ALL)
                .setAudience(JPush.registration_id( msg.targetID))
                .setNotification('新订单')
                .setMessage(JSON.stringify(msg))
                .send(function(err, res) {

                    if (err)
                    {
                        reject(msg);

                    } else {

                        resolve(msg);
                    }

                });
    });

};
