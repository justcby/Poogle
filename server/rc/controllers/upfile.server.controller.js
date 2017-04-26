/**
 * Created by lica4 on 11/16/2016.
 */
'use strict';

var UpfileService = require('../services/upfile.service.js');
var tool = require('../../common/tool.js');
var moment = require('moment');

exports.addUpfile = function(req, res, next) {
    var upfile = req.body.upfile
    if(upfile) {
        upfile.createTime = moment().format('YYYY-MM-DD HH:mm');
        UpfileService.addUpfile(upfile, function (err) {
            if (err) {
                return next(err);
            } else {
                return res.json({
                    code: 200,
                    success: true
                });
            }
        });
    }
}

exports.getUpfiles = function(req, res, next) {
    var query = req.body;
    UpfileService.getUpfiles(query, {sort: 'createTime'}, function(err, upfiles){
        if(err) {
            return next(err);
        }else{
            return res.json({
                upfiles: upfiles,
                code: 200,
                success: true
            });
        }
    });
}

exports.deleteUpfiles = function(req, res, next) {
    var upfiles = req.body;
    UpfileService.deleteUpfiles(upfiles, function(err){
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


