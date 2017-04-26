var mongoose = require('mongoose'),
    Schema = mongoose.Schema

var favoriteSchema = new Schema({
    type: String,
    name: String,
    additionalType: String, 
    category: String
});

var userProfileSchema = new Schema({
    openId: {
        type: String,
        required: true,
        unique: true
    },
    name: String,
    domainId: String,
    wechatId: String,
    wechatName: String,
    phoneNumber: String,
    email: String,
    department: String,
    onDutyStation: String,
    offDutyStation: String,
    firstLoginAt: Date,
    lastLoginAt: Date,
    createdBy: String,
    updatedBy: String,
    favorites: [favoriteSchema]
},{
    collection: 'userprofiles',
    timestamps: true
})

mongoose.model('UserProfile', userProfileSchema)