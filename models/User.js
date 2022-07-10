const mongoose = require('mongoose')
const { Schema } = mongoose;

const UserSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    username:{
        type: String,
        required: true,
        // unique: true
    },
    email:{
        type: String,
        required: true,
        // unique: true
    },
    password:{
       type: String,
       required: true 
    },
    imageUrl:{
        type: String,
        required: true
    },
    userAuthId:{
        type: String,
        required: true
    },
    verified:{
        type: Boolean,
        required: true
    }
});

const CreateUser = mongoose.model('users', UserSchema);
module.exports = CreateUser;