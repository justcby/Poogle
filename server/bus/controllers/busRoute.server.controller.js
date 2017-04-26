/**
 * Created by ZOUDA on 11/10/2016.
 */
'use strict';

var routeService = require('../services/busRoute.server.service'),
    _ = require('lodash'),
    userService = require('../services/userProfile.server.service.js'),
    async = require('async'),
    notificationController = require('./notification.app.controller');

exports.getRouteById = getRouteById;
exports.find = find
exports.findAll = findAll
exports.findAllCombined = getAllRouteCombined
exports.saveOrPublishRoute = saveOrPublishRoute
exports.findRouteStatistics = findRouteStatistics
exports.deleteRoute = deleteRoute
exports.findUserContactByRoute = findUserContactByRoute
exports.getAllRouteCombined = getAllRouteCombined
exports.findRouteSchedule = findRouteSchedule


function getRouteById(req, res) {
    var id = req.params.routeId
    if (!_.isEmpty(id))
        routeService.findById(id, getCallBack(res))
    else
        res.end()
}

function getAllRouteCombined(req, res, next) {
    routeService.getAllRouteCombined(function (err, routes) {
        if (err) {
            next(err);
        } else {
            res.json(routes);
        }
    });
}

function getCallBack(res) {
    return function (err, result) {
        if (err) {
            console.log(err)
            res.end()
        }
        else {
            res.json(result)
        }
    }
}

function find(req, res, next) {
    var searchQuery = req.body;
    console.log(searchQuery)
    if (!_.isEmpty(searchQuery)) {
        routeService.find(searchQuery, function (err, busRoutes) {
            if (err) {
                console.error('Failed in finding routes', err)
                next(err)
            } else {
                console.log(busRoutes)
                res.json(busRoutes)
            }
        })
    } else {
        res.end()
    }
}

function findAll(req, res, next) {
    routeService.findAll(function (err, busRoutes) {
        if (err) {
            console.error('Failed in finding all routes', err)
            next(err)
        } else {
            res.json(busRoutes)
        }
    })
}

function findUserContactByRoute(req, res, next) {
    var routeName = _.get(req, ['body', 'routeName'], ''),
        isLong = _.get(req, ['body', 'isLong']),
        onDutyType = _.get(req, ['body', 'onDutyType'], ''),
        searchQuery = {};
    if (_.isEmpty(onDutyType) || _.isEmpty(routeName) || !_.isBoolean(isLong)) {
        res.end()
    } else {
        searchQuery.name = routeName;
        searchQuery.isLong = isLong;
        searchQuery.onDutyType = onDutyType;
        routeService.find(searchQuery, function (err, routes) {
            if (err) {
                console.error('Error in finding routes with onDutyType %s, routeName %s, isLong %s', onDutyType, routeName, isLong);
                next(err);
            } else {
                if (_.isEmpty(routes))
                    res.json([]);
                else {
                    var userContactsStatistics = [],
                        tasks = [];
                    _.forEach(routes, function (route) {
                        var stationsInRoute = _.get(route, ['stations'], []);
                        if (!_.isEmpty(stationsInRoute)) {
                            var stationNames = _.map(stationsInRoute, 'name');
                            tasks.push(findUserContactsByStations(stationNames, onDutyType, route.name));
                        }
                    });
                    async.parallel(tasks, function (error, result) {
                        if (error) {
                            console.log('Error in finding user profiles by stations and onDutyType', error);
                            next(error);
                        } else {
                            console.log(result);
                            result = _.flatten(result);
                            res.json(result);
                        }
                    });
                }
            }
        });
    }
}

function deleteRoute(req, res, next) {
    var route = req.body
    var routeId = _.get(route, '_id')
    if (!_.isEmpty(routeId)) {
        routeService.deleteRoute(route, function (err, delResult) {
            if (err) {
                console.log('Failed in delete route', err)
                next(err)
            } else {
                if(route.status=='PUBLISHED') {
                    notificationController.compareRoutes([], [route], function (err, result) {
                        if (result) {
                            res.json({
                                notification: result,
                                route: route
                            });
                        }
                        else {
                            console.log('删除路线，比较失败 :' + err);
                            res.json({route: route});
                        }
                    });
                }else{
                    res.json({route: route});
                }
            }
        })
    } else {
        res.end()
    }
}

