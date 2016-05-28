module.exports = function(app, moment, dataProvider, serviceProvider, logger) {

var Medicion = require("../lib/dto/Medicion.js");
var objMedicion = new Medicion();

var req = require('restler');
var async = require('async');
var server = "localhost";
var port = 9000;


/* INICIO API REST */

var dispositivos = {};
var motores = {};
var relays = {};
var sensores = {};
var datos = {};

var _DEBUG = true;




function TraerDatos(dataProvider, op, cb) {

if (datos.length > 0 && op != 'F') {
	if (_DEBUG) console.log("Cache HIT");
	cb(null,datos);
	return;
}


 
 async.series([
    function(callback){
        
        var url = 'http://' + server + ':' + port + '/api/dispositivos';
	    if (_DEBUG)
	    	console.log(url);
	    req.get(url).on('complete', function(data) {
	    	callback(null, data);
	    }).on('error', function(error, response) { 
	    	console.log("Servicio -> Error: " + error);
	    	callback(error, null);
	    });
    }
    ,
     function(callback){
        var url = 'http://' + server + ':' + port + '/api/motores';
	    if (_DEBUG)
	    	console.log(url);
	    req.get(url).on('complete', function(data) {
	    	callback(null, data);
	    }).on('error', function(error, response) { 
	    	console.log("Servicio -> Error: " + error);
	    	callback(error, null);
	    });
        
    }
    ,
     function(callback){
        var url = 'http://' + server + ':' + port + '/api/relays';
	    if (_DEBUG)
	    	console.log(url);
	    req.get(url).on('complete', function(data) {
	    	callback(null, data);
	    }).on('error', function(error, response) { 
	    	console.log("Servicio -> Error: " + error);
	    	callback(error, null);
	    });
    }
    ,
    function(callback){
        var url = 'http://' + server + ':' + port + '/api/sensores';
	    if (_DEBUG)
	    	console.log(url);
	    req.get(url).on('complete', function(data) {
	    	callback(null, data);
	    }).on('error', function(error, response) { 
	    	console.log("Servicio -> Error: " + error);
	    	callback(error, null);
	    });
    }
    
],
// optional callback
function(err, results){
    dispositivos = results[0];
    motores = results[1];
    relays = results[2];
    sensores = results[3];
    datos = results;
    cb(err, results);
});
 	
}


app.get('/api/v0/Servicio', function(request, response){

	TraerDatos(dataProvider, null, function(error, respuesta) {
		response.json(respuesta);
	});
});

app.get('/api/v0/Servicio/motores', function (request, response) {

});



};