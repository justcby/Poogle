/**
 * Created by SUKE3 on 11/28/2016.
 */

'use strict';

var mongoose = require('mongoose'),
    CommonUser = mongoose.model('CommonUser'),
    RecreationClub = mongoose.model('RecreationClub');

exports.getNoFocusClubs = getNoFocusClubs;
exports.focusClub = focusClub;

function getNoFocusClubs(clubs, callBackFn) {
    RecreationClub.find({RecreationClub: {$nin: clubs}}).exec(function (err, results) {
        if (err) {
            callBackFn(err, []);
        } else {
            callBackFn(null, results);
        }
    });
}

function focusClub(criteria, callBackFn) {
    CommonUser.update(
        {'userId': criteria.userId},
        {
            $addToSet: {
                favouriteClub: mongoose.Types.ObjectId(criteria.clubId)
            }
        }).exec(function (err, results) {
        if (err) {
            callBackFn(err, []);
        } else {
            console.log('on focusClub');
            callBackFn(null, results);
        }
    });
}