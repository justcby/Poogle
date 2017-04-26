/**
 * Created by LICA4 on 12/6/2016.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var h5TemplateSchema = new Schema({

    createUser: { type: String },
    createTime: { type: Date },
    updateTime: { type: Date },
    name: { type: String },
    url: { type: String },
    type: { type: String },
    cover: { type: String, default: '' },
    isSelect: { type: Boolean, default: false },
    isDelete: { type: Boolean, default: false }
});

exports.H5TemplateModel = mongoose.model('h5Template', h5TemplateSchema);
