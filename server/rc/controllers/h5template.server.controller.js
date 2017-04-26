/**
 * Created by lica4 on 11/16/2016.
 */
'use strict';

var H5TemplateService = require('../services/h5template.service.js');
var tool = require('../../common/tool.js');
var moment = require('moment');

exports.getH5TemplatesByUser = function(req, res, next) {
    var createUser = req.body.createUser,
        pageNo = parseInt(req.body.pageNo),
        pageSize = parseInt(req.body.pageSize),
        isDelete = req.body.isDelete,
        order = req.body.order,
        type = req.body.type,
        query = {
            'createUser': createUser,
            'isDelete': isDelete
        };
    if(type && type !== '') query.type = type;
    pageSize = pageSize > 30? 30 : pageSize;
    H5TemplateService.getTemplatesByQuery(query, {skip: (pageNo - 1)* pageSize, limit: pageSize, sort: '-_id'}, function(err, templates){
        if(err) {
            return next(err);
        }else if(templates && templates.length > 0){
            templates.forEach(function(template, i){
                var default_RC = 'server/common/templates/default_RC.jpg';
                template.cover = tool.base64_encode('server/common/templates/'+template.cover, default_RC);
            });
        }
        return res.json({
            templates: templates,
            code: 200,
            success: true,
            map: {
                count: templates.length,
                pageNo: pageNo,
                pageSize: pageSize
            }
        });
    });
}

exports.selectTemplateById = function(req, res, next) {
    var query = {},
        data = {};
    query._id = req.body._id;
    data.isSelect = req.body.isSelect;
    data.type = req.body.type;
    H5TemplateService.updateTemplateById(query, data, function(err){
        if(err) {
            return next(err);
        }else{
            return res.json({
                code: 200,
                success: true
            });
        }
    });
}

exports.deleteTemplateById = function(req, res, next) {
    var query = {},
        data = {};
    query._id = req.body._id;
    data.isDelete = req.body.isDelete;
    H5TemplateService.updateTemplateById(query, data, function(err){
        if(err) {
            return next(err);
        }else{
            return res.json({
                code: 200,
                success: true
            });
        }
    });
}

exports.createTemplateFromWS = function(req, res, next) {
    var data = req.body,
        path = '',
        cover = ''
    data.createTime = moment().format('YYYY-MM-DD HH:mm');
    console.log('in createTemplateFromWS createTime', data.createTime)
    cover = data.name + '_' + data._id.substr(0,6) + '.jpg';
    path = 'server/common/templates/' + cover;
    tool.base64_decode(data.cover, path);
    data.cover = cover;
    H5TemplateService.addTemplate(data, function(err){
        if(err) {
            return next(err);
        }else{
            return res.json({
                code: 200,
                success: true
            });
        }
    });
}

