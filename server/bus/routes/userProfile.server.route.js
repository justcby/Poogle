'use strict'

var controller = require('../controllers/userProfile.server.controller.js'),
    express = require('express'),
    config = require('../../../config/config')

module.exports = function(app) {
    var router = express.Router()

    router.route('/find').post(controller.find)

    router.route('/findAll').post(controller.findAll).get(controller.findAll)

    app.use(config.contextPath + '/rest/bus/userprofile', router)
}