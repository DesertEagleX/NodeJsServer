/**
 * Created by ligh on 2016/11/5.
 */

/**
 * 发射器数据
 * @type {{}}
 */
var EmitterData = exports = module.exports = function (eventType,targetID,data,result)
{

    /**
     * 目标id
     */
    this.targetID = targetID;

    /**
     * 发送的数据
     */
    this.data =  data;

    /**
     * 事件类型
     */
    this.eventType = eventType;


    this.code = result || 200;




};