'use strict'

var stationService = require('../services/busStation.server.service.js'),
    _ = require('lodash'),
    async = require('async'),
    routeService = require('../services/busRoute.server.service.js'),
    userService = require('../services/userProfile.server.service.js')

exports.find = find
exports.findAll = findAll
exports.disableStation = disableStation
exports.create = create
exports.update = update
exports.updateAll = updateAll
exports.findStationStatistics = findStationStatistics
exports.findUserContactByStations = findUserContactByStations

function find(req, res, next){
    var searchQuery = req.body;
    if(!_.isEmpty(searchQuery)){
        stationService.find(searchQuery, function(err, busStations){
            if(err) {
                console.error('Failed in finding stations', err)
                next(err)
            } else {
                res.json(busStations)
            }
        })
    } else {
        res.end()
    }
}

function findAll(req, res, next){
    stationService.findAll(function(err, busStations){
        if(err){
            console.error('Failed in finding all stations', err)
            next(err)
        } else {
            res.json(busStations)
        }
    })
}

function disableStation(req, res, next) {
    var stationName = req.body
    var name = _.get(stationName, 'name')
    if(!_.isEmpty(name)){
        stationService.disableStation(name, function(err, result){
            if(err) {
                console.log('Failed in disabling station', err)
                next(err)
            } else {
                res.json(result);
            }
        })
    } else {
        res.end()
    }
}

function create(req, res, next) {
    var station = req.body,
        name = _.get(station, 'name')
    if(!_.isEmpty(name)){
        stationService.create({name: name}, station, function(error, result){
            if(error) {
                console.log('Failed in updating station'. error)
                next(error)
            } else {
                var obj = {}
                if(_.get(result, ['exists']) === 1){
                    obj['ok'] = 0
                    obj['exists'] = _.get(result, ['exists'])
                } else {
                    obj['ok'] = 1
                    obj['_id'] = _.get(result, ['_id'], '')
                }
                res.json(obj)
            }
        })
    } else {
        res.end()
    }
}

function update(req, res, next) {
    var station = req.body,
        id = _.get(station, '_id')
    if(!_.isEmpty(id)){
        stationService.update({'_id': id}, station, function(error, result){
            if(error) {
                console.log('Failed in updating station'. error)
                next(error)
            } else {
                var obj = {}
                obj['ok'] = _.get(result, ['ok'], '')
                obj['nModified'] = _.get(result, ['nModified'], '')
                res.json(obj)
            }
        })
    } else {
        res.end()
    }
}

function updateAll(req, res, next) {
    var stations = req.body
    if(!_.isArray(stations)) {
        var id = _.get(stations, '_id')
        if(!_.isEmpty(id)) {
            stationService.update({'_id': id}, stations, function(error, result){
                if(error) {
                    console.log('Failed in updating station'. error)
                    next(error)
                } else {
                    var obj = {}
                    obj['ok'] = _.get(result, ['ok'], '')
                    obj['nModified'] = _.get(result, ['nModified'], '')
                    res.json(obj)
                }
            })
        } else {
            res.end()
        }
    } else {
        var tasks = []
        _.forEach(stations, function(station){
            var id = _.get(station, '_id')
            if(!_.isEmpty(id)) {
                var query = {'_id': id}
                tasks.push(updateSingle(query, station))
            }
        })
        async.parallelLimit(tasks, 2, function(error, result){
            if(error) {
                console.log('Failed in updating station'. error)
                next(error)
            } else {
                console.log(result)
                var obj = {}
                obj['ok'] = 1
                obj['nModified'] = 0
                if(!_.isEmpty(result)){
                    _.forEach(result, function(result){
                        obj['nModified'] += _.get(result, ['nModified'], 0)
                    })
                }
                res.json(obj)
            }
        })
    }
}

function updateSingle(queryCriteria, station) {
    return function(callback) {
        stationService.update(queryCriteria, station, function(error, result){
            if(error) {
                console.log('Failed in updating station'. error)
                callback(error, null)
            } else {
                var obj = {}
                obj['ok'] = _.get(result, ['ok'], '')
                obj['nModified'] = _.get(result, ['nModified'], '')
                callback(null, obj)
            }
        })
    }
}

