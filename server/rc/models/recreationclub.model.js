/**
 * Created by CHENLA2 on 11/03/2016.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var recreationClubSchema = new Schema({
    clubId: String,
    name: String,
    captain: {
        type: Schema.Types.ObjectId,
        ref: 'Loginuser'
    },
    icon: {
        type: String,
        default: '../images/clubs/club_default.jpg'
    },
    status: String,
    h5Template: {
        type: Schema.Types.ObjectId,
        ref: 'h5Template'
    },
    description: {
        type: String,
        default: '该队长很懒，什么都没留下。。'
    },
    createDateTime: {
        type: Date,
        default: Date.now
    },
    createBy: String,
    updateDateTime: {
        type: Date,
        default: Date.now
    },
    updateBy: String
});

recreationClubSchema.pre('findOneAndUpdate', function () {
	this.update({}, {$set: {updateDateTime: new Date()}});
});

mongoose.model('RecreationClub', recreationClubSchema);
