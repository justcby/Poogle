'use strict'

var controller = require('../controllers/busStation.server.controller.js'),
    express = require('express'),
    config = require('../../../config/config')

module.exports = function(app) {
    var router = express.Router()

    router.route('/find').post(controller.find)

    router.route('/findAll').post(controller.findAll).get(controller.findAll)
    
    router.route('/disableStation').post(controller.disableStation)

    router.route('/create').post(controller.create)

    router.route('/update').post(controller.update)

    router.route('/updateAll').post(controller.updateAll)

    router.route('/findStationStatistics').post(controller.findStationStatistics)

    router.route('/findUserContactByStations').post(controller.findUserContactByStations)

    app.use(config.contextPath + '/rest/bus/busstation', router)
}