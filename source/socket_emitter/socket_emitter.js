/**
 * Created by ligh on 2016/11/2.
 */

var socket = require('socket.io');
var emDao = require("../em/dao/user/em-dao");
var EmitterData = require("./socket_emitter_data");


/**
 * 保存链接的用户
 * @type {{}}
 */
var clients = {};

/**
 * 发射器
 * @type {{}}
 */
var Emitter = exports = module.exports = {};

/**
 * 事件类型
 * @type {{}}
 */
var EmitterEventType =
{
    EVENT_CONNECT : "connect",
    EVENT_CONNECT_ERROR  : "connect_error",
    EVENT_CONNECTING  : "connecting",
    EVENT_DISCONNECT  : "disconnect",
    EVENT_AUTHENTICATE : "authenticate",
    EVENT_ORDER : "new_order"

};


/**
 * 根据server初始化发射器
 * @param server
 */
Emitter.init = function (server)
{

    Emitter.io = socket(server);
    Emitter.nsp = Emitter.io.of('/recycle_server');

    /**
     * 初始化默认事件
     */
    initDefaultEvents();

};

/**
 * 发送数据
 */
Emitter.emit = function (emitterData)
{

    var client = getClient(emitterData.targetID);

    if(client)
    {
        client.emit(emitterData.eventType,JSON.stringify(emitterData));
        return true;
    }

    return false;

};


/**
 * 保存链接的用户
 */
var saveClient = function (targetId,socket)
{

    socket.id = targetId;

     clients[targetId] = socket;

    console.log("user connected=="+targetId);

};

/**
 * 删除客户端
 * @param targetId
 */
var removeClient = function (targetId)
{
    delete clients[targetId];

    console.log("user disconnect =="+targetId);
};

/**
 * 根据id获取指定的client
 * @param targetId
 */
var getClient = function (targetId)
{
    return clients[targetId];
};


/**
 * 初始化默认事件
 */
var initDefaultEvents = function ()
{

    // 监听用户链接
    Emitter.nsp.on(EmitterEventType.EVENT_CONNECT, function(socket)
    {

        /**
         * 监听发起认证
         */
        socket.on(EmitterEventType.EVENT_AUTHENTICATE, function(data)
        {
            var query = JSON.parse(data);

            emDao.authenticate(query).then(function ()
            {

                saveClient(query["emid"],socket);

                Emitter.emit(new EmitterData(EmitterEventType.EVENT_AUTHENTICATE,query["emid"],query));

            }).catch(function (query)
            {
                socket.emit(EmitterEventType.EVENT_AUTHENTICATE,query);

            });

        });

        /**
         * 掉线
         */
        socket.on(EmitterEventType.EVENT_DISCONNECT,function ()
        {
                removeClient(socket.id);

        });

    });

};