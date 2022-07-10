const mongoose = require('mongoose');
require('dotenv').config();

const ConnectToMongo = ()=>{
    mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false}, ()=>{
        console.log("Successfully Connected Mongo")
    })
}

module.exports = ConnectToMongo;