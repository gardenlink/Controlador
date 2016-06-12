
 /* RelayService
 * https://github.com/GardenLink
 * 
 * 2015 Diego Navarro M
 *
 */


var method = RelayService.prototype;


var _logger;
var debugMode = true;

var async = require("async");

var ArestLibrary = require("./Arest.js");
var arduinoService; 

var ModelsDispositivo = require("../dto/Dispositivo.js");
var Models = require("../dto/Relay.js");

var _DEBUG = true;


var lstRelays = [];
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

var ARDUINO_ENCENDER = "RE";
var ARDUINO_APAGAR = "RA";
var ARDUINO_CONSULTAR = "RC";
var ARDUINO_ESCAPE = "X";

var _socket;



/*
 * RelayService
 * @constructor
 *
 * @description Inicializa y Configura los servicios que activan y desactivan los Reles
 * @webDuinoHost url configurado para webduino
 * @webDuinoPort {Number} puerto configurado para webduino
 * @logger {object} objeto para registrar logs
 *
 */
function RelayService(dataProvider,socket,logger, callback) {
    _socket = socket;
   	this._logger = logger;
   	TraerDatos(dataProvider, callback);

}

function TraerDatos(dataProvider, cb) {

	dataProvider.Cache(true, function(error, data ) {
				dispositivos = data["Dispositivos"];
				relays = data["Relays"];
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

method.Estado = function(idDevice, idRelay, callback)
{
  	LlamarServicio(idDevice, idRelay, CONSULTAR, callback);
};

function LlamarServicio(idDevice, idRelay, accion, callback)
{
	 if (_DEBUG)
	 	console.log("RelayService.LlamarServicio : PARAMS : " + idDevice + idRelay + accion);
	 	
	 
	  	
	  		async.each(relays, function(result, callb) {
			  	if (result.IdDispositivo == idDevice && result.IdRelay == idRelay)
			  	{
			  		if (result.Habilitado) {
			  			
			  			var relayModel = new Models();
			            relayModel.Crear(result.IdRelay,
		            				  result.IdDispositivo, 
		            				  result.Descripcion, 
		            				  result.MarcaModelo, 
		            				  result.Tipo, 
		            				  result.Pin,
		            				  result.EsPinAnalogo,
		            				  result.Habilitado,
		            				  result.Activo,
		            				  result.EsInverso);
			  			
			  			var params;
			  			
			  			switch(accion)
			  			{
			  				case ACTIVAR:
			  					params = ARDUINO_ENCENDER + idRelay + result.Pin + ARDUINO_ESCAPE;
			  					break;
			  					
			  				case DESACTIVAR:
			  					params = ARDUINO_APAGAR + idRelay + result.Pin + ARDUINO_ESCAPE;
			  					break;
			  					
			  				case CONSULTAR:
			  					params = ARDUINO_CONSULTAR + idRelay + result.Pin + ARDUINO_ESCAPE;
			  					break;
			  			}
	 						
			  			
			  			console.log("Relay.LlamarServicio - Params: " + params);
			  			
			  			 
			  			 	
					     	_socket.emit('servicemessage', params);
					     	
					     	_socket.on('webclient-response', function (data) { 
							    console.log("webclient-response :" + data);
			  					
			  					 relayModel.Modificar(data.IdRelay,
			            				  data.IdDispositivo, 
			            				  data.Descripcion, 
			            				  data.MarcaModelo, 
			            				  data.Tipo, 
			            				  data.Pin,
			            				  data.EsPinAnalogo,
			            				  data.Habilitado,
			            				  data.Activo,
			            				  data.EsInverso);
			            				  
			            		return callback(null, relayModel.Objeto());
							    
							});
					     
			  			
			  			
			  			
					}
					else {
						console.log("RelayService.LlamarServicio : Intento de trabajar con relay deshabilitado");
						return callback(new Error("RelayService.LlamarServicio : Intento de trabajar con relay deshabilitado", null));
					}
			  	}
			  	
			  }, function(error) { if (error) console.log("RelayService.LlamarServicio.LecturaAsyncRelays : error : " + error) });
	  		
	  
}





module.exports = RelayService;