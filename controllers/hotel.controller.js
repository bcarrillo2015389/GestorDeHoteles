'use strict'

var Hotel = require('../models/hotel.model');
var bcrypt = require('bcrypt-nodejs');
var jwtHotel = require('../services/jwtHotel');

function saveHotel(req, res){
    var hotel  = new Hotel();
    var params = req.body;

    if(params.name && params.location && params.username && params.email && params.ceo && params.password && params.qualify && params.startDate &&
        params.endDate && params.price){
        if(params.qualify>5 || params.qualify<0){
            res.send({message:'La calificacion tiene que ser de 0 a 5.'});
        }else{
            Hotel.findOne({$or:[
                {name:params.name},
                {username:params.username},
                {location:params.location},
                {email:params.email}
            ]}, (err, enterpriseFind)=>{
                if(err){
                    res.status(500).send({message:'Error general, intentelo mas tarde.'});
                }else if(enterpriseFind){
                    res.send({message:'Algunos datos unicos ya han sido utilizados.'});
                }else{

                    hotel.name = params.name;
                    hotel.ceo = params.ceo;
                    hotel.location = params.location;
                    hotel.username = params.username;
                    hotel.email = params.email;
                    hotel.qualify = params.qualify;
                    hotel.startDate = params.startDate;
                    hotel.endDate = params.endDate;
                    hotel.price = params.price;
                    
                    bcrypt.hash(params.password, null, null, (err, passwordHash)=>{
                        if(err){
                            res.status(500).send({message:'Error al encriptar contraseña.'});
                        }else if(passwordHash){
                            hotel.password = passwordHash;
                        }else{
                            res.status(418).send({message:'Error inesperado.'});
                        }
                    });
    
                    hotel.save((err, hotelSaved)=>{
                        if(err){
                            res.status(500).send({message:'Erro general al guardar hotel.'});
                        }else if(hotelSaved){
                            res.send({message:'Hotel creado.', hotel: hotelSaved});
                        }else{
                            res.status(404).send({message:'Hotel no guardado.'});
                        }
                    });
                }
            });
        }
    }else{
        res.send({message:'Ingresa todos los datos.'});
    }
}

function loginHotel(req, res){
    var params = req.body;

    if(params.username || params.email){
        if(params.password){
            Hotel.findOne({$or:[
                {username:params.username},
                {email:params.email}
            ]},(err, hotelFind)=>{
                if(err){
                    res.status(500).send({message:'Error general'});
                }else if(hotelFind){
                    bcrypt.compare(params.password, hotelFind.password, (err, passwordOk)=>{
                        if(err){
                            res.status(500).send({message:'Error al comparar'});
                        }else if(passwordOk){
                            if(params.gettoken){
                                res.send({token:jwtHotel.createToken(hotelFind)});
                            }else{
                                res.send({message:'Bienvenido', hotel:hotelFind});
                            }
                        }else{
                            res.send({message:'Datos de hotel incorrectos.'});
                        }
                    });
                }else{
                    res.send({message:'Datos de hotel incorrectos.'});
                }
            });
        }else{
            res.send({message:'Ingresa la contraseña.'});
        }
    }else{
        res.send({message:'Ingresa el correo o el username.'});
    }
}

function updateHotel(req, res){
    let id = req.params.id;
    var update = req.body;

    if(id != req.user.sub){
        res.status(403).send({message:'Error de permisos para esta ruta.'});
    }else{
            Hotel.findOne({'_id':id}, (err, hotelFind)=>{
                if(err){
                    res.status(500).send({message:'Error general'});
                }else if(hotelFind){
                     var findName;
                     var findLocation;
                     var findUserName;
                     var findEmail;
        
                     if(!update.name){
                        findName = '';
                     }else if(update.name){
                        if(update.name == hotelFind.name){
                            findName = '';
                        }else{
                            findName = update.name;
                        }
                     }
        
                     if(!update.location){
                        findLocation = '';
                     }else if(update.location){
                        if(update.location == hotelFind.location){
                            findLocation = '';
                        }else{
                            findLocation = update.location;
                        }
                     }

                     if(!update.username){
                        findUserName = '';
                     }else if(update.username){
                        if(update.username == hotelFind.username){
                            findUserName = '';
                        }else{
                            findUserName = update.username;
                        }
                     }

                     if(!update.email){
                        findEmail = '';
                     }else if(update.email){
                        if(update.email == hotelFind.email){
                            findEmail = '';
                        }else{
                            findEmail = update.email;
                        }
                     }

                     Hotel.findOne({$or:[ {'name':findName},{'location':findLocation},{'username':findUserName},{'email':findEmail}]},(err, hotelOk)=>{
                        if(err){
                            res.status(500).send({message:'Error general, intentelo mas tarde.'});
                        }else if(hotelOk){
                            res.send({message:'Algunos datos unicos ya han sido utilizados.'});
                        }else{

                            if(update.password){
                                bcrypt.hash(update.password, null, null, (err, passwordHash)=>{
                                    if(err){
                                        res.status(500).send({message:'Error al encriptar contraseña.'});
                                    }else if(passwordHash){
                                        update.password = passwordHash;
                                        Hotel.findByIdAndUpdate(id, update, {new:true}, (err, hotelUpdated)=>{
                                            if(err){
                                                res.status(500).send({message:'Error general'});
                                            }else if(hotelUpdated){
                                                res.send({message:'Hotel; actualizado', hotel: hotelUpdated});
                                            }else{
                                                res.status(404).send({message: 'No se actualizo.'});
                                            }
                                        });
                                    }else{
                                        res.status(418).send({message:'Error inesperado.'});
                                    }
                                });
                             }else{
                                Hotel.findByIdAndUpdate(id, update, {new:true}, (err, hotelUpdated)=>{
                                    if(err){
                                        res.status(500).send({message:'Error general'});
                                    }else if(hotelUpdated){
                                        res.send({message:'Hotel; actualizado', hotel: hotelUpdated});
                                    }else{
                                        res.status(404).send({message: 'No se actualizo.'});
                                    }
                                });
                             }
                        }
                    });
                }else{
                    res.status(404).send({message:'Hotel inexistente'});
                }
            });
    }
}

