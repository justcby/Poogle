/**
 * Created by lica4 on 11/16/2016.
 */

var Controller = require('../controllers/upfile.server.controller');

module.exports = function(app) {

    app.route('/api/addUpfile')
        .post(Controller.addUpfile);
    app.route('/api/getUpfiles')
        .post(Controller.getUpfiles);
    app.route('/api/deleteUpfiles')
        .post(Controller.deleteUpfiles);
};
