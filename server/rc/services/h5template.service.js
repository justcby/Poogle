/**
 * Created by LICA4 on 11/15/2016.
 */

var h5TemplateModel = require('../models/h5.model.js').H5TemplateModel;
var moment = require('moment');

exports.getTemplatesByQuery = function (query, opt, callback) {
    h5TemplateModel.find(query, {}, opt, function (err, templates) {

        if (err) {
            return callback(err);
        }

        if (templates.length === 0) {
            return callback(null, []);
        }

        return callback(null, templates);
    });
};

exports.updateTemplateById = function (query, data, callback) {
    callback = callback || _.noop;
    data.updateTime = moment(new Date()).format('YYYY-MM-DD HH:mm');
    h5TemplateModel.update(query, {$set: data}, {multi: true}).exec(callback);
};

exports.addTemplate = function (data, callback) {
    var template = new h5TemplateModel();
    template.createUser = data.createUser;
    template.createTime = data.createTime;
    template.name = data.name;
    template.url = data.url;
    template.type = data.type;
    template.cover = data.cover;
    template.save(callback);
};
