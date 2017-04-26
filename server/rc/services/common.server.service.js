var _ = require('lodash')

exports.createFind = createFind
exports.createFindAll = createFindAll
exports.createSave = createSave
exports.createUpsert = createUpsert

function createFind(model){
    if(!_.isEmpty(model)){
        return function(searchQuery, callback){
            model.find(searchQuery, function (err, objects) {
                if (err) callback(err, null);
                else callback(null, objects);
            })
        }
    }
}

function createFindAll(model){
    if(!_.isEmpty(model)){
        return function(callback) {
            model.find({}, function(error, objects){
                if(error) callback(error, null)
                else callback(null, objects)
            })
        }
    }
}

function createUpsert(model){
    if(!_.isEmpty(model)){
        return function(condition, obj, callback) {
            model.update(condition, obj, {upsert: true}, function(err, object){
                if(err) callback(err, null)
                else callback(null, object)
            })
        }
    }
}

function createSave(model){
    if(!_.isEmpty(model)) {
        return function(condition, obj, callback) {
            model.findOne(condition, function(err, object){
                if(err) callback(err, null)
                else if(!_.isEmpty(object)) callback(null, {exists: 1})
                else {
                    var entity = new model(obj)
                    entity.save(obj, function(error, result){
                        if(error) callback(error, null)
                        else callback(null, result)
                    })
                }
            })
        }
    }
}