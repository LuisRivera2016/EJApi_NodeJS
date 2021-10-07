const debug = require('debug')('app:inicio');//entorno depuraacion 
//const dbDebug = require('debug')('app:db');//entorno2 db
const express = require('express');
const Joi = require('@hapi/joi');
const logger = require('./logger');
const morgan = require('morgan');
const config = require('config');
const app = express();

//INVOCAN ANTES DE TIPO RUTA(SON MIDDLEWARE)
app.use(express.json());//json
app.use(express.urlencoded({extended:true}));//formulario
app.use(express.static('public'));//recursos estaticos

//COnfiguracion de Entornos
console.log('Aplicacion: '+ config.get('nombre'));
console.log('BD-Server: '+config.get('configDB.host'));

//Middleware Terceros(Morgan)
if(app.get('env') === 'development'){
    app.use(morgan('tiny'));
    //console.log('Morgan Habilitado');
    debug('Morgan esta habilitado');
}

//entorno DB
debug('Conectando con la BD');

//Creacion Middleware
app.use(function(req,res,next){
    console.log('Loggin.....');
    next();
})
//Middleware exportado
app.use(logger);

const usuarios = [
    {id:1, nombre:'Luis'},
    {id:2, nombre:'marios'},
    {id:3, nombre:'Ana'}
];

//--------------------------------------------------------------GET
app.get('/',(req,res) =>{
    res.send('Hola desde Express');
});

app.get('/api/usuarios',(req,res) =>{
    res.send(usuarios);
});

//PARAMETROS RUTA
app.get('/api/usuarios/:id',(req,res) =>{
    let usuario = existeUsuario(req.params.id);
       if(!usuario) res.status(404).send('El usuario no fue encontrado');
       res.send(usuario); 
    
});

//-------------------------------------------------------------POST
app.post('/api/usuarios', (req,res) =>{

    //validacion con JOI
    const schema = Joi.object({
        nombre: Joi.string()
            .min(3).required()

    });

    const {error,value} = validarUsuario(req.body.nombre);
    if(!error){
        const usuario = {
            id: usuarios.length + 1,
            nombre: value.nombre
        };
        usuarios.push(usuario);
        res.send(usuario);
    }else{
        //400 BAD Request
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
    }    
});

//-----------------------------------------------------------------PUT
app.put('/api/usuarios/:id',(req,res)=>{
    //encontrar usuario
    let usuario = existeUsuario(req.params.id);
    if(!usuario) {
        res.status(404).send('El usuario no fue encontrado');
        return;
    }
    
    const {error,value} = validarUsuario(req.body.nombre);

    if(error){
        //400 BAD Request
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
        return;
    }

    usuario.nombre = value.nombre;
    res.send(usuario);


});

//-------------------------------------------------------------DELETE
app.delete('/api/usuarios/:id',(req,res)=>{
    let usuario = existeUsuario(req.params.id);
    if(!usuario) {
        res.status(404).send('El usuario no fue encontrado');
        return;
    }
    const index = usuarios.indexOf(usuario);
    usuarios.splice(index,1);
    res.send(usuarios);
});


//Variable de Entorno
const port = process.env.PORT || 3000;

app.listen(port,()=>{
    console.log('Escuchando en el puerto',port);
})


function existeUsuario(id){
    return usuarios.find(u => u.id === parseInt(id));
}

function validarUsuario(nom){
    //validacion con JOI
    const schema = Joi.object({
        nombre: Joi.string()
            .min(3).required()

    });
    return schema.validate({nombre:nom});
}