function findStationStatistics(req, res, next) {
    var onDutyType = _.get(req, ['body', 'onDutyType'], ''),
        routeName = _.get(req, ['body', 'routeName'], ''),
        stationName = _.get(req, ['body', 'stationName'], ''),
        isLong = _.get(req, ['body', 'isLong']),
        searchQuery = {};
        console.log(isLong, _.isBoolean(isLong), _.isEmpty(isLong))
    if(onDutyType !== '') {
        if(!_.isEmpty(routeName)){
            searchQuery.name = routeName;
        }
        if(!_.isEmpty(stationName)){
            searchQuery['stations.name'] = {'$regex': stationName};
        }
        if(_.isBoolean(isLong)){
            searchQuery.isLong = isLong;
        }
        searchQuery.onDutyType = onDutyType;
        routeService.find(searchQuery, function(err, routes){
            if(err) {
                console.error('Failed in finding routes with onDutyType:', onDutyType, err);
                next(err);
            } else {
                if(_.isEmpty(routes)) {
                    res.json([]);
                } else {
                    var stationStatistics = [],
                        stationInfos = {};
                    _.forEach(routes, function(route){
                        var stationsInRoute = _.get(route, ['stations'], []);
                            _.forEach(stationsInRoute, function(station){
                                var statName = _.get(station, ['name'], ''),
                                    addFlag = false;
                                if(!_.isEmpty(stationName)){
                                    if(statName.indexOf(stationName) > -1){
                                        addFlag = true;
                                    }
                                } else {
                                    addFlag = true;
                                }
                                var routeName = route.name;
                                if(route.isLong) {
                                    routeName += '号线(长)';
                                } else {
                                    routeName += '号线';
                                }
                                if(addFlag) {
                                    if(_.indexOf(_.keys(stationInfos), statName) > -1) {
                                        stationInfos[statName].push(routeName);
                                    } else {
                                        var routesPassed = [];
                                        routesPassed.push(routeName);
                                        stationInfos[statName] = routesPassed;
                                    }
                                }
                            });
                    });
                    var stationKeys = _.keys(stationInfos);
                    var findUserTasks = [];
                    _.forEach(stationKeys, function(key){
                        findUserTasks.push(findUserProfile(key, onDutyType));
                    });
                    async.parallel(findUserTasks, function(parallelError, results){
                        if(parallelError) {
                            console.error('Error in finding users tasks', parallelError);
                            res.json([])
                        } else {
                            _.forEach(stationKeys, function(key){
                                var stationUserObj = _.find(results, {'stationName': key});
                                var obj = {};
                                if(!_.isEmpty(stationUserObj)) {
                                    obj.usersCount = _.get(stationUserObj, ['users'], []).length
                                }
                                obj.stationName = key;
                                obj.routes = stationInfos[key];
                                stationStatistics.push(obj)
                            })
                            res.json(stationStatistics);
                        }
                    })
                }
            }
        })

    } else {
        res.end();
    }
}

function findUserProfile(stationName, onDutyType) {
    return function(callback){
        var searchQuery = {};
        if(onDutyType=='TO_OFFICE'){
            searchQuery.onDutyStation = stationName;
        } else {
            searchQuery.offDutyStation = stationName;
        }
        userService.find(searchQuery, function(err, users){
            if(err) {
                console.error('Failed in finding users by stationsName %s and onDutyStation %s as %s', stationName, onDutyType, err);
                return callback(err, null)
            } else {
                var result = {};
                result.stationName = stationName;
                result.users = users;
                return callback(null, result);
            }
        })
    }
}

function findUserContactByStations(req, res, next){
    var onDutyType = _.get(req, ['body', 'onDutyType'], ''),
        stationNames = _.get(req, ['body', 'stations'], []),
        searchQuery = {};
    if(_.isEmpty(stationNames) || _.isEmpty(onDutyType))
        res.end();
    else {
        if(onDutyType === 'TO_OFFICE')
            searchQuery.onDutyStation = {$in: stationNames};
        else if(onDutyType === 'TO_HOME')
            searchQuery.offDutyStation = {$in: stationNames};
        console.log(searchQuery)
        userService.find(searchQuery, function(error, users){
            if(error) {
                console.log('Error in finding users', error);
                next(error);
            } else {
                // res.json(users);
                var userContacts = [];
                if(_.isEmpty(users)){
                    console.log('no user found by onDutyType %s and station names:%s', onDutyType, stationNames.join(','));
                    res.send(userContacts);
                } else {
                    _.forEach(users, function(user){
                        var userContact = {
                            stationName: '',
                            userName: _.get(user, ['name'], ''),
                            email: _.get(user, ['email'], ''),
                            phoneNumber: _.get(user, ['phoneNumber'], '')
                        }
                        if(onDutyType === 'TO_OFFICE')
                            userContact.stationName = _.get(user, ['onDutyStation'], '');
                        else if(onDutyType === 'TO_HOME')
                            userContact.stationName = _.get(user, ['offDutyStation'], '');
                        userContacts.push(userContact);
                    });
                    // userContacts = _.groupBy(userContacts, function(n){
                    //     return n.stationName;
                    // });
                    res.json(userContacts);
                }
            }
        })
    }
}