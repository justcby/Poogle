var mongoose = require('mongoose'),
    UserProfile = mongoose.model('UserProfile'),
    _ = require('lodash'),
    commonService = require('./common.server.service.js')

exports.find = commonService.createFind(UserProfile)
exports.findAll = commonService.createFindAll(UserProfile)