/**
 * Created by CHENLA2 on 11/03/2016.
 */

var Controller = require('../controllers/recreationclub.server.controller');

module.exports = function(app, io) {
    app.route('/api/getNoFocusClubs/:clubs')
        .get(Controller.getNoFocusClubs(app,io));
    app.route('/api/focusClub')
        .post(Controller.focusClub(app,io));
    app.route('/api/registerActivity')
        .post(Controller.registerActivity(app,io));
    app.route('/api/saveRegisterActivity')
        .post(Controller.saveRegisterActivity(app,io));
    app.route('/api/deleteRegisterActivity')
        .post(Controller.deleteRegisterActivity(app,io));
    app.route('/api/getMyRegisterActivities/:commonUserId')
        .get(Controller.getMyRegisterActivities(app,io));
};