function findRouteStatistics(req, res, next) {
    var routeName = _.get(req, ['body', 'routeName'], ''),
        isLong = _.get(req, ['body', 'isLong']),
        onDutyType = _.get(req, ['body', 'onDutyType'], ''),
        searchQuery = {};
    if (_.isEmpty(onDutyType)) {
        res.end()
    } else {
        if (!_.isEmpty(routeName))   searchQuery.name = routeName;
        if (_.isBoolean(isLong)) searchQuery.isLong = isLong;
        searchQuery.onDutyType = onDutyType;
        routeService.find(searchQuery, function (err, routes) {
            if (err) {
                console.error('Error in finding routes with onDutyType:', onDutyType);
                next(err);
            } else {
                if (_.isEmpty(routes))
                    res.json([]);
                else {
                    var routeStatistics = [],
                        tasks = [];
                    _.forEach(routes, function (route) {
                        var stationsInRoute = _.get(route, ['stations'], []);
                        if (!_.isEmpty(stationsInRoute)) {
                            var stationNames = _.map(stationsInRoute, 'name');
                            tasks.push(findUserProfileByStations(stationNames, onDutyType, route.name));
                        }
                    });
                    async.parallel(tasks, function (error, result) {
                        if (error) {
                            console.log('Error in finding user profiles by stations and onDutyType', error);
                            next(error);
                        } else {
                            console.log(result);
                            _.forEach(result, function (userSta) {
                                if (!_.isEmpty(userSta))
                                    routeStatistics.push(userSta);
                            });
                            res.json(routeStatistics);
                        }
                    });
                }
            }
        });
    }
}

function findUserProfileByStations(stations, onDutyType, routeName) {
    return function (callback) {
        var searchQuery = {};
        if (onDutyType === 'TO_OFFICE')
            searchQuery.onDutyStation = {$in: stations};
        else if (onDutyType === 'TO_HOME')
            searchQuery.offDutyStation = {$in: stations};
        userService.find(searchQuery, function (error, users) {
            if (error) callback(error, null);
            else {
                var result = {};
                if (!_.isEmpty(users)) {
                    result.routeName = routeName;
                    result.userCount = users.length;
                } else {
                    result.routeName = routeName;
                    result.userCount = 0;
                }
                callback(null, result);
            }
        })
    }
}

function findUserContactsByStations(stations, onDutyType, routeName) {
    return function (callback) {
        var searchQuery = {};
        if (onDutyType === 'TO_OFFICE')
            searchQuery.onDutyStation = {$in: stations};
        else if (onDutyType === 'TO_HOME')
            searchQuery.offDutyStation = {$in: stations};
        userService.find(searchQuery, function (error, users) {
            if (error) callback(error, null);
            else {
                var result = [];
                if (!_.isEmpty(users)) {
                    _.forEach(users, function (user) {
                        var userObj = {
                            userName: _.get(user, ['name'], ''),
                            email: _.get(user, ['email'], ''),
                            phoneNumber: _.get(user, ['phoneNumber'], '')
                        };
                        if (onDutyType === 'TO_OFFICE')
                            userObj.stationName = _.get(user, ['onDutyStation']);
                        else if (onDutyType === 'TO_HOME')
                            userObj.stationName = _.get(user, ['offDutyStation']);
                        result.push(userObj);
                    });
                }
                callback(null, result);
            }
        })
    }
}
function saveOrPublishRoute(req, res, next) {
    var route = req.body;
    var controllerResult = {};
    if (route) {
        var immediate = false;
        if (route && route.status == 'PUBLISHED' && route.status == 'PUBLISHED') {
            immediate = true;
        }
        if (immediate) {
            routeService.findPreviousPublishedRoute([route], function (err, datas) {
                notificationController.compareRoutes([route], datas, function (err, notification) {
                    if (notification) {
                        routeService.saveOrPublishRoute(route, function (err, newRoute) {
                            if (err) {
                                res.status(500).json(err);
                            } else {
                                controllerResult.route = newRoute;
                                controllerResult.notification = notification;
                                res.json(controllerResult);
                            }
                        });
                    }
                    else {
                        console.log('立即发布，比较失败 :' + err);
                    }
                });
            });
        } else {
            routeService.saveOrPublishRoute(route, function (err, data) {
                if (err) {
                    res.status(500).json(err);
                } else {
                    controllerResult.route = route;
                    res.json(controllerResult);
                }
            });
        }
    }
    else {
        res.end();
    }
}

function findRouteSchedule(req, res, next) {
    var searchQuery = req.body;
    console.log(searchQuery)
    if (!_.isEmpty(searchQuery)) {
        routeService.findRouteSchedule(searchQuery, function (err, busRoutesSchedule) {
            if (err) {
                console.error('Failed in finding routes', err)
                next(err)
            } else {
                console.log(busRoutesSchedule)
                res.json(busRoutesSchedule)
            }
        })
    } else {
        res.end()
    }
}
