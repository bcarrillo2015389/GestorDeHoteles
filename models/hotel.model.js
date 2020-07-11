'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var hotelSchema = Schema({
    name:String,
    ceo:String,
    location:String,
    username:String,
    email:String,
    password:String,
    startDate:Date,
    endDate:Date,
    qualify:String,
    price:Number
});

module.exports = mongoose.model('hotel', hotelSchema);