/**
 * Created by SUKE3 on 11/22/2016.
 */

'use strict';

var mongoose = require('mongoose'),
    SignupField = mongoose.model('SignupField');

exports.getAllFields = getAllFields;
exports.getAllSignupFields = getAllSignupFields;
exports.create = create;

function getAllFields(callBackFn) {
    SignupField.find(function (err, results) {
        if (err) {
            callBackFn(err, []);
        } else {
            callBackFn(null, results);
        }
    });
}

function getAllSignupFields(callBackFn) {
    console.log('dom.signupservice');
    SignupField.find(function (err, results) {
        if (err) {
            callBackFn(err, []);
        } else {
            callBackFn(null, results);
        }
    });
}

function create(signupFieldModel, callBackFn) {
    signupFieldModel.fieldKey = signupFieldModel.fieldKey.toLowerCase().replace(/(^\s*)|(\s*$)/g, "");
    SignupField.findOne({fieldKey: signupFieldModel.fieldKey}, function (err, existKey) {
        if (err) {
            return next(err);
        } else if (!existKey) {
            SignupField.create(signupFieldModel, function (err) {
                if (err) {
                    return callBackFn(err, null);
                } else {
                    return callBackFn(null, signupFieldModel);
                }
            });
        } else {
            var _id = existKey._id;
            SignupField.findByIdAndUpdate(_id, {
                $set: signupFieldModel
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