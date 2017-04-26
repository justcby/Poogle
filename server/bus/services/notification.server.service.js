var mongoose = require('mongoose'),
    Notification = mongoose.model('Notification');

exports.save = save;

function save(notiObj, callback){
    var notification = new Notification(notiObj);
    notification.save(function(err, result){
        if(err) callback(err, null);
        else callback(null, result);
    });
}