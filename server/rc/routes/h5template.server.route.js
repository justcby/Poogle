/**
 * Created by lica4 on 11/16/2016.
 */

var Controller = require('../controllers/h5template.server.controller');

module.exports = function(app) {

    app.route('/api/getH5TemplatesByUser')
        .post(Controller.getH5TemplatesByUser);
    app.route('/api/selectTemplateById')
        .post(Controller.selectTemplateById);
    app.route('/api/deleteTemplateById')
        .post(Controller.deleteTemplateById);
    app.route('/api/createTemplateFromWS')
        .post(Controller.createTemplateFromWS);
};
