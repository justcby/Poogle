/**
 * Created by ZOUDA on 11/10/2016.
 */
'use strict';
var mongoose = require('mongoose'),
    BusRoute = mongoose.model('BusRoute'),
    BusRouteSchedule = mongoose.model('BusRouteSchedule'),
    BusRouteHistory = mongoose.model('BusRouteHistory'),
    _ = require('lodash'),
    busConstant = require('../constants/busConstant.server.constant.js'),
    commonService = require('./common.server.service.js');

var createSimple = commonService.createSave(BusRoute);
var updateSimple = commonService.createUpsert(BusRoute)
exports.findById = getById;
exports.find = commonService.createFind(BusRoute)
exports.findAll = commonService.createFindAll(BusRoute)
exports.deleteRoute = deleteRoute
exports.getAllRouteCombined = getAllRouteCombined

exports.publishScheduledRoute = publishScheduledRoute

exports.saveOrPublishRoute = saveOrPublishRoute

exports.findPreviousPublishedRoute = findPreviousPublishedRoute

exports.findRouteSchedule = commonService.createFind(BusRouteSchedule)


exports.create = createSimple
exports.update = updateSimple

function getById(id, callback) {
    BusRoute.findById(id, function (err, result) {
        callback(err, result)
    })
}
function deleteRoute(route, callback) {
    if(route.status=='PUBLISHED'){
        BusRoute.remove({_id: route._id}, function(error, result){
            if(error) callback(error, null)
            else callback(null, result)
        });
    }
    else{
        BusRouteSchedule.remove({_id: route._id}, function(error, result){
            if(error) callback(error, null)
            else callback(null, result)
        });
    }

}

function getAllRouteCombined(callback) {
    BusRoute.find({}, function (err, routes) {
            if (!err) {
                BusRouteSchedule.find({}, function (error, routeSchedules) {
                    if (!error) {
                        var allRoutes = _.each(routes, function (item) {
                            item.status = busConstant.busRouteStatusConstants.PUBLISHED;
                        });
                        allRoutes = allRoutes.concat(routeSchedules);
                        callback(null, allRoutes);
                    } else {
                        callback(error, routeSchedules);
                    }
                });
            } else {
                callback(err, routes);
            }
        }
    );
}

function publishScheduledRoute(schedule, callback) {
    if (!schedule) {
        if (callback)  callback();
        return;
    }
    BusRoute.findOne({
        name: schedule.name,
        onDutyType: schedule.onDutyType,
        isLong: schedule.isLong
    }, function (err, route) {
        if (err) {
            console.log(err);
            if (callback) callback();
        }
        else {
            if (route) {
                route.remove();
            }
            var tmp = _.pick(schedule, ['name', 'isLong', 'onDutyType', 'status', 'stations', 'captainName', 'captainPhoneNum', 'driverName', 'driverPhoneNum', 'busLicenseNumber', 'createdBy', 'updatedBy', 'activeDate'])
            var newRoute = new BusRoute(tmp);
            newRoute.save(function (err, data) {
                schedule.remove();
                if (callback)  callback();
            });
        }
    });
}


function findPreviousPublishedRoute(schedules, callback) {
    if (!schedules || schedules.length == 0) {
        callback([]);
    }
    var query = BusRoute.find();
    for (var i = 0; i < schedules.length; i++) {
        var item = schedules[i];
        query.or([{name: item.name, onDutyType: item.onDutyType, isLong: item.isLong}]);
    }

    query.then(function (datas) {
        callback(null, datas);
    });
    query.catch(function (err) {
        callback({msg: 'Error'}, null);
    });
}


function saveOrPublishRoute(route, callback) {
    if (!route._id) { //新增
        if (busConstant.busRouteStatusConstants.PUBLISHED == route.status) {
            var newRoute = new BusRoute(route);
            newRoute.save(function (err, addedRoute) {
                callback(err, addedRoute);
            });
        } else {
            route.msgSent = false;
            var newRouteSchedule = new BusRouteSchedule(route);
            newRouteSchedule.save(function (err, data) {
                callback(err, data);
            });
        }
    } else {
        if (route.preStatus) {
            if (busConstant.busRouteStatusConstants.PUBLISHED == route.status) {
                if (route.preStatus == busConstant.busRouteStatusConstants.PUBLISHED) {
                    BusRoute.update({_id: route._id}, route, function (err, data) {
                        callback(err, route);
                    })
                } else {
                    var newRoute = new BusRoute(route);
                    newRoute.save(function (err, addedRoute) {
                        BusRouteSchedule.remove({_id: route._id}, function (err, data) {
                            console.log(err, data);
                        });
                        callback(err, addedRoute);
                    });
                }
            } else {
                var id = route._id;
                delete route._id;
                delete route.__v;
                delete route.createdAt;
                delete route.updatedAt;
                BusRouteSchedule.update({
                    _id: id
                }, route , function (err, result) {
                    if(result.n == 0){
                        route.msgSent = false;
                        var newRouteSchedule = new BusRouteSchedule(route);
                        newRouteSchedule.save(function(err,data){
                            callback(err,data);
                        });
                    }else {
                        callback(err, route);
                    }
                });
            }
        } else {
            var err = {msg: 'Previous status is missing.'};
            callback(err, null);
        }
    }
}

