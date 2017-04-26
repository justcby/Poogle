/**
 * Created by SUKE3 on 11/22/2016.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SignupField = new Schema({
    fieldKey: String,
    fieldName: String,
    fieldType: String,
    fieldOption: String,
    fieldValue : String
});

mongoose.model('SignupField', SignupField);