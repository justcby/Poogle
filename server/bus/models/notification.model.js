var mongoose = require('mongoose'),
    Schema = mongoose.Schema

var changeLogSchema = new Schema({
    category: String,
    type: String,
    desc: String,
    relatedRouteName: String,
    onDutyType: String,
    isLong: Boolean,
    activeDate: Date,
    routeStatus: String
});
var notificationSchema = new Schema({
    status: String,
    changeLogs: [changeLogSchema]
}, {
    collection: 'notifications',
    timestamps: true
});

mongoose.model('Notification', notificationSchema)