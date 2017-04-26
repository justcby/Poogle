/**
 * Created by LICA4 on 11/15/2016.
 */

var upfileModel = require('../models/upfile.model.js').UpfileModel;
var moment = require('moment');

exports.getUpfiles = function (query, opt, callback) {
    upfileModel.find(query, {}, opt, function (err, templates) {

        if (err) {
            return callback(err);
        }

        if (templates.length === 0) {
            return callback(null, []);
        }

        return callback(null, templates);
    });
};

exports.addUpfile = function (data, callback) {
    var upfile = new upfileModel();
    upfile.createUser = data.createUser;
    upfile.createTime = data.createTime;
    upfile.name = data.name;
    upfile.fileSrc = data.fileSrc;
    upfile.fileThumbSrc = data.fileThumbSrc;
    upfile.save(callback);
};

exports.deleteUpfiles = function (upfiles, callback) {
    callback = callback || _.noop;
    var ids = upfiles.map(function (m) {
        return m._id;
    });
    upfileModel.remove({_id: {$in : ids} }, callback);
};