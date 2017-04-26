'use strict';
var _ = require('lodash');
var mongoose = require('mongoose');
var async = require('async');

var User = mongoose.model('Loginuser');
var RecreationClub = mongoose.model('RecreationClub');

exports.findForLogin = findForLogin;
exports.create = create;
exports.getUser = getUser;

function findForLogin(user, callBackFn){
    if(_.isEmpty(user)){
        return callBackFn({ message: 'Error User' }, null);
    }
    async.waterfall([
        function(cb){
             User.findOne({ userid: user.username.toLowerCase().replace(/(^\s*)|(\s*$)/g, "") }, function (err, doc) {
                if (err || !doc) {
                    return cb({message: 'your domain can not access the system!'}, null);
                } else {
                    var accountType = doc.accountType;
                    if (doc.authenticate(user.password)) {
                        var userInfo = {};
                        userInfo._id = doc._id;
                        userInfo.userid = doc.userid;
                        userInfo.role = doc.role;
                        return cb(null, userInfo);
                    } else {
                        return cb({ message: 'Error password' }, null);
                    }
                }
            });
        },
        function(userInfo, cb){
            if(_.isEqual(userInfo.role, 'admin')){
                return cb(null, userInfo);
            }
            RecreationClub.findOne({'captain' : userInfo._id}, function(err, club){
                if(!_.isEmpty(club)){
                    userInfo.club = {
                        '_id' : club._id,
                        'name': club.name
                    };
                    return cb(null, userInfo);
                }else{
                    return cb({message: 'No club owned by you, please contact admin!'}, null);
                }
            });
        }
    ], function(err, userInfo){
        if(err){
            return callBackFn(err, null);
        }
        return callBackFn(null, userInfo);
    });
}

function create(userModel, callBackFn){
    userModel.userid = userModel.userid.toLowerCase().replace(/(^\s*)|(\s*$)/g, "");
    User.findOne({ userid: userModel.userid }, function (err, orginalUser) {
        if (err) {
            return next(err);
        } else if (!orginalUser) {
            User.create(userModel, function (err) {
                if (err) {
                    return callBackFn(err, null);
                } else {
                    return callBackFn(null, userModel);
                }
            });
        } else {
            var _id = orginalUser._id;
            if (userModel.password) {
                userModel.password = User.hashPassword(userModel);
            }
            User.findByIdAndUpdate(_id, {
                $set: userModel
            }, function (err, doc) {
                if (err) {
                     return callBackFn(err, null);
                } else {
                    return callBackFn(null, doc);
                }
            });
        }
    });
}

function getUser(data, callBackFn){
    User.findOne({ userid: data.username.toLowerCase().replace(/(^\s*)|(\s*$)/g, "") }, function (err, doc) {
        if (err || !doc) {
            return callBackFn({message: 'your domain can not access the system!'}, null);
        }else{
            var userInfo = {};
            userInfo.userid = doc.userid;
            userInfo.role = doc.role;
            return callBackFn(null, userInfo);
        }
    });
}