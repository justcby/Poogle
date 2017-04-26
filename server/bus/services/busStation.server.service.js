var mongoose = require('mongoose'),
    BusStation = mongoose.model('BusStation'),
    commonService = require('./common.server.service.js')

exports.find = commonService.createFind(BusStation)
exports.findAll = commonService.createFindAll(BusStation)
exports.disableStation = disableStation
exports.create = commonService.createSave(BusStation)
exports.update = commonService.createUpsert(BusStation)

function disableStation(name, callback) {
    // BusStation.update({name: name}, {$set: {isActive: false}}, {upsert: false}, function(error, result){
    //     if(error) callback(error, null)
    //     else callback(null, result)
    // })
    BusStation.remove({name: name}, function(error, result){
        if(error) callback(error, null)
        else callback(null, result)
    })
}