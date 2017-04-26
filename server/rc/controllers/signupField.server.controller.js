/**
 * Created by SUKE3 on 11/22/2016.
 */
'use strict';

//Load other application class
var SignupFieldService = require('../services/signupField.server.service');

exports.getAllSignupFields = getAllSignupFields;
exports.create=create;
//Define the interface of this class
function getAllSignupFields(app, io) {
    return function (req, res, next) {
        SignupFieldService.getAllSignupFields(function (err, result) {
            if (err) {
                return next(err);
            } else {
                return res.json(result);
            }
        });
    }
};
function create(req, res, next) {
    var signupFieldModel = req.body;
    SignupFieldService.create(signupFieldModel, function(err, result){
        if(err){
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }else{
            return res.status(200).json(result);
        }
    });
};