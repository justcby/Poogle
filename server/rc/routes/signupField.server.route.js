/**
 * Created by SUKE3 on 11/22/2016.
 */
var SignupFieldController = require('../controllers/signupField.server.controller');

module.exports = function (app, io) {
    app.route('/api/signupField').post(SignupFieldController.create);
    app.route('/api/v1/signupField').post(SignupFieldController.create);
};
