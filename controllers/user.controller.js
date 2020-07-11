'use strict'
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user.model');
var jwt = require('../services/jwt');

function login(req, res){
    var params = req.body;

    if(params.username || params.email){
        if(params.password){
            User.findOne({$or:[
                {username:params.username},
                {email:params.email}
            ]},(err, userFind)=>{
                if(err){
                    res.status(500).send({message:'Error general'});
                }else if(userFind){
                    bcrypt.compare(params.password, userFind.password, (err, passwordOk)=>{
                        if(err){
                            res.status(500).send({message:'Error al comparar'});
                        }else if(passwordOk){
                            if(params.gettoken){
                                res.send({token:jwt.createToken(userFind)});
                            }else{
                                res.send({message:'Bienvenido', user:userFind});
                            }
                        }else{
                            res.send({message:'Datos de usuario incorrectos.'});
                        }
                    });
                }else{
                    res.send({message:'Datos de usuario incorrectos.'});
                }
            });
        }else{
            res.send({message:'Ingresa tu contraseña.'});
        }
    }else{
        res.send({message:'Ingresa tu correo o tu username.'});
    }
}

function saveUser(req, res){
    var user = new User();
    var params = req.body;

    if(params.name && params.lastname && params.username && params.password && params.email){
        User.findOne({$or:[
            {username:params.username},
            {email:params.email}]}, (err, userFind)=>{
            if(err){
                res.status(500).send({message:'Error general, intentelo mas tarde.'});
            }else if(userFind){
                res.send({message:'Usuario o correo ya utilizado.'});
            }else{
                user.name = params.name;
                user.lastname = params.lastname;
                user.username = params.username;
                user.email = params.email;
                user.role = 'USER';
                
                bcrypt.hash(params.password, null, null, (err, passwordHash)=>{
                    if(err){
                        res.status(500).send({message:'Error al encriptar contraseña.'});
                    }else if(passwordHash){
                        user.password = passwordHash;
                    }else{
                        res.status(418).send({message:'Error inesperado.'});
                    }
                });

                user.save((err, userSaved)=>{
                    if(err){
                        res.status(500).send({message:'Error general al guardar empresa.'});
                    }else if(userSaved){
                        res.send({message:'Usuario creado.', user: userSaved});
                    }else{
                        res.status(404).send({message:'Usuario no guardado.'});
                    }
                });
            }
        });
    }else{
        res.send({message:'Ingresa todos los datos.'});
    }
}

function updateUser(req, res){
    let id = req.params.id;
    var update = req.body;

    if(id != req.user.sub){
        res.status(403).send({message:'Error de permisos para esta ruta.'});
    }else{
        if(update.role){
            res.send({message:'No es posible actualizar el role del usuario.'});
        }else{
            User.findOne({'_id':id}, (err, userFind)=>{
                if(err){
                    res.status(500).send({message:'Error general'});
                }else if(userFind){
                    var findUserName;
                    var findEmail;

                    if(!update.username){
                        findUserName = '';
                     }else if(update.username){
                        if(update.username == userFind.username){
                            findUserName = '';
                        }else{
                            findUserName = update.username;
                        }
                     }

                     if(!update.email){
                        findEmail = '';
                     }else if(update.email){
                        if(update.email == userFind.email){
                            findEmail = '';
                        }else{
                            findEmail = update.email;
                        }
                     }

                     User.findOne({$or:[{'username':findUserName},{'email':findEmail}]},(err, userOk)=>{
                        if(err){
                            res.status(500).send({message:'Error general, intentelo mas tarde.'});
                        }else if(userOk){
                            res.send({message:'Usuario o correo ya utilizado.'});
                        }else{

                            if(req.body.password){
                                bcrypt.hash(req.body.password, null, null, (err, passwordHash)=>{
                                    if(err){
                                        res.status(500).send({message:'Error al encriptar contraseña.'});
                                    }else if(passwordHash){
                                        update.password = passwordHash;
                                        User.findByIdAndUpdate(id, update, {new:true}, (err, userUpdated)=>{
                                            if(err){
                                                res.status(500).send({message:'Error general'});
                                            }else if(userUpdated){
                                                res.send({message:'Usuario actualizado', user: userUpdated});
                                            }else{
                                                res.status(404).send({message: 'No se actualizo.'});
                                            }
                                        });
                                    }else{
                                        res.status(418).send({message:'Error inesperado.'});
                                    }
                                });
                             }else{
                                User.findByIdAndUpdate(id, update, {new:true}, (err, userUpdated)=>{
                                    if(err){
                                        res.status(500).send({message:'Error general'});
                                    }else if(userUpdated){
                                        res.send({message:'Usuario actualizado', user: userUpdated});
                                    }else{
                                        res.status(404).send({message: 'No se actualizo.'});
                                    }
                                });
                             }
                             
                        }
                    });
                }else{
                    res.status(404).send({message:'Empresa inexistente o empleado no encontrado.'});
                }
            });
        }
    }
}

function removeUser(req, res){
    let id = req.params.id;

    if(id != req.user.sub){
        res.status(403).send({message:'Error de permisos para esta ruta.'});
    }else{
        User.findByIdAndRemove(id, (err, userRemoved)=>{
            if(err){
                res.status(500).send({message: 'Error general'});
            }else if(userRemoved){
                res.send({message:'Usuario eliminado.', user:userRemoved});
            }else{
                res.status(404).send({message: 'No se elimino de la BD.'});  
            }
        });
    }
}

function getUsers(req, res){
    User.find({}, (err, userFind)=>{
        if(err){
            res.status(500).send({message: 'Error general'});
        }else if(userFind){
            if(userFind.length>0){
                res.send({users:userFind});
            }else{
                res.send({message:'No hay datos que mostrar'});
            }
        }else{
            res.status(404).send({message: 'No se encontraron usuarios.'});
        }
	});
} 

module.exports = {
    login,
    saveUser,
    updateUser,
    removeUser,
    getUsers
}