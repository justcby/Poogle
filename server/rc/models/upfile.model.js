/**
 * Created by LICA4 on 11/15/2016.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var upfileSchema = new Schema({

    createUser: { type: String },

    createTime: { type: Date },

    name: { type: String },

    fileSrc: { type: String},

    fileThumbSrc: { type: String},

    isDelete: { type: Boolean, default: false }
});

exports.UpfileModel = mongoose.model('upfile', upfileSchema);
