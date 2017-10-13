/**
 * Created by ligh on 2016/11/19.
 */
'use strict';

/**
 * WXSDKConfig prototype.
 */
const WXSDKConfig = exports = module.exports = {};

// appid 需要填写你自己的 AppId
WXSDKConfig.AppId = "";
// secret 需要填写你自己的 AppSecret
WXSDKConfig.AppSecret = "";
//
WXSDKConfig.Grant_Type = "authorization_code";


// 地址
WXSDKConfig.URL =
{

    // OAuth access_token 获取地址
    OAuth2AccessToken_URL: "https://api.weixin.qq.com/sns/oauth2/access_token?",

    // 用户信息
    WXUserInfo_URL: "https://api.weixin.qq.com/sns/userinfo?",

    // 获取用户token
    APIAccessToken_URL:"https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid="+WXSDKConfig.AppId+"&secret="+WXSDKConfig.AppSecret,

    // 发送模板消息
    SendTemplateMessage_URL:"https://api.weixin.qq.com/cgi-bin/message/template/send?"

};

