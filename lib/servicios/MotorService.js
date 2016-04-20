
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

var ArestLibrary = require("./Arest.js");
var arduinoService; 

var ModelsDispositivo = require("../dto/Dispositivo.js");
var MotorEntity = require("../dto/Motor.js");
var Models = require("../dto/Motor.js");


var lstMotores = [];
var lstDevices = [];


var dispositivos = [];
var motores = [];




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
function MotorService(dataProvider,logger, callback) {
   
   	this._logger = logger;
	TraerDatos(dataProvider, function(error, data) {
		if (error) return callback(error, null);
		console.log("MotorService.Constructor : Finaliza Inicializacion de datos de MotorService");
	});
}

function TraerDatos(dataProvider, cb) {
	
  
 async.series([
    function(callback){
        InitDevice(dataProvider, function(err, data) { 
        	callback(err, data);
        });
    }
    ,
     function(callback){
        InitMotor(dataProvider, function(err, data) { 
        	callback(err, data);
        });
        
    }
],
// optional callback
function(err, results){
    dispositivos = results[0];
    motores = results[1];
    cb(err, results);
});
 	
}




function InitDevice (dataProvider, callback)
{
	lstDevices = [];
	 dataProvider.Device().GetAll(function (err, data){
  			if (err) {
  				return callback(err, null);
  			}
  				
	   		if (data && data.length > 0)
	   		{
	   			 async.each(data, function(doc, cb) {
	   			 
	   			 	if (doc.Habilitado && doc.Estado) {
			            var deviceModel = new ModelsDispositivo();
			            deviceModel.Crear(doc.Id, 
			            				  doc.Nombre, 
			            				  doc.Tipo, 
			            				  doc.Ip, 
			            				  doc.Puerto, 
			            				  doc.Habilitado, 
			            				  doc.Estado, 
			            				  doc.FrecuenciaMuestreo);
			        	var srv = new ArestLibrary(doc.Ip + ":" + doc.Puerto);
			            deviceModel.AddServicio(srv);
			            
			            if (!DeviceExists(lstDevices, deviceModel.Objeto()))
			            	lstDevices.push(deviceModel.Objeto());
			            	
			            
		            }
		          }, function(error) { if (_DEBUG) console.log("MotorService.Inicializar : Error al leer async  error : " + error); });
		     }
		     
		     return callback(null, lstDevices); 
   		});
   		
}

function InitMotor(dataProvider, callback) {

	lstMotores = [];
  dataProvider.Motor().GetAll(function (err, data){
  			if (err) {
  				return callback(err, null);
  			}
  				
	   		if (data && data.length > 0)
	   		{
	   			 async.each(data, function(doc, cb) {
	   			 
	   			 	if (doc.Habilitado) {
	   			 	
			            var motorModel = new Models();
			            motorModel.Crear(doc.IdMotor,
			            				  doc.IdDispositivo, 
			            				  doc.Descripcion, 
			            				  doc.MarcaModelo, 
			            				  doc.Tipo, 
			            				  doc.Pin, 
			            				  doc.EsPinAnalogo,
			            				  doc.Habilitado,
			            				  doc.Posicion,
			            				  doc.Accion,
			            				  doc.Estado);
			            
			            if (!MotorExists(lstMotores, motorModel.Objeto()))
			            	lstMotores.push(motorModel.Objeto());
			            
		            }
		          }, function(error) { if (_DEBUG) console.log("MotorService.InitMotor : Error al leer async  error : " + error); });
		     }
		     
		     callback (null, lstMotores);
   		});
}

function MotorExists(lst, value) {
	
	var retorno = false;
	if (!lst || lst.length == 0)
	 return false;
	
	async.each(lst, function(item , cb) {
	   		
   			 if (item) {
   			 	retorno = true;
   			 }
	   			
	}, function(error) { if (_DEBUG) console.log("MotorService.MotorExists : Error al leer async en metodo MotorExists error : " + error); retorno = false; });
	
	return retorno;
	
}

function DeviceExists(lst, value) {
	
	retorno = false;
	
	if (!lst || lst.length == 0)
	 return false;
	
	async.each(lst, function(item , cb) {
	   			 
	   			 if (item && item.IdDispositivo && item.IdDispositivo == value) {
	   			 	retorno = true;
	   			 }
	   			
	}, function(error) { if (_DEBUG) console.log("MotorService.DeviceExists : Error al leer async en mettodo DeviceExists() error : " + error); retorno = false; });
	return retorno;
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
	 async.each(dispositivos, function(doc, cb) {
	  	if (doc.Id == idDevice) {
	  		async.each(motores, function(result, callb) {
			  	
			  	if (result.IdDispositivo == idDevice && result.IdMotor == idMotor)
			  	{
			  		if (result.Habilitado) {
			  			var valor;
			  			var params;
			  			
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
		  						params = "A" + idMotor;
		  						break;
		  						
		  					case "RETROCEDER":
		  						params = "R" +idMotor;
		  						break;
		  						
		  					case "DETENER":
		  						params = "D" +idMotor;
		  						break;
		  						
		  					case "ESTADO":
		  						params = "E" +idMotor;
		  						break;
		  						
		  					case "POSICION":
		  						params = "P" +idMotor;
		  						break;
		  				}
		  				
		  				
		  				
		  				console.log("Motor.LlamarServicio - Params: " + params);
		  				
		  				doc.Servicio.callFunction("Motor", params, function(error, data){
		  					
		  					//TODO: Mejorar esto
		  					if (error) {
		  						console.log("Motor.LlamarServicio - ERROR: " + error);
		  						return callback(error, null);
		  					}
		  					
		  					switch (accion)
			  				{
			  					case "AVANZAR":
			  						
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
			  						objMotor.Modificar(result.IdMotor, 
									   				   result.IdDispositivo,
									   				   result.Descripcion,
									   				   result.MarcaModelo,
									   				   result.Tipo,
									   				   result.Pin,
									   				   result.EsPinAnalogo,
									   				   result.Habilitado,
									   				   result.Posicion,
									   				   result.Accion,
									   				   data);
			  						break;
			  						
			  					case "POSICION":
			  						objMotor.Modificar(result.IdMotor, 
									   				   result.IdDispositivo,
									   				   result.Descripcion,
									   				   result.MarcaModelo,
									   				   result.Tipo,
									   				   result.Pin,
									   				   result.EsPinAnalogo,
									   				   result.Habilitado,
									   				   data,
									   				   result.Accion,
									   				   result.Estado);
			  						break;
			  				}
		  					
		  					return callback(null, objMotor.Objeto());
		  				});
		  				
					}
					else {
						console.log("MotorService.LlamarServicio : Intento de trabajar con motor deshabilitado");
						return callback(new Error("MotorService.LlamarServicio : Intento de trabajar con motor deshabilitado", null));
					}
			  	}
			  	
			  }, function(error) { if (error) console.log("MotorService.LlamarServicio.LecturaAsyncRelays : error : " + error) });
	  		
	  		
	  	}
	  }, function(error) { if (error) console.log("MotorService.LlamarServicio.LecturaAsyncDispositivos : error : " + error) });
}


module.exports = MotorService;