function getHotels(req, res){
    Hotel.find({}, (err, hotelFind)=>{
        if(err){
            res.status(500).send({message: 'Error general'});
        }else if(hotelFind){
            if(hotelFind.length>0){
                res.send({hotels:hotelFind});
            }else{
                res.send({message:'No hay datos que mostrar'});
            }
        }else{
            res.status(404).send({message: 'No se encontraron hoteles.'});
        }
	});
}  

function removeHotel(req, res){
    let id = req.params.id;

    if(id != req.user.sub){
        res.status(403).send({message:'Error de permisos para esta ruta.'});
    }else{
        Hotel.findByIdAndRemove(id, (err, hotelRemoved)=>{
            if(err){
                res.status(500).send({message: 'Error general'});
            }else if(hotelRemoved){
                res.send({message:'Hotel eliminado.', hotel:hotelRemoved});
            }else{
                res.status(404).send({message: 'No se elimino de la BD.'});  
            }
        });
    }
}

function searchHotel(req, res){
    var params = req.body;

    if(params.search && !params.search2){
        Hotel.find({qualify:params.search}, (err, hotelFind)=>{
            if(err){
                res.status(500).send({message: 'Error general'});
            }else if(hotelFind.length>0){
                    res.send({hotel:hotelFind});
            }else{
                var searchDate = new Date(params.search);
                Hotel.find({startDate:{$lte:searchDate}, endDate:{$gte:searchDate}},(err, hotelFind)=>{
                    if(err){
                        res.status(500).send({message: 'Error general'});
                    }else if(hotelFind){
                        if(hotelFind.length>0){
                            res.send({hotel:hotelFind});
                        }else{
                            res.send({message:'No hay datos que mostrar.'});
                        }
                    }else{
                        res.send({message:'Resultado inexistentes.'});
                    }
                });
            }
        });
    }else if(params.search && params.search2){
        var date1 = new Date(params.search);
        var date2 = new Date(params.search2);

            Hotel.find({startDate:{$lte:date1}, endDate:{$gte:date2}},(err, hotelFind)=>{
                if(err){
                    res.status(500).send({message: 'Error general'});
                }else if(hotelFind){
                    if(hotelFind.length>0){
                        res.send({hotel:hotelFind});
                    }else{
                        res.send({message:'No hay datos que mostrar.'});
                    }
                }else{
                    res.send({message:'Resultado inexistentes.'});
                }
            });
    }
}

function orderedSearch(req, res){
    switch(req.body.search){
        case 'alfabetico':
            Hotel.find({}, (err, hotelFind)=>{
                if(err){
                    res.status(500).send({message: 'Error general'});
                }else if(hotelFind){
                    if(hotelFind.length>0){
                        res.send({hotel:hotelFind});
                    }else{
                        res.send({message:'No hay datos que mostrar'});
                    }
                }else{
                    res.send({message:'No se encontraron resultados.'});
                }
            }).sort({name:1});
            break;

        case 'precio ascendente':
            Hotel.find({}, (err, hotelFind)=>{
                if(err){
                    res.status(500).send({message: 'Error general'});
                }else if(hotelFind){
                    if(hotelFind.length>0){
                        res.send({hotel:hotelFind});
                    }else{
                        res.send({message:'No hay datos que mostrar'});
                    }
                }else{
                    res.send({message:'No se encontraron resultados.'});
                }
            }).sort({price:1});
            break;

        case 'precio descendente':
            Hotel.find({}, (err, hotelFind)=>{
                if(err){
                    res.status(500).send({message: 'Error general'});
                }else if(hotelFind){
                    if(hotelFind.length>0){
                        res.send({hotel:hotelFind});
                    }else{
                        res.send({message:'No hay datos que mostrar'});
                    }
                }else{
                    res.send({message:'No se encontraron resultados.'});
                }
            }).sort({price:-1});
            break;

        default:
            res.send({message:'Opcion incorrecta.'});
            break;
    }
}


module.exports = {
    saveHotel,
    loginHotel,
    updateHotel,
    removeHotel,
    getHotels,
    searchHotel,
    orderedSearch
}