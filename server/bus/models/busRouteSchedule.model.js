var mongoose = require('mongoose'),
    Schema = mongoose.Schema

var stationSimpleInfoSchema = new Schema({
    id: String,
    name: String,
    departureTime: String,
    sequence: Number
})
var busRouteScheduleSchema = new Schema({
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
    updatedBy: String,
    msgSent: Boolean,
    activeDate: Date
}, {
    collection: 'busroutesschedule',
    timestamps: true
})

mongoose.model('BusRouteSchedule', busRouteScheduleSchema)