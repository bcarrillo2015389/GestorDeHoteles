'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var key = '5dadfas132435';

exports.createToken = (hotel)=>{
    var payload = {
        sub: hotel._id,
        name:hotel.name,
        username:hotel.username,
        email:hotel.email,
        kind:'_ENTERPRISE',
        iat: moment().unix(),
        exp: moment().add(15, "minutes").unix()
    }

    return jwt.encode(payload, key);
}