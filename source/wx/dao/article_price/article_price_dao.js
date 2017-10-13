/**
 * Created by ligh on 2017/2/3.
 */
/**
 * Created by sprint on 16/9/17.
 * 废品价格表
 */
'use strict';
/**
 * Module dependencies.
 * @private
 */
const DB = require('../../../db/db');
const jsonResponse = require('../../../response/response');

// 废品表
const ArticleDao = require('../article/article_dao');

const ArtPrice_Enable = 1;

// 废品价格表
const SQL_TableName = "Art_Price";
// 返回给调用端的字典信息 过滤掉敏感字段
const SQL_QueryFields = "ap_id,art_id,ap_price,ap_unit,ap_price_cmt,ap_min_count,ap_enable";
// 查询所有启用的废品价格
const SQL_QueryEnableAll =  "SELECT "+ SQL_QueryFields +" FROM " + SQL_TableName + " WHERE ap_enable = " + ArtPrice_Enable;
// 根据用户级别查询所有启用的废品价格
const SQL_QueryEnableAllByUserType =  "SELECT "+ SQL_QueryFields +" FROM " + SQL_TableName + " WHERE ap_enable = " + ArtPrice_Enable +" AND u_type = ?";


/**
 * ArticlePriceDao prototype.
 */
const ArticlePriceDao = exports = module.exports = {};


/**
 * 根据用户类型查询废品价格
 */
ArticlePriceDao.queryByUserType = function (u_type)
{
    return DB.query(SQL_QueryEnableAllByUserType,u_type);
};


/**
 * 根据用户级别查询所有启用的废品价格
 * @returns {*|Promise.<TResult>}
 */
ArticlePriceDao.queryArticlesAndPriceByUserType = function (u_type)
{

    //根据用户角色查询所有价格信息
   return ArticlePriceDao.queryByUserType(u_type).then(function (articlePrices)
    {
        // 查询所有废品信息
        return ArticleDao.queryAllIfEnable().then(function (articles)
        {
            let articlesPriceDic = classifyArticlesPrice(articlePrices);


            for (let index  in articles)
            {
                let article = articles[index];
                article.prices = articlesPriceDic[article.art_id];
            }



            return articles;
        });

    });
};


/**
 *计算订单废品价格
 * @param u_type 用户类型
 * @param ordArticles {oa_id,o_id,art_id,art_count,art_price}
 * @returns {Promise}
 */
ArticlePriceDao.calculateArticlesPrice = function (u_type,ordArticles)
{
    return new Promise(function (resolve, reject)
    {

        ArticlePriceDao.queryByUserType(u_type).then(function (articlePrices)
        {

            for(let index in ordArticles)
            {
                // 当前计算的废品
                let ordArticle = ordArticles[index];
                // 单价
                let unitPrice  = 0;
             

                for(let index in articlePrices)
                {
                    let articlePrice = articlePrices[index];

                    if(articlePrice.art_id == ordArticle.art_id)
                    {

                        if(articlePrice.ap_price == 0) continue;

                        console.log("articlePrice ===" +JSON.stringify(articlePrice));


                        if (articlePrice.ap_price > unitPrice && ordArticle.art_count >= articlePrice.ap_min_count)
                        {
                            unitPrice = articlePrice.ap_price;

                            ordArticle.art_unit_price = unitPrice;
                            ordArticle.art_unit = articlePrice.ap_unit;
                        }

                       
                    }
                }

                if(unitPrice > 0)
                {
                    ordArticle.art_price = (ordArticle.art_count * unitPrice).toFixed(2);
                }

            }

            resolve(ordArticles);

        }).catch(reject);

    });

};


/**
 * 根据废品id 将价格分组
 * @param articlesPrices
 * @returns {{}}
 */
let classifyArticlesPrice = function (articlesPrices)
{

    let articlesPriceDic = {};

    for (let index  in articlesPrices)
    {
        let articlePrice = articlesPrices[index];
        if( ! articlesPriceDic[articlePrice.art_id] )
        {
            articlesPriceDic[articlePrice.art_id] = [articlePrice];

        }else
        {
            articlesPriceDic[articlePrice.art_id].push(articlePrice);
        }
    }

    return articlesPriceDic;
};