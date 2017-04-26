'use strict';
var _ = require('lodash');
var async = require('async');
var util = require('util');
var mongoose = require('mongoose');
var ClubActivityModel = mongoose.model('ClubActivity');

exports.runSchedule = runSchedule;

function runSchedule() {
    var tasks = [];
    tasks.push(findNeedToUpdateActivity());
    tasks.push(updateActivity());
    async.waterfall(tasks, function (err, result) {
        if (err) {
            console.error(JSON.stringify(err));
            return;
        }
        console.log('Update activity status success');
    });
}

function findNeedToUpdateActivity() {
    return function (asyncCallback) {
        ClubActivityModel.find({ 'status': { $nin: ['待审核', '已结束'] } }, function (err, activities) {
            if (err) {
                console.error(JSON.stringify(err));
                return asyncCallback(null, []);
            }
            return asyncCallback(null, activities);
        });
    };
}

function updateActivity() {
    return function (activities, asyncCallback) {
        if (_.isEmpty(activities)) {
            return asyncCallback(null, {});
        }
        var parallelTasks = [];
        _.forEach(activities, function (activity) {
            parallelTasks.push(function (parallelCb) {
                var now = (new Date()).valueOf();
                var regBeginDate = _.isDate(activity.regBeginDate)? activity.regBeginDate.valueOf() :now+1;
                var cutoffDate = _.isDate(activity.cutoffDate)? activity.cutoffDate.valueOf() :now+1;
                var startDateTime = _.isDate(activity.startDateTime)? activity.startDateTime.valueOf() :now+1;
                var endDateTime = _.isDate(activity.endDateTime)? activity.endDateTime.valueOf() :now+1;
                var status = activity.status;
                if (now >= regBeginDate) {
                    status = '正在报名';
                }
                if (now >= cutoffDate) {
                    status = '截止报名';
                }
                if (now >= startDateTime) {
                    status = '进行中';
                }
                if (now >= endDateTime) {
                    status = '已结束';
                }
                activity.status = status;
                ClubActivityModel.update({ '_id': activity._id }, activity.toObject(), function (err, dbCase) {
                    if (err) {
                        parallelCb(err, null);
                    } else {
                        parallelCb(null, dbCase);
                    }
                });
            });
        });
        async.parallel(parallelTasks, function(err, dbCases){
            if(err){
                console.error(err);
                return asyncCallback(null, {});
            }else{
                 return asyncCallback(null, {});
            }
        });
    };
}