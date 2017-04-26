/**
 * Created by ZOUDA on 12/19/2016.
 */
//var logger = require('../../../config/lib/logger');
var mongoose = require('mongoose'),
    BusRoute = mongoose.model('BusRoute'),
    BusRouteSchedule = mongoose.model('BusRouteSchedule'),
    _ = require('lodash'),
    noficicationController = require('../controllers/notification.app.controller'),
    routeService = require('../services/busRoute.server.service');

exports.publishBusRoute = publishBusRoute;

var PUBLISH_TIME_GAP = 1000 * 60 * 60 * 24;
var NOTIFICATION_TIME_GAP = 3 * 1000 * 60 * 60 * 24;

function publishBusRoute() {
    console.info('------------------- Bus route schedule begins at ' + new Date() + '--------------------');

    doScanScheduleForNotification(doScanScheduleForPublish);

    console.info('------------------- Bus route schedule ends at ' + new Date() + '--------------------');
}


function checkForActionPublish(schedule) {
    var result = false;
    if (schedule && schedule.activeDate) {
        var now = new Date();
        var realGap = schedule.activeDate - now;
        if (realGap < PUBLISH_TIME_GAP && realGap > 0) {
            result = true;
        }
    }
    return result;
}


//加标记
function checkForActionNotification(schedule) {
    var result = false;
    if (schedule && schedule.activeDate) {
        var now = new Date();
        var realGap = item.activeDate - now;
        if (realGap < NOTIFICATION_TIME_GAP && realGap > 0) {
            result = true;
        }
    }
    return result;
}


function doScanScheduleForPublish() {
    BusRouteSchedule.find({status: 'READY'}, function (error, schedules) {
        if (error) {
            console.info(error);
        } else {
            var now = new Date();
            _.each(schedules, function (item) {
                if (checkForActionPublish(item)) {
                    routeService.publishScheduledRoute(item);
                    console.info('publish route :');
                    console.info(item)
                }
            });
        }
    });
}


function doScanScheduleForNotification(callback) {
    var now = new Date();
    var future = new Date(now.valueOf() + (NOTIFICATION_TIME_GAP));
    var query = BusRouteSchedule.find({
        status: 'READY',
        activeDate: {'$gt': now, '$lt': future},
        msgSent: {'$ne': true}
    });
    query.then(function (schedules) {
        if (schedules && schedules.length > 0) {
            routeService.findPreviousPublishedRoute(schedules, function (err, oldOnes) {
                noficicationController.compareRoutes(schedules, oldOnes, function (err, notices) {
                    var ids = [];
                    for (var i = 0; i < schedules.length; i++) {
                        ids.push(schedules[i]._id);
                    }
                    BusRouteSchedule.update({'_id': ids}, {$set: {msgSent: true}}, function (err, result) {
                        if (result.n > 0) {
                            callback();
                        } else {
                            console.log(err);
                        }
                    });
                });
            });
        }
        else {
            callback();
        }
    });
    query.catch(function (err) {
        console.log(err);
    });

}