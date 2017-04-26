/**
 * Created by SUKE3 on 11/22/2016.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var AdminUser = new Schema({
    name: String,
    loginId: String,
    password: String,
    wechat: String,
    telNum: String,
    status: String,
    role: String,
    createBy: String,
    createDate: {
        type: Date,
        default: Date.now
    },
    updateBy: String,
    updateDate: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('AdminUser', AdminUser);