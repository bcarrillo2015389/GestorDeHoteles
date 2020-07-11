'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var key = '1e45assdfa321';

exports.createToken = (user)=>{
    var payload = {
        sub: user._id,
        name:user.name,
        lastname:user.lastname,
        username:user.username,
        email:user.email,
        role:user.role,
        kind: '_USER',
        iat: moment().unix(),
        exp: moment().add(15, "minutes").unix()
    }

    return jwt.encode(payload, key);
}