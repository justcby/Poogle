var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    _ = require('lodash');

var stationSimpleInfoSchema = new Schema({
    id: String,
    name: String,
    departureTime: String,
    sequence: Number
})
var busRouteSchema = new Schema({
    name: String,
    isLong: Boolean,
    onDutyType: String,
    status: String,
    stations: [stationSimpleInfoSchema],
    captainName: String,
    captainPhoneNum: String,
    driverName: String,
    driverPhoneNum: String,
    busLicenseNumber: String,
    createdBy: String,
    activeDate: Date,
    updatedBy: String
}, {
    collection: 'busroutes',
    timestamps: true
})

busRouteSchema.pre('save', function (next) {
    var BusRoute = mongoose.model('BusRoute');
    var temp = _.pick(this, ['name', 'isLong', 'onDutyType', 'status', 'stations', 'captainName', 'captainPhoneNum', 'driverName', 'driverPhoneNum', 'busLicenseNumber', 'createdBy', 'updatedBy']);
    BusRoute.find({name: this.name, onDutyType: this.onDutyType, isLong: this.isLong}, function (err, data) {
        if (!data || data.length == 0) {
            var BusRouteHis = mongoose.model('BusRouteHistory');
            var his = new BusRouteHis(temp);
            his.save(function (err, result) {
                next();
            });

        }
        else {
            next({msg: '重复线路，请检查线路名及类型。'}, this);
        }
    });
})

busRouteSchema.pre('update', function (next) {
    var BusRouteHis = mongoose.model('BusRouteHistory');
    var temp = _.pick(this._update.$set, ['name', 'isLong', 'onDutyType', 'status', 'stations', 'captainName', 'captainPhoneNum', 'driverName', 'driverPhoneNum', 'busLicenseNumber', 'createdBy', 'updatedBy']);
    var his = new BusRouteHis(temp);
    his.save(function (err, result) {
        next();
    });

});

mongoose.model('BusRoute', busRouteSchema)