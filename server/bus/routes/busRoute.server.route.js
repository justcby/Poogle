/**
 * Created by ZOUDA on 11/10/2016.
 */
'use strict';

var controller = require('../controllers/busRoute.server.controller'),
    express = require('express'),
    config = require('../../../config/config')

module.exports = function (app) {
    var router = express.Router()

    router.route('/getRouteById/:routeId').get(controller.getRouteById)

    router.route('/find').post(controller.find)

    router.route('/findAll').get(controller.findAll)
    
    router.route('/findAllCombined').get(controller.findAllCombined)

    router.route('/saveOrPublish').post(controller.saveOrPublishRoute)

    router.route('/findRouteStatistics').post(controller.findRouteStatistics)

    router.route('/deleteRoute').post(controller.deleteRoute)

    router.route('/findUserContactByRoute').post(controller.findUserContactByRoute)

    router.route('/findRouteSchedule').post(controller.findRouteSchedule)

    app.use(config.contextPath + '/rest/bus/busroutes', router)
};