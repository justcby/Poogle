/**
 * Created by SUKE3 on 11/18/2016.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var commonUserSchema = new Schema({
    userId:String,
    name: String,
    cname: String,
    ename: String,
    email: String,
    avatar: String,
    department: String,
    wechat: String,
    telNum: String,
    createBy: String,
    createDate: {
        type: Date,
        default: Date.now
    },
    updateBy: String,
    updateDate: {
        type: Date,
        default: Date.now
    },
    favouriteClub: [{ type: Schema.Types.ObjectId, ref: 'RecreationClub' }]
});
mongoose.model('CommonUser', commonUserSchema);
