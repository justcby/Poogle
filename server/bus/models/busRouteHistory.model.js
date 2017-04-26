var mongoose = require('mongoose'),
    Schema = mongoose.Schema

var stationSimpleInfoSchema = new Schema({
    id: String,
    name: String,
    departureTime: String,
    sequence: Number
})
var busRouteHistorySchema = new Schema({
    name: String,
    isLong : Boolean,
    onDutyType: String,
    status: String,
    stations: [stationSimpleInfoSchema],
    captainName: String,
    captainPhoneNum: String,
    driverName: String,
    driverPhoneNum: String,
    busLicenseNumber: String,
    createdBy: String,
    updatedBy: String
}, {
    collection: 'busrouteshistory',
    timestamps: true
})

mongoose.model('BusRouteHistory', busRouteHistorySchema)