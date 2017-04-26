'use strict';

/**
 * Module dependencies.
 */
var app = require('./config/lib/app');
//var schedule = require('node-schedule');
//var activitySchedule = require('./server/rc/schedule/clubActivity.schedule');
//var busSchedule = require('./server/bus/schedules/busRoute.schedule');

app.start();
//schedule.scheduleJob('0 0,30 * * * *', activitySchedule.runSchedule);
//schedule.scheduleJob('*/1 * * * *', activitySchedule.runSchedule);
//schedule.scheduleJob('0 0 13 * * *', busSchedule.publishBusRoute);