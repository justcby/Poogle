/**
 * Created by CHENLA2 on 11/03/2016.
 */
'use strict';

var _ = require('lodash');
var RecreationClubService = require('../services/recreationclub.server.service');
var CommonUserService = require('../services/commonUser.server.service');

exports.getNoFocusClubs = getNoFocusClubs;
exports.focusClub = focusClub;
exports.registerActivity = registerActivity;
exports.saveRegisterActivity = saveRegisterActivity;
exports.getMyRegisterActivities = getMyRegisterActivities;
exports.deleteRegisterActivity = deleteRegisterActivity;

function getNoFocusClubs(app, io) {
    return function (req, res, next) {
        var clubs = req.params.clubs;
        CommonUserService.getNoFocusClubs(clubs, function (err, result) {
            if (err) {
                return next(err);
            } else {
                return res.json(result);
            }
        });
    }
}

function focusClub(app, io) {
    return function (req, res, next) {
        // var userInfo = JSON.parse(req.session.userInfo);
        console.log(req.body);
        var criteria = {
            userId: req.body.userId,
            clubId: req.body.clubId
        }
        CommonUserService.focusClub(criteria, function (err, result) {
            if (err) {
                return next(err);
            } else {
                return res.json(result);
            }
        });
    }
}

function registerActivity(app, io) {
    return function (req, res, next) {
        //var activityId = req.params.activityId;
        var body = req.body;
        RecreationClubService.registerActivityInfo(body, function (err, result) {
            if (err) {
                return next(err);
            } else {
                return res.json(result);
            }
        });
    }
}

function saveRegisterActivity(app, io) {
    return function (req, res, next) {
        var registerInfo = req.body;
        RecreationClubService.saveRegisterActivityInfo(registerInfo, function (err, result) {
            if (err) {
                return next(err);
            } else {
                return res.json(result);
            }
        });
    }
}

function getMyRegisterActivities(app, io) {
    return function (req, res, next) {
        var userId = req.params.commonUserId;
        RecreationClubService.myRegisteredActivities(userId, function (err, result) {
            if (err) {
                return next(err);
            } else {
                return res.json(result);
            }
        });
    }
}

function deleteRegisterActivity(app, io) {
    return function (req, res, next) {
        var query = {
            activity: _.get(req, 'body.activity', ''),
            commonUser: _.get(req, 'body.commonUser', '')
        };
        RecreationClubService.deleteRegisterActivityInfo(query, function (err, result) {
            if (err) {
                return next(err);
            } else {
                return res.json(result);
            }
        });
    }
}