/**
 * Created by sprint on 16/8/20.
 */
'use strict';
/**
 * Module dependencies.
 * @private
 */
var DB = require('../../../db/db');
var jsonResponse = require('../../../response/response')

//区域表
var SQL_TableName = "Addr_Region";
// 返回给调用端的字典信息 过滤掉敏感字段
var SQL_QueryFields = "id,r_id,r_name,r_coord_lat,r_coord_lng";
// 根据 r_id 查询区域详情
var SQL_QueryByID = "SELECT "+SQL_QueryFields+" FROM "+SQL_TableName+" WHERE r_id = ?";
var SQL_QuerySubRegionsByID = "SELECT "+SQL_QueryFields+" FROM "+SQL_TableName+" WHERE r_id = ?";
var SQL_CountByID = "SELECT count(id) as count FROM "+SQL_TableName+" WHERE id = ?";
// var SQL_QueryCountSubRegionsByID = "SELECT count(r_pid) as count FROM "+SQL_TableName+" WHERE r_id = ?";
var SQL_QueryAll = "SELECT "+SQL_QueryFields+" FROM "+SQL_TableName;
var SQL_QueryAllSubRegions = "SELECT "+SQL_QueryFields+" FROM "+SQL_TableName +" WHERE r_id IS NOT NULL";

/**
 * RegionDao prototype.
 */
var RegionDao = exports = module.exports = {};

/**
 * 根据区域id 查询区域信息
 * @param rid
 */
RegionDao.queryById = function (rid) {
    return DB.query(SQL_QueryByID,rid).then(DB.resultsFirst);
};

/**
 * 检查是否存在 r_id == rid 的区域
 * @param rid
 */
RegionDao.checkExistRegionByID = function (rid) {

    return new Promise(function (resolve, reject) {

        DB.query(SQL_CountByID,rid).then(DB.resultsCount).then(function (count) {

            if(count)
                {
                    resolve(rid);

                }else {

                    reject(jsonResponse.jsonError(jsonResponse.ResponseCode.parameterErrorCode,rid+" 片区不存在"));
                }

        }).catch(reject);
    });


};

/**
 * 查询区域的子区域
 * @param rid
 */
RegionDao.findSubRegionsById = function (rid) {

    return DB.query(SQL_QuerySubRegionsByID,rid);

};

/**
 * 查询区域子集数量
 * @param rid
 */
RegionDao.countSubRegionsById = function (rid) {

    return DB.query(SQL_QueryCountSubRegionsByID,rid).then(DB.resultsCount);
};


/**
 * 查询所有区域信息
 */
RegionDao.queryAll = function () {

    return DB.query(SQL_QueryAll);
    //.then(RegionDao.flatResults).then(RegionDao.flatMap);
};

/**
 * 查询片区下的所有区域
 */
RegionDao.queryAllSubRegions = function ()
{
    return DB.query(SQL_QueryAllSubRegions);
};

/**
 * 将region results 转为map
 */
RegionDao.flatResults = function (results) {

    return new Promise(function (resolve, reject) {

        // 将results铺平
        var regionMap = {};

        // 将区域放入字典中
        for(var i=0; i< results.length ; i++) {
            var region = results[i];
            regionMap[region.r_id] = region;
        };

        resolve(regionMap);
    });

};

/**
 * flat regionMap
 * @param regionMap
 */
RegionDao.flatMap = function (regionMap) {

    return new Promise(function (resolve, reject) {

        // 返回的结果数组 整理好了层级结构
        var resultArray = new Array();

        /**
         * 遍历regionMap
         */
        for(var rid in regionMap) {

            var region = regionMap[rid];
            var pid = region.r_pid;

            // 如果该区域有父级
            if(pid) {

                var supRegion = regionMap[pid];

                if( !supRegion.subRegions ) {

                    supRegion.subRegions = [];
                }

                supRegion.subRegions.push(region);

            }else{

                resultArray.push(region);
            }
        }

        resolve(resultArray);

    });

}