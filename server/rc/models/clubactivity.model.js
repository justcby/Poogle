/**
 * Created by CHENLA2 on 11/10/2016.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ClubActivitySchema = new Schema({
    title: String,
    club: {
        type: Schema.Types.ObjectId,
        ref: 'RecreationClub'
    },
    clubName: String,
    description: String,
    location: String,
    regBeginDate: Date,
    cutoffDate: Date,
    registRange: String,
    link: String,
    cover: String,
    currentCount: {
        type: Number,
        default: 0
    },
    totalCount: Number,
    h5Show: {
        type: Schema.Types.ObjectId,
        ref: 'H5Temp'
    },
    signupField: [{type: Schema.Types.ObjectId, ref: 'SignupField'}],
    startDateTime: Date,
    endDateTime: Date,
    activityRange: String,
    createDateTime: {
        type: Date,
        default: Date.now
    },
    updateDateTime: {
        type: Date,
        default: Date.now
    },
    status: String
});

ClubActivitySchema.pre('findOneAndUpdate', function () {
	this.update({}, {$set: {updateDateTime: new Date()}});
});

mongoose.model('ClubActivity', ClubActivitySchema);