var mongoose = require('mongoose'),
    Schema = mongoose.Schema

var routeSimpleInfoSchema = new Schema({
    id: String,
    name: String,
    type: String
})

var busStationSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    status: String,
    isActive: Boolean,
    desc: String,
    routes: [routeSimpleInfoSchema],
    createBy: String,
    updateBy: String
}, {
    collection: 'busstations',
    timestamps: true
})

mongoose.model('BusStation', busStationSchema)