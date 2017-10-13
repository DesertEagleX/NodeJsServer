/*
Navicat MySQL Data Transfer

Source Server         : AiRecycle
Source Server Version : 50714
Source Host           : localhost:3306
Source Database       : db_recycle

Target Server Type    : MYSQL
Target Server Version : 50714
File Encoding         : 65001

Date: 2017-10-13 16:32:34
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `addr_region`
-- ----------------------------
DROP TABLE IF EXISTS `addr_region`;
CREATE TABLE `addr_region` (
  `id` bigint(3) NOT NULL AUTO_INCREMENT,
  `r_name` varchar(45) NOT NULL COMMENT '区域名称',
  `r_id` bigint(3) unsigned DEFAULT NULL COMMENT '区域id',
  `r_coord_lat` double(10,6) DEFAULT NULL,
  `r_coord_lng` double(10,6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of addr_region
-- ----------------------------


-- ----------------------------
-- Table structure for `art_article`
-- ----------------------------
DROP TABLE IF EXISTS `art_article`;
CREATE TABLE `art_article` (
  `art_id` int(3) NOT NULL COMMENT '废品id',
  `art_cid` int(3) DEFAULT NULL COMMENT '物品所属分类id',
  `art_quoted` int(11) NOT NULL DEFAULT '0' COMMENT '是否需要回收员报价',
  `art_name` varchar(20) NOT NULL COMMENT '分类/废品名称',
  `art_enable` int(1) NOT NULL DEFAULT '0' COMMENT '废品是否被禁用\n1 启用\n1 禁用\n\n\n',
  `art_img_name` varchar(50) DEFAULT NULL COMMENT '废品图标名称',
  `art_unit` varchar(45) NOT NULL DEFAULT '公斤' COMMENT '单位： 公斤/升/个',
  PRIMARY KEY (`art_id`),
  UNIQUE KEY `art_id_UNIQUE` (`art_id`),
  UNIQUE KEY `name_UNIQUE` (`art_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of art_article
-- ----------------------------
INSERT INTO `art_article` VALUES ('6', '2', '0', '超市纸板', '1', '006-package_ea04549.png', '公斤');
INSERT INTO `art_article` VALUES ('7', '2', '0', '黄纸板', '1', '006-package_ea04549.png', '公斤');
INSERT INTO `art_article` VALUES ('8', '2', '0', '花纸板', '1', '006-package_ea04549.png', '公斤');
INSERT INTO `art_article` VALUES ('9', '1', '0', '塑料瓶', '1', '001-alcoholic-drinks_71472bc.png', '公斤');
INSERT INTO `art_article` VALUES ('10', '2', '0', '书籍', '0', '003-package_ea04549.png', '公斤');
INSERT INTO `art_article` VALUES ('11', '1', '0', '水果框(生胶)', '1', '001-shopping-basket_b950e89.png', '公斤');
INSERT INTO `art_article` VALUES ('12', '4', '1', '冰箱', '1', '003-refrigerator_91d2ebe.png', '个');
INSERT INTO `art_article` VALUES ('13', '4', '1', '电视', '1', '009-technology_b8b870c.png', '个');
INSERT INTO `art_article` VALUES ('14', '4', '1', '洗衣机', '1', '009-washing_61966ae.png', '个');
INSERT INTO `art_article` VALUES ('15', '4', '1', '冰柜 ', '1', '005-minibar_76c4aa1.png', '个');
INSERT INTO `art_article` VALUES ('16', '4', '1', '电动车', '1', '001-bicycle_f228d9a.png', '个');
INSERT INTO `art_article` VALUES ('17', '5', '1', '手机', '1', '001-technology-1_b0a935b.png', '个');
INSERT INTO `art_article` VALUES ('18', '5', '1', '电脑', '1', '003-computer_e5f0d65.png', '个');

-- ----------------------------
-- Table structure for `art_category`
-- ----------------------------
DROP TABLE IF EXISTS `art_category`;
CREATE TABLE `art_category` (
  `c_id` int(11) NOT NULL,
  `c_name` varchar(20) NOT NULL COMMENT '分类名称',
  `c_enable` int(1) NOT NULL DEFAULT '0' COMMENT '分类是否 禁用 ( 1禁用 0启用 默认0)\n\n',
  `c_img_name` varchar(45) DEFAULT NULL COMMENT '分类图标名称（不带具体路径）',
  PRIMARY KEY (`c_id`),
  UNIQUE KEY `art_id_UNIQUE` (`c_id`),
  UNIQUE KEY `name_UNIQUE` (`c_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of art_category
-- ----------------------------
INSERT INTO `art_category` VALUES ('1', '塑料类', '1', '001-alcoholic-drinks_71472bc.png');
INSERT INTO `art_category` VALUES ('2', '纸箱类', '1', '003-package_ea04549.png');
INSERT INTO `art_category` VALUES ('3', '水果筐', '1', '001-shopping-basket_b950e89.png');
INSERT INTO `art_category` VALUES ('4', '家用电器', '1', '003-refrigerator_91d2ebe.png');
INSERT INTO `art_category` VALUES ('5', '数码产品', '1', '005-search_07cc23e.png');

-- ----------------------------
-- Table structure for `art_price`
-- ----------------------------
DROP TABLE IF EXISTS `art_price`;
CREATE TABLE `art_price` (
  `ap_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '废品价格id\n',
  `art_id` int(11) NOT NULL COMMENT '废品id',
  `ap_price` float NOT NULL COMMENT '废品价格',
  `ap_min_count` float DEFAULT NULL COMMENT '公斤或数量限制\n0 ： 代表无限制 也就是标准默认价格',
  `ap_enable` int(11) DEFAULT '0' COMMENT '是否 启用该废品价格\n\n1：启用\n0:  禁用\n',
  `u_type` int(5) NOT NULL DEFAULT '0' COMMENT '用户级别类型\n100 普通用户\n200 普通商户\n300 星级商户',
  `ap_unit` varchar(45) NOT NULL DEFAULT '公斤' COMMENT '单位： 公斤/升/个',
  `ap_price_cmt` varchar(45) DEFAULT NULL COMMENT '价格说明',
  PRIMARY KEY (`ap_id`),
  UNIQUE KEY `ap_id_UNIQUE` (`ap_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of art_price
-- ----------------------------
INSERT INTO `art_price` VALUES ('1', '8', '0.6', '0', '1', '100', '公斤', null);
INSERT INTO `art_price` VALUES ('2', '9', '1.2', '0', '1', '100', '公斤', null);
INSERT INTO `art_price` VALUES ('3', '10', '0.8', '0', '1', '100', '公斤', null);
INSERT INTO `art_price` VALUES ('4', '11', '0.4', '0', '1', '100', '公斤', null);
INSERT INTO `art_price` VALUES ('5', '6', '1', '0', '1', '200', '公斤', null);
INSERT INTO `art_price` VALUES ('6', '8', '1', '50', '0', '200', '公斤', '( >50公斤 )');
INSERT INTO `art_price` VALUES ('7', '9', '1.2', '0', '0', '200', '公斤', null);
INSERT INTO `art_price` VALUES ('8', '10', '0.8', '0', '1', '200', '公斤', null);
INSERT INTO `art_price` VALUES ('9', '11', '0.4', '0', '1', '200', '公斤', null);
INSERT INTO `art_price` VALUES ('10', '8', '0.8', '100', '0', '200', '公斤', '( >100公斤 )');
INSERT INTO `art_price` VALUES ('11', '12', '0', '0', '1', '100', '个', '');
INSERT INTO `art_price` VALUES ('12', '13', '0', '0', '1', '100', '个', '');
INSERT INTO `art_price` VALUES ('13', '14', '0', '0', '1', '100', '个', '');
INSERT INTO `art_price` VALUES ('14', '15', '0', '0', '1', '100', '个', '');
INSERT INTO `art_price` VALUES ('15', '16', '0', '0', '1', '100', '个', '');
INSERT INTO `art_price` VALUES ('16', '17', '0', '0', '1', '100', '个', null);
INSERT INTO `art_price` VALUES ('17', '18', '0', '0', '1', '100', '个', null);
INSERT INTO `art_price` VALUES ('19', '7', '0.9', '0', '1', '100', '公斤', null);

-- ----------------------------
-- Table structure for `em_employment`
-- ----------------------------
DROP TABLE IF EXISTS `em_employment`;
CREATE TABLE `em_employment` (
  `em_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '收购员id',
  `em_name` varchar(10) DEFAULT NULL COMMENT '收购员姓名',
  `em_mobile` varchar(11) DEFAULT NULL COMMENT '收购员手机\n唯一的',
  `em_addr` varchar(45) DEFAULT NULL COMMENT '收购员地址',
  `em_pwd` varchar(40) NOT NULL COMMENT '密码 md5加密',
  `em_nickname` varchar(10) DEFAULT NULL COMMENT '昵称\n默认显示em_name/em_mobile',
  `em_coord_lat` double(10,6) DEFAULT NULL COMMENT '用户坐标 维度',
  `em_coord_lng` double(10,6) DEFAULT NULL COMMENT '快递员坐标 经度',
  `em_status_code` int(2) DEFAULT NULL COMMENT '回收员状态（忙碌）',
  `em_star_level` int(1) NOT NULL DEFAULT '5' COMMENT '回收员星级 默认：5星级',
  `r_id` bigint(20) NOT NULL COMMENT '回收员所在 区域id',
  `push_registration_id` varchar(45) DEFAULT NULL COMMENT '推送表示字段 registration_id',
  `em_like` int(10) DEFAULT '0' COMMENT '喜欢数量',
  `em_role_type` int(10) DEFAULT '0' COMMENT '回收员角色信息\r\n0，可回收全部用户废品\r\n1， 只能回收小区用户',
  PRIMARY KEY (`em_id`),
  UNIQUE KEY `em_id_UNIQUE` (`em_id`),
  UNIQUE KEY `em_mobile_UNIQUE` (`em_mobile`),
  UNIQUE KEY `push_registration_id_UNIQUE` (`push_registration_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of em_employment
-- ----------------------------



-- ----------------------------
-- Table structure for `em_order`
-- ----------------------------
DROP TABLE IF EXISTS `em_order`;
CREATE TABLE `em_order` (
  `ord_id` bigint(10) NOT NULL COMMENT '订单id',
  `u_id` bigint(10) NOT NULL COMMENT '关联的用户id',
  `u_ord_id` bigint(10) NOT NULL COMMENT '关联的 用户订单id',
  `r_id` bigint(10) DEFAULT NULL COMMENT '片区id',
  `ord_date` double NOT NULL COMMENT '接单时间\n',
  `end_date` double DEFAULT NULL COMMENT '结束时间',
  `exec_status_code` bigint(1) NOT NULL DEFAULT '100' COMMENT '订单状态',
  PRIMARY KEY (`ord_id`),
  UNIQUE KEY `ord_id_UNIQUE` (`ord_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of em_order
-- ----------------------------

-- ----------------------------
-- Table structure for `ord_art`
-- ----------------------------
DROP TABLE IF EXISTS `ord_art`;
CREATE TABLE `ord_art` (
  `oa_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'id',
  `o_id` bigint(10) NOT NULL COMMENT '关联的订单id',
  `art_id` int(3) NOT NULL COMMENT '关联的废品id',
  `art_count` decimal(8,2) DEFAULT NULL COMMENT '废品数量',
  `art_price` decimal(8,2) DEFAULT NULL COMMENT '废品价格 (单位 元）',
  `art_unit_price` decimal(8,2) DEFAULT '0.00' COMMENT '废品回收单价',
  `art_name` varchar(20) DEFAULT NULL COMMENT '废品名称',
  PRIMARY KEY (`oa_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1492 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of ord_art
-- ----------------------------


-- ----------------------------
-- Table structure for `ord_order`
-- ----------------------------
DROP TABLE IF EXISTS `ord_order`;
CREATE TABLE `ord_order` (
  `ord_id` bigint(10) unsigned NOT NULL COMMENT '订单id',
  `u_id` bigint(10) NOT NULL COMMENT '用户id',
  `em_id` bigint(10) DEFAULT '-1' COMMENT '收购员id',
  `r_id` int(5) NOT NULL COMMENT '订单所在社区',
  `u_addr` varchar(45) NOT NULL COMMENT '用户详细地址信息 （小区名字 楼号 单元 室）',
  `ord_status` int(1) unsigned NOT NULL DEFAULT '100' COMMENT '最新的订单状态id\n',
  `ord_price` varchar(45) DEFAULT NULL COMMENT '订单总价',
  `ord_note` varchar(45) DEFAULT NULL COMMENT '订单备注信息',
  `ord_date` double NOT NULL COMMENT '下单时间 (格式 2016-8-6 11:30)',
  `visit_date` double DEFAULT NULL COMMENT '上门时间 格式 2016-8-6 11:30:29 时间戳',
  `u_coord_lng` double(10,6) DEFAULT NULL COMMENT '收购地址 经度',
  `u_coord_lat` double(10,6) DEFAULT NULL COMMENT '收购地址 维度',
  `ord_end_date` double DEFAULT NULL COMMENT '订单结束时间',
  `service_star_rating` varchar(45) DEFAULT NULL COMMENT '服务评级 1-5 （与回收员评级挂钩）',
  `ord_art_types` varchar(45) DEFAULT NULL,
  `u_type` int(11) DEFAULT NULL COMMENT '用户级别类型\r\n\r\n100 家庭用户\r\n\r\n200 商家超市\r\n',
  PRIMARY KEY (`ord_id`),
  UNIQUE KEY `ord_id_UNIQUE` (`ord_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of ord_order
-- ----------------------------

-- ----------------------------
-- Table structure for `ord_ordering`
-- ----------------------------
DROP TABLE IF EXISTS `ord_ordering`;
CREATE TABLE `ord_ordering` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ord_id` int(2) unsigned NOT NULL COMMENT '订单id',
  `ord_status` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`,`ord_id`),
  UNIQUE KEY `ord_id_UNIQUE` (`ord_id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of ord_ordering
-- ----------------------------

-- ----------------------------
-- Table structure for `ord_status`
-- ----------------------------
DROP TABLE IF EXISTS `ord_status`;
CREATE TABLE `ord_status` (
  `os_id` bigint(20) unsigned NOT NULL COMMENT '订单状态id',
  `os_status` int(1) NOT NULL COMMENT '订单状态\n100 下单成功 等待接单\n101  下单失败 \n102 下单成功已分配收购员\n\n200 订单完成\n\n300 收购员正赶赴目的地\n301 收购员已收购\n\n\n400 取消\n\n500 \n',
  `os_text` varchar(45) NOT NULL COMMENT '订单状态描述信息\n（下单成功，收购员正在前往目的地）',
  `os_date` datetime NOT NULL COMMENT '状态变更时间',
  PRIMARY KEY (`os_id`),
  UNIQUE KEY `os_id_UNIQUE` (`os_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of ord_status
-- ----------------------------

-- ----------------------------
-- Table structure for `tickets64`
-- ----------------------------
DROP TABLE IF EXISTS `tickets64`;
CREATE TABLE `tickets64` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `stub` char(1) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `stub` (`stub`)
) ENGINE=MyISAM AUTO_INCREMENT=2562 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of tickets64
-- ----------------------------
INSERT INTO `tickets64` VALUES ('2561', 'a');

-- ----------------------------
-- Table structure for `u_feedback`
-- ----------------------------
DROP TABLE IF EXISTS `u_feedback`;
CREATE TABLE `u_feedback` (
  `f_id` int(11) NOT NULL AUTO_INCREMENT COMMENT '反馈id',
  `f_content` varchar(200) NOT NULL COMMENT '反馈内容',
  `f_status` int(11) DEFAULT '100' COMMENT '反馈状态：\n100 反馈成功等待阅读\n101 已阅读\n200 已采纳',
  `u_id` int(11) NOT NULL COMMENT '反馈的用户id',
  `u_mobile` int(11) DEFAULT NULL COMMENT '用户联系方式',
  `u_name` varchar(20) DEFAULT NULL COMMENT '用户姓名',
  PRIMARY KEY (`f_id`),
  UNIQUE KEY `f_id_UNIQUE` (`f_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of u_feedback
-- ----------------------------

-- ----------------------------
-- Table structure for `u_user`
-- ----------------------------
DROP TABLE IF EXISTS `u_user`;
CREATE TABLE `u_user` (
  `u_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '用户id',
  `u_name` varchar(100) DEFAULT NULL COMMENT '用户姓名',
  `u_pwd` varchar(32) DEFAULT NULL COMMENT '用户密码 MD5加密',
  `u_mobile` varchar(11) DEFAULT NULL COMMENT '用户手机号',
  `u_wx_openid` varchar(45) NOT NULL COMMENT '微信openid',
  `r_id` int(5) DEFAULT NULL COMMENT '所在片区id',
  `r_sid` int(5) DEFAULT NULL COMMENT '片区下的地点id',
  `u_addr` varchar(45) DEFAULT NULL COMMENT '用户地址信息',
  `r_date` double DEFAULT NULL COMMENT '注册时间（毫秒数）',
  `u_headimgurl` varchar(300) DEFAULT NULL,
  `cycle_service_type` int(2) DEFAULT '0' COMMENT '周期服务类型\r\n0：默认不设置周期上门\r\n值代表天数\r\n',
  `last_order_update_time` double DEFAULT NULL COMMENT '用户订单最后完成时间\r\n用于统计周期订单',
  `u_type` int(2) DEFAULT '100' COMMENT '用户级别类型\r\n100 家庭用户\r\n200 商家抄手',
  PRIMARY KEY (`u_id`),
  UNIQUE KEY `u_id_UNIQUE` (`u_id`)
) ENGINE=InnoDB AUTO_INCREMENT=616 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of u_user
-- ----------------------------

