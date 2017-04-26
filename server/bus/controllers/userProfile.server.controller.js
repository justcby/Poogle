'use strict'

var userProfileService = require('../services/userProfile.server.service.js'),
    _ = require('lodash')

exports.find = find
exports.findAll = findAll


function find(req, res, next) {
    var searchQuery = req.body
    if(!_.isEmpty(searchQuery)) {
        userProfileService.find(searchQuery, function(error, users){
            if(error) {
                console.error('Failed in finding users as', error)
                next(error)
            } else {
                res.json(users)
            }
        })
    } else {
        res.end()
    }
}

function findAll(req, res, next) {
    userProfileService.findAll(function(err, users){
        if(err) {
            console.error('Failed in finding all users as', err)
            next(err)
        } else {
            res.json(users)
        }
    })
}