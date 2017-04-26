/**
 * Created by CHENLA2 on 11/03/2016.
 */
'use strict';

var mongoose = require('mongoose'),
    moment = require('moment'),
    _ = require('lodash'),
    async = require('async'),
    ActivityUserModel = mongoose.model('ActivityUser'),
    RecreationClubModel = mongoose.model('RecreationClub'),
    ClubActivityModel = mongoose.model('ClubActivity'),
    CommonUserModel = mongoose.model('CommonUser'),
    SignupFieldModel = mongoose.model('SignupField'),
    AdminUserModel = mongoose.model('AdminUser');

exports.registerActivityInfo = registerActivityInfo;
exports.saveRegisterActivityInfo = saveRegisterActivityInfo;
exports.myRegisteredActivities = myRegisteredActivities;
exports.deleteRegisterActivityInfo = deleteRegisterActivityInfo;

function registerActivityInfo(critera, callBackFn) {
    var query = {
        activity: critera.activityId,
        commonUser: critera.commonUserId
    };
    if(_.isEmpty(_.get(critera, 'commonUserId', ''))){
        query.commonUser = null;
    }
    
    var tasks = [];
    tasks.push(function (asyncCallBack) {
        ActivityUserModel.findOne(query, function (err, activityUser) {
            if (err) return asyncCallBack(err, null);
            asyncCallBack(null, _.get(activityUser, 'fields', []));
        });
    });
    tasks.push(function (result, asyncCallBack) {
        if (!_.isEmpty(result)) {
            return asyncCallBack(null, result);
        }
        ClubActivityModel.findById({_id: critera.activityId})
        .populate('signupField')
        .exec(function (err, activity) {
            return asyncCallBack(err, _.get(activity, 'signupField', []));
        });
    });
    tasks.push(function (result, asyncCallBack) {
        if (!_.isEmpty(result)) {
            CommonUserModel.findById({_id: critera.commonUserId}, function (err, commonUser) {
                if (err) return asyncCallBack(err, null);
                _.get(_.find(result, {'fieldKey': 'cname'}), 'fieldValue', '');
                var cName = _.get(commonUser, 'cname', '');
                var eName = _.get(commonUser, 'ename', '');
                var email = _.get(commonUser, 'email', '');
                _.set(_.find(result, {'fieldKey': 'cname'}), 'fieldValue', cName);
                _.set(_.find(result, {'fieldKey': 'ename'}), 'fieldValue', eName);
                _.set(_.find(result, {'fieldKey': 'email'}), 'fieldValue', email);
                return asyncCallBack(null, result);
            });
        } else {
            return asyncCallBack(null, result);
        }
    });
    async.waterfall(tasks, function (err, result) {
        if (err) {
            var errorObj = {functionName: 'registerActivityInfo', errorMsg: err};
            return callBackFn(errorObj, null)
        }
        return callBackFn(null, result);
    });
    
   /* ActivityUserModel.findOne(query, function (err, activityUser) {
        if (err) return callBackFn(err, null);
        if (!_.isEmpty(activityUser)) {
            callBackFn(null, activityUser.fields);
        } else {
            ClubActivityModel.findById({_id: critera.activityId})
            .populate('signupField')
            .exec(function (err, activity) {
                if (err) return callBackFn(err, null);
                if (activity) {
                    console.log('The signupField are %s', activity.signupField);
                    callBackFn(null, activity.signupField);
                } else {
                    callBackFn(null, []);
                }
            });
        }
    });*/
}

function saveRegisterActivityInfo(registerInfo, callBackFn) {
    console.log('registerInfo in DOM: ' + registerInfo);
    var activityCount = 0;
    var tasks = [];
    tasks.push(function (asyncCallBack) {
        ActivityUserModel.count({activity: registerInfo.activity, commonUser: {$nin : [registerInfo.commonUser]}}, function (err, count) {
            if (err) return;
            activityCount = count + 1;
            ClubActivityModel.update({_id:registerInfo.activity}, {$set: {currentCount: activityCount}}, {new: true}, function (err, obj) {
                if (err) {
                    console.log(err);
                    callBackFn(err, "");
                } else {
                    asyncCallBack(null, obj);
                }
            });
        });
    });
    tasks.push(function (asyncCallBack) {
        var dbRegisterInfo = {
            commonUser: registerInfo.commonUser,
            activity: registerInfo.activity,
            fields: registerInfo.fields
        };
        var condition = {
            commonUser: registerInfo.commonUser,
            activity: registerInfo.activity
        };
        ActivityUserModel.update(condition, dbRegisterInfo, {upsert: true}, function (err, obj) {
            if (err) {
                console.log(err);
                callBackFn(err, "");
            } else {
                asyncCallBack(null, obj);
            }
        });
    });
    async.parallel(tasks, function (err, result) {
        if (err) {
            callBackFn({functionName: 'saveRegisterActivityInfo', errorMsg: err}, null)
        }
        callBackFn(null, {status: "success"});
    });

}

function myRegisteredActivities(userId, callBackFn) {
    console.log('myRegisteredActivities : with userId ' + userId);
    ActivityUserModel.find({commonUser: userId})
    .populate('activity')
    .exec(function (err, activities) {
        if (err) return callBackFn(err, null);
        console.log('The activities are %s', activities);
        callBackFn(null, activities);
    });
}

function deleteRegisterActivityInfo(registerInfo, callBackFn) {
    console.log('deleteRegisterActivityInfo in DOM: ' + registerInfo);
    var activityCount = 0;
    var tasks = [];
    tasks.push(function (asyncCallBack) {
        ActivityUserModel.count({
            activity: registerInfo.activity//,
            //commonUser: {$nin: [registerInfo.commonUser]}
        }, function (err, count) {
            if (err) return;
            activityCount = count - 1;
            ClubActivityModel.update({_id: registerInfo.activity}, {$set: {currentCount: activityCount}}, {new: true}, function (err, obj) {
                if (err) {
                    console.log(err);
                    callBackFn(err, "");
                } else {
                    asyncCallBack(null, obj);
                }
            });
        });
    });
    tasks.push(function (asyncCallBack) {
        var condition = {
            commonUser: registerInfo.commonUser,
            activity: registerInfo.activity
        };
        ActivityUserModel.find(condition, function (err, activityUser) {
            if (err) {
                console.log(err);
                return callBackFn(err, "");
            }
            if (activityUser.length <= 0) {
                return callBackFn("", "");
            }
            activityUser[0].remove(function (err, data) {
                if (err) {
                    return callBackFn(err, "");
                }
                asyncCallBack(null, activityUser);
            });
        });
    });
    async.parallel(tasks, function (err, result) {
        if (err) {
            callBackFn({functionName: 'deleteRegisterActivityInfo', errorMsg: err}, null)
        }
        callBackFn(null, {status: "success"});
    });

}