/**
 * Created by sprint on 16/9/17.
 * 废品表
 * 废弃宝支持的废品类型
 */
'use strict';
/**
 * Module dependencies.
 * @private
 */
const DB = require('../../../db/db');
const jsonResponse = require('../../../response/response');

const Art_Enable = 1;

// 回收的废品表
const SQL_TableName = "Art_Article";

// 返回给调用端的字典信息 过滤掉敏感字段
const SQL_QueryFields = "art_id,art_cid,art_name,art_img_name,art_unit,art_quoted";
// 查询废品所有启用废品列表
const SQL_QueryEnableAll =  "SELECT "+ SQL_QueryFields +" FROM " + SQL_TableName + " WHERE art_enable = " + Art_Enable +" AND art_cid IS NOT NULL";

// 根据ids 查询废品
const SQL_QueryArticlesByIs =  "SELECT "+ SQL_QueryFields +" FROM " + SQL_TableName + " WHERE art_id in (?) ";
// 添加废品信息
const SQL_InsertArticle = "INSERT INTO " +SQL_TableName + " SET ?";

/**
 * ArticleDao prototype.
 */
const ArticleDao = exports = module.exports = {};

/**
 * 查询所有启用的废品
 */
ArticleDao.queryAllIfEnable = function () {

    return DB.query(SQL_QueryEnableAll);

};

/**
 * 查询所有启用的废品
 */
ArticleDao.queryByIds = function (ids) {

    return DB.query(SQL_QueryArticlesByIs,ids);

};

/**
 * 添加订单废品信息
 * @param articles 废品信息
 */
ArticleDao.addArticles = function (articles) {

    for (var article in articles)
    {
        return DB.query(SQL_InsertArticle,article);
    }
    
};

/**
 * 将db results 转为map
 * @param results
 */
ArticleDao.flatResults = function (results) {

    return new Promise(function (resolve, reject) {

        // 将results铺平
        var articleMap = {};

        // 将区域放入字典中
        for(var i=0; i< results.length ; i++) {
            var article = results[i];
            articleMap[article.art_id] = article;
        };

        resolve(articleMap);
    });


};


/**
 * flat articleMap
 * @param articleMap
 */
ArticleDao.flatMap = function (articleMap) {


    return new Promise(function (resolve, reject) {

        // 返回的结果数组 整理好了层级结构
        var articleArray = new Array();

        /**
         * 遍历regionMap
         */
        for(var art_id in articleMap) {

            var article = articleMap[art_id];
            var cid = article.art_cid;


            // 如果该废品有父级分类
            if(cid) {

                var supArticle = articleMap[cid];

                if( !supArticle.subArticles ) {

                    supArticle.subArticles = [];
                }

                supArticle.subArticles.push(article);

                console.log("articleMap=="+JSON.stringify(supArticle));


            }else{

                articleArray.push(article);
            }
        }

        resolve(articleArray);

    });

}