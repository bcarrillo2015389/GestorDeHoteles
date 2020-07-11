'use strict'


var express = require('express');
var hotelController = require('../controllers/hotel.controller');
var mdAuth = require('../middlewares/authenticated');
var mdAuthHotel = require('../middlewares/authenticatedHotel');

var api = express.Router();

api.post('/loginHotel', hotelController.loginHotel);
api.post('/saveHotel', mdAuth.ensureAuthAdmin, hotelController.saveHotel);
api.put('/updateHotel/:id', mdAuthHotel.ensureAuthHotel, hotelController.updateHotel);
api.delete('/removeHotel/:id', mdAuthHotel.ensureAuthHotel, hotelController.removeHotel);
api.get('/getHotels', mdAuth.ensureAuth, hotelController.getHotels);
api.get('/searchHotel', mdAuth.ensureAuth, hotelController.searchHotel);
api.get('/orderedSearch', mdAuth.ensureAuth, hotelController.orderedSearch);

module.exports = api;