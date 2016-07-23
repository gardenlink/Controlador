
 /* MotorService
 * https://github.com/GardenLink
 * 
 * 2015 Diego Navarro M
 *
 */


var method = MotorService.prototype;


var _logger;
var debugMode = true;

var async = require("async");

var _DEBUG = true;


var ModelsDispositivo = require("../dto/Dispositivo.js");
var MotorEntity = require("../dto/Motor.js");
var Models = require("../dto/Motor.js");

var Arduino = require("../util/Arduino.js");
var arduino = new Arduino();


var lstMotores = [];
var lstDevices = [];


var dispositivos = [];
var motores = [];

var _srv;
var _dataProvider;



/*
 * MotorService
 * @constructor
 *
 * @description Inicializa y Configura los servicios que activan y desactivan los motores
 * @webDuinoHost url configurado para webduino
 * @webDuinoPort {Number} puerto configurado para webduino
 * @logger {object} objeto para registrar logs
 *
 */
function MotorService(dataProvider,srv,logger, callback) {
    _srv = srv;
   	this._logger = logger;
   	_dataProvider = dataProvider;
   	TraerDatos(dataProvider, callback);
}

function TraerDatos(dataProvider, cb) {

	dataProvider.Cache(true, function(error, data ) {
				dispositivos = data["Dispositivos"];
				motores = data["Motores"];
				cb(null,data);
			});
			
}

method.Refrescar = function(dataProvider, callback) {
	TraerDatos(dataProvider, callback);
};


method.Avanzar = function(idDevice, idMotor,callback) {
  
   LlamarServicio(idDevice, idMotor, "AVANZAR", callback);
  
};

method.Retroceder = function(idDevice, idMotor, callback)
{
  LlamarServicio(idDevice, idMotor, "RETROCEDER", callback);
};

method.Detener = function(idDevice, idMotor, callback)
{
	LlamarServicio(idDevice, idMotor, "DETENER", callback);
};

method.Estado = function(idDevice, idMotor, callback)
{
 	LlamarServicio(idDevice, idMotor, "ESTADO", callback);
};

method.Posicion = function (idDevice, idMotor, callback)
{
   LlamarServicio(idDevice, idMotor, "POSICION", callback);
};

method.ReporteMotor = function(idDevice, idMotor, callback)
{
	var Reporte = [];
	LlamarServicio(idDevice, idMotor, "ESTADO", function(error, data) { 
		
		if (error)
			return callback(error, null);
		
		LlamarServicio(idDevice, idMotor, "POSICION", function(err, doc) {
			if (err)
				return callback(err,null);
			
			
			data.Posicion = doc.Posicion;
			callback(null, data); 
		});

	});
	
}


