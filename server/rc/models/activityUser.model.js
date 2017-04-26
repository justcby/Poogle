/**
 * Created by SUKE3 on 11/30/2016.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ActivityUser = new Schema({
    commonUser: {type: Schema.Types.ObjectId, ref: 'CommonUser'},
    activity: {type: Schema.Types.ObjectId, ref: 'ClubActivity'},
    fields: Array,
    createDate: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('ActivityUser', ActivityUser);