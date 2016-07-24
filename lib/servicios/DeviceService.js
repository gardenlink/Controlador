
 /* DeviceService
 * https://github.com/GardenLink
 * 
 * 2016 Diego Navarro M
 *
 */


var method = DeviceService.prototype;


var _logger;
var debugMode = true;

var async = require("async");

var arduinoService; 

var ModelsDispositivo = require("../dto/Dispositivo.js");
var Models = require("../dto/Dispositivo.js");

var _DEBUG = true;

var lstDevices = [];


var dispositivos = [];
var relays = [];

var ANALOG_ON = 255;
var ANALOG_OFF = 0;

var DIGITAL_ON = 1;
var DIGITAL_OFF = 0;

var ACTIVAR = "Activar";
var DESACTIVAR = "Desactivar";
var CONSULTAR = "Consultar";

var Arduino = require("../util/Arduino.js");
var arduino = new Arduino();

var _dataProvider;


var _srv;



/*
 * DeviceService
 * @constructor
 *
 * @description Inicializa y Configura los servicios que activan y desactivan los Reles
 * @dataProvider proveedor de datos
 * @socket instancia de socket.io para comunicar con servidor de arduinos
 * @logger {object} objeto para registrar logs
 * @callback funcion de retorno
 *
 */
function DeviceService(dataProvider,srv,logger, callback) {
    _srv = srv;
   	this._logger = logger;
   	_dataProvider = dataProvider;
   	TraerDatos(dataProvider, callback);
}

function TraerDatos(dataProvider, cb) {

	dataProvider.Cache(true, function(error, data ) {
				dispositivos = data["Dispositivos"];
				cb(null,data);
			});
}

method.Refrescar = function(dataProvider, callback) {
	TraerDatos(dataProvider, callback);
};

method.Activar = function(idDevice, idRelay, callback) {
 	LlamarServicio(idDevice, idRelay, ACTIVAR, callback);
};

method.Desactivar = function(idDevice, idRelay, callback) {
 	LlamarServicio(idDevice, idRelay, DESACTIVAR, callback);
};

method.Ip = function(idDevice, callback)
{
  	LlamarServicio(idDevice, "IP", callback);
};

function LlamarServicio(idDevice, accion, callback)
{
	 var deviceEncontrado = false;
	  		async.each(dispositivos, function(result, callb) {
			  	if (result.IdDispositivo == idDevice)
			  	{
			  		deviceEncontrado = true;
			  		if (result.Habilitado) {
			  			
			  			dataProvider.Device().Save(id, nombre, tipo, ip,puerto,habilitado,estado,frecuencia);
			  			var deviceModel = new Models();
			            deviceModel.Crear(result.Id,
			            				  result.Nombre,
			            				  result.Tipo,
			            				  result.Ip,
			            				  result.Puerto,
			            				  result.Habilitado,
			            				  result.Estado,
			            				  result.FrecuenciaMuestreo
			            				  );
			            				  
			  			var params;
			  			var pBoard = arduino.Dispositivos("Board");
			  			var topic = arduino.Dispositivos("Board") + result.IdDispositivo + "/status";

						if (accion == "IP") {
							_srv.Leer(topic, function(error, data) {
				  			 		if (error)
				  			 			return callback(error, null);
				  			 		
				  			 		if (_DEBUG)
				  			 			console.dir("DeviceService.LlamarServicio -> Valor retornado por metodo Leer: " + data);
				  			 		return callback(null, relayModel.Objeto());
				  			 	});
						}
			  			
			  			 	
			  			 	
					}
					else {
						console.log("DeviceService.LlamarServicio : Intento de trabajar con relay deshabilitado");
						return callback(new Error("DeviceService.LlamarServicio : Intento de trabajar con relay deshabilitado", null));
					}
			  	} 
			  	
			  }, function(error) { if (error) { 
			  		console.log("DeviceService.LlamarServicio.LecturaAsyncRelays : error : " + error);
			  		return callback(error, null);
			  		}	
			  	 });
	  		
	  			//Reviso si se encontro el relay luego del loop
			  	if (!deviceEncontrado)
			  	{
			  		console.log("DeviceService.LlamarServicio : Parametros idDispositivo no encontrados en BD");
			  		return callback("DeviceService.LlamarServicio : Parametros idDispositivo no encontrados en BD", null);
			  	}
	  
}


module.exports = DeviceService;