function LlamarServicio(idDevice, idMotor, accion, callback)
{
	if (_DEBUG) 
		console.log("MotorService.LlamarServicio -> Parametros [" + idDevice + "][" + idMotor + "][" + accion + "]");
		
	var motorEncontrado = false;
	
	  		async.each(motores, function(result, callb) {
			  	
			  	if (result.IdDispositivo == idDevice && result.IdMotor == idMotor)
			  	{
			  		motorEncontrado = true;
			  		
			  		if (result.Habilitado) {
			  			var valor;
			  			var params;
			  			
			  			var pRelay = arduino.Dispositivos("Motor");
			  			var topic = arduino.Dispositivos("Board") + result.IdDispositivo + "/" + arduino.Dispositivos("Motor") + idMotor;
			  			
			  			var objMotor = new MotorEntity();
			  			
			  			objMotor.Crear(result.IdMotor, 
					   				   result.IdDispositivo,
					   				   result.Descripcion,
					   				   result.MarcaModelo,
					   				   result.Tipo,
					   				   result.Pin,
					   				   result.EsPinAnalogo,
					   				   result.Habilitado,
					   				   result.Posicion,
					   				   result.Accion,
					   				   result.Estado);
		  			
		  				switch (accion)
		  				{
		  					case "AVANZAR":
		  						console.log("Llega");
		  						params = pRelay+arduino.Operaciones("Motor").Avanzar + idMotor + result.Pin + arduino.cmd_escape();
		  						objMotor.Modificar(result.IdMotor, 
								   				   result.IdDispositivo,
								   				   result.Descripcion,
								   				   result.MarcaModelo,
								   				   result.Tipo,
								   				   result.Pin,
								   				   result.EsPinAnalogo,
								   				   result.Habilitado,
								   				   result.Posicion,
								   				   "Avanzando",
								   				   1);
				  			 			
		  						break;
		  						
		  					case "RETROCEDER":
		  						params = pRelay+arduino.Operaciones("Motor").Retroceder + idMotor + result.Pin + arduino.cmd_escape();
		  						objMotor.Modificar(result.IdMotor, 
								   				   result.IdDispositivo,
								   				   result.Descripcion,
								   				   result.MarcaModelo,
								   				   result.Tipo,
								   				   result.Pin,
								   				   result.EsPinAnalogo,
								   				   result.Habilitado,
								   				   result.Posicion,
								   				   "Retrocediendo",
								   				   2);
		  						break;
		  						
		  					case "DETENER":
		  						params = pRelay+arduino.Operaciones("Motor").Detener + idMotor + result.Pin + arduino.cmd_escape();
		  						objMotor.Modificar(result.IdMotor, 
								   				   result.IdDispositivo,
								   				   result.Descripcion,
								   				   result.MarcaModelo,
								   				   result.Tipo,
								   				   result.Pin,
								   				   result.EsPinAnalogo,
								   				   result.Habilitado,
								   				   result.Posicion,
								   				   "Detenido",
								   				   0);
		  						break;
		  						
		  					case "ESTADO":
		  						params = pRelay+arduino.Operaciones("Motor").Estado + idMotor + result.Pin + arduino.cmd_escape();
		  						var topic = arduino.Dispositivos("Board") + result.IdDispositivo + "/" + arduino.Dispositivos("Motor") + idMotor + "/" +arduino.Operaciones("Motor").Estado;
		  						_srv.Leer(topic, function(error, data) {
				  			 		if (error)
				  			 			return callback(error, null);
				  			 		
				  			 		if (_DEBUG)
				  			 			console.dir("MotorService.LlamarServicio -> Valor retornado por metodo Leer: " + data);
				  			 		return callback(null, data);
				  			 	});
		  						break;
		  						
		  					case "POSICION":
		  						params = pRelay+arduino.Operaciones("Motor").Posicion + idMotor + result.Pin + arduino.cmd_escape();
		  						var topic = arduino.Dispositivos("Board") + result.IdDispositivo + "/" + arduino.Dispositivos("Motor") + idMotor + "/" +arduino.Operaciones("Motor").Posicion;
		  						_srv.Leer(topic, function(error, data) {
				  			 		if (error)
				  			 			return callback(error, null);
				  			 		
				  			 		if (_DEBUG)
				  			 			console.dir("MotorService.LlamarServicio -> Valor retornado por metodo Leer: " + data);
				  			 		return callback(null, data);
				  			 	});
		  						
		  						break;
		  				}
		  				
		  				
		  				if (_DEBUG)
		  					console.log("Motor.LlamarServicio - Params: " + params);
		  				
	  					if (accion == "AVANZAR" || accion == "RETROCEDER" || accion == "DETENER") {
	  					
	  						_srv.Publicar(topic, params, function(error, data) {
			  			 		if (error)
			  			 			return callback(error, null);
			  			 		
			  			 		if (_DEBUG)
			  			 			console.dir("MotorService.LlamarServicio -> Valor retornado por metodo Publicar: " + data);
			  			 		
			  			 		
			  			 		/************ GUARDAR INFORMACION EN BD solo si estamos sincronizados con Arduino ***************/
			  			 		var status = data.substring(12,13);
			  			 		console.log("STATUS : " + status);
			  			 		
			  			 		if (status == "Y") {
			  			 			if (_DEBUG)
			  			 				console.log("GUARDO EN BD !! ");
			  			 				
			  			 			
								   	_dataProvider.Motor().Save(objMotor.Objeto().IdMotor, 
		    						   				   objMotor.Objeto().IdDispositivo,
		    						   				   objMotor.Objeto().Descripcion,
						    						   objMotor.Objeto().MarcaModelo,
						    						   objMotor.Objeto().Tipo,
						    						   objMotor.Objeto().Pin,
						    						   objMotor.Objeto().EsPinAnalogo,
						    						   objMotor.Objeto().Habilitado,
						    						   objMotor.Objeto().Posicion,
						    						   objMotor.Objeto().Accion,
						    						   objMotor.Objeto().Estado
		    						 				);	
		    						 				
		    						_dataProvider.Medicion().Save(arduino.TipoActuador("Motor"), objMotor.Objeto().IdMotor, objMotor.Objeto().IdDispositivo, objMotor.Objeto().Accion);
		    					}
		    					
		    					return callback(null, objMotor.Objeto());
	
		  					});
		  				}
			  			 
					}
					else {
						console.log("MotorService.LlamarServicio : Intento de trabajar con motor deshabilitado");
						return callback(new Error("MotorService.LlamarServicio : Intento de trabajar con motor deshabilitado", null));
					}
			  	}
			  	
			  }, function(error) { if (error) console.log("MotorService.LlamarServicio.LecturaAsyncRelays : error : " + error) });
	  		  
	  		  if (!motorEncontrado) {
	  		  	if (_DEBUG)
	  		  		console.log("motor no encontrado");
	  		  		callback(null, "");
	  		  }
	  		
	  	
}


module.exports = MotorService;