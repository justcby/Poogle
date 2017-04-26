var _ = require('lodash'),
    async = require('async'),
    request = require('request'),
    notificationService = require('../services/notification.server.service.js');

exports.compareRoutes = compareRoutes;
exports.insert = insert;


function compareRoutes(newRoutes, oldRoutes, callback){
    if(_.isArray(newRoutes) && _.isArray(oldRoutes)){
        var compareTasks = [];
        _.forEach(newRoutes, function(route){
            var routeName = _.get(route, ['name']),
                onDutyType = _.get(route, ['onDutyType']),
                isLong = _.get(route, ['isLong']),
                foundRoute = _.find(oldRoutes, {'name': routeName, 'onDutyType': onDutyType, 'isLong': isLong});
            if(_.isEmpty(foundRoute))
                compareTasks.push(generateChangeLogs(route, null));
            else
                compareTasks.push(generateChangeLogs(route, foundRoute));
        });
        _.forEach(oldRoutes, function(route){
            var routeName = _.get(route, ['name']),
                onDutyType = _.get(route, ['onDutyType']),
                isLong = _.get(route, ['isLong']),
                foundRoute = _.find(newRoutes, {'name': routeName, 'onDutyType': onDutyType, 'isLong': isLong});
            if(_.isEmpty(foundRoute))
                compareTasks.push(generateChangeLogs(null, route));
        });
        async.parallel(compareTasks, function(error, result){
            if(error) console.log('Error in generate change logs', error);
            else {
                var changeLogs = _.flatten(result);
                console.log(changeLogs);
                if(_.isEmpty(changeLogs)){
                    console.log('no change found');
                    callback(null, null);
                } else {
                    var notifiObj = {
                        status: 'unsent',
                        changeLogs: changeLogs
                    }
                    insert(notifiObj, function(err, result){
                        if(err) {
                            console.log('Inserting notification error as', err);
                            callback(err, null);
                        } else{
                            callback(null, result);
                        }
                    })
                }
            }
        })
    } else {
        console.log('not all of these two objects are arrays')
    }
}

function generateChangeLogs(newRoute, oldRoute) {
    return function(callback) {
        var changeLogs = [];
        try {
            if(_.isEmpty(newRoute) && !_.isEmpty(oldRoute)){
                var change = {
                    category: 'route',
                    type: 'remove',
                    desc: _.get(oldRoute, ['name'], '') + '号线',
                    relatedRouteName: _.get(oldRoute, ['name'], ''),
                    onDutyType: _.get(oldRoute, ['onDutyType'], ''),
                    isLong: _.get(oldRoute, ['isLong']),
                    routeStatus: 'PUBLISHED'
                };
                changeLogs.push(change);
                console.log('removed');
            } else if(!_.isEmpty(newRoute) && _.isEmpty(oldRoute)){
                var change = {
                    category: 'route',
                    type: 'create',
                    desc: _.get(newRoute, ['name'], '') + '号线',
                    relatedRouteName: _.get(newRoute, ['name'], ''),
                    onDutyType: _.get(newRoute, ['onDutyType'], ''),
                    isLong: _.get(newRoute, ['isLong']),
                    activeDate: _.get(newRoute, ['activeDate'])
                };
                var routeStatus = _.get(newRoute, ['status']);
                if(!_.isEmpty(routeStatus)){
                    if(routeStatus === 'PUBLISHED')
                        change.routeStatus = 'PUBLISHED';
                    else if(routeStatus === 'READY') {
                        change.routeStatus = 'READY';
                    }
                }
                changeLogs.push(change);
                console.log('add new');
            } else {
                var newStations = _.get(newRoute, ['stations'], []),
                    oldStations = _.get(oldRoute, ['stations'], []);
                var routeStatus = _.get(newRoute, ['status']);
                
                _.forEach(newStations, function(station){
                    var stationName = _.get(station, ['name'], ''),
                        foundStation = _.find(oldStations, {'name': stationName}),
                        change = {
                            relatedRouteName: _.get(newRoute, ['name'], ''),
                            onDutyType: _.get(newRoute, ['onDutyType'], ''),
                            isLong: _.get(newRoute, ['isLong'])
                        };
                    if(_.isEmpty(foundStation)){
                        change.category = 'station';
                        change.type = 'create';
                        var desc = stationName + '站';
                        if(!_.isEmpty(_.get(station, ['departureTime'])))
                            desc += '(' + _.get(station, ['departureTime']) + ')';
                        change.desc = desc;
                        change.activeDate = _.get(newRoute, ['activeDate']);
                        if(!_.isEmpty(routeStatus)){
                            if(routeStatus === 'PUBLISHED')
                                change.routeStatus = 'PUBLISHED';
                            else if(routeStatus === 'READY') {
                                change.routeStatus = 'READY';
                            }
                        }
                    } else {
                        var newDepartureTime = _.get(station, ['departureTime']),
                            oldDepartureTime = _.get(foundStation, ['departureTime']),
                            updateFlag = false;
                        if(!_.isEmpty(newDepartureTime)){
                            if(_.isEmpty(oldDepartureTime) || (!_.isEmpty(oldDepartureTime) && oldDepartureTime != newDepartureTime))
                                updateFlag = true;
                        } else{
                            if(!_.isEmpty(oldDepartureTime))
                                updateFlag = true;
                        }
                        if(updateFlag) {
                            change.category = 'station';
                            change.type = 'update';
                            var desc = stationName + '站';
                            if(!_.isEmpty(newDepartureTime))
                                desc += '(' + newDepartureTime + ')';
                            change.desc = desc;
                            change.activeDate = _.get(newRoute, ['activeDate']);
                            if(!_.isEmpty(routeStatus)){
                                if(routeStatus === 'PUBLISHED')
                                    change.routeStatus = 'PUBLISHED';
                                else if(routeStatus === 'READY') {
                                    change.routeStatus = 'READY';
                                }
                            }
                        }
                    }
                    if(!_.isEmpty(change.category))
                        changeLogs.push(change);
                });

                _.forEach(oldStations, function(station){
                    var stationName = _.get(station, ['name'], ''),
                        foundStation = _.find(newStations, {'name': stationName}),
                        change = {
                            relatedRouteName: _.get(newRoute, ['name'], ''),
                            onDutyType: _.get(newRoute, ['onDutyType'], ''),
                            isLong: _.get(newRoute, ['isLong'])
                        };
                    if(_.isEmpty(foundStation)){
                        change.category = 'station';
                        change.type = 'remove';
                        var desc = stationName + '站';
                        if(!_.isEmpty(_.get(station, ['departureTime'])))
                            desc += '(' + _.get(station, ['departureTime']) + ')';
                        change.desc = desc;
                        change.activeDate = _.get(newRoute, ['activeDate']);
                        if(!_.isEmpty(routeStatus)){
                            if(routeStatus === 'PUBLISHED')
                                change.routeStatus = 'PUBLISHED';
                            else if(routeStatus === 'READY') {
                                change.routeStatus = 'READY';
                            }
                        }
                    }
                    if(!_.isEmpty(change.category))
                        changeLogs.push(change);
                });
            }
            return callback(null, changeLogs);
        } catch(e) {
            console.log('Error in comparing routes', e);
            return callback(e, changeLogs);
        }
        
    }
}

function insert(notificationObj, callback){
    notificationService.save(notificationObj, function(err, result){
        if(err) {
            console.log('Error in saving notification', err);
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
}