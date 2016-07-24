/*
 * ServiceProvider
 * https://github.com/Botanicbot/App/lib/servicios/SensorService.js
 * 
 * 2015 Diego Navarro M
 *
 */


var method = ServiceProvider.prototype;


var Librerias = {
   Sensor : require('./SensorService.js'),
   Motor : require('./MotorService.js'),
   Relay : require('./RelayService.js'),
   Dispositivo : require('./DeviceService.js')
 }

 var Servicios = {
    Sensor : Object,
    Relay : Object,
    Motor : Object,
    Dispositivo : Object
 }

 var Dev = {
    id : String,
    Servicios : Object
 }


var _logger;
var _later = require('later'); // gestion de tareas

var debugMode = true;

var srvDispositivos;
var dispositivo;

var _DEBUG = false;

var PonteClient = require('./PonteHttpClient.js');

/*
 * ServiceProvider
 * @constructor
 *
 * @description Inicializa y Configura los servicios que manejan los sensores
 * @dispositivos url configurado para webduino
 * @logger {object} objeto para registrar logs
 *
 */

function ServiceProvider(dataProvider,config,logger,user) {
   
  //var _socket = require('socket.io-client')('http://' + config.socket_server + ':' + config.socket_port);
  var opt = { Debug : true };
  var srv = new PonteClient(config.mqtt.http_server, config.mqtt.http_port, "demo" , opt);
 	
   Servicios.Sensor = new Librerias.Sensor(dataProvider, srv, logger, function(err, data){
   if (err) console.log("ServiceProvider.Constructor.Sensor : error : " + err);
   else
		console.log("ServiceProvider.Constructor -> Sensor Inicializado ");
	});
	
   Servicios.Motor = new Librerias.Motor(dataProvider, srv, logger, function(err, data) {
    if (err) console.log("ServiceProvider.Constructor.Motor : error : " + err);
   		console.log("ServiceProvider.Constructor -> Motor Inicializado ");
   });
   
   Servicios.Relay = new Librerias.Relay(dataProvider, srv, logger, function(err, data) {
    if (err) console.log("ServiceProvider.Constructor.Relay : error : " + err);
   		console.log("ServiceProvider.Constructor -> Relay Inicializado ");
   });
   
   Servicios.Dispositivo = new Librerias.Dispositivo(dataProvider, srv, logger, function(err, data) {
    if (err) console.log("ServiceProvider.Constructor.Dispositivo : error : " + err);
   		console.log("ServiceProvider.Constructor -> Dispositivo Inicializado ");
   });
	
	//Tarea recurrente para refrescar informacion sobre servicios desde base de datos, cada un minuto
	var sched = _later.parse.recur().every(1).minute(),
    t = _later.setInterval(function() { RefrescarDatos(dataProvider, logger)}, sched);
    console.log("ServiceProvider.Constructor -> Refresco de datos cada 1 minuto ");
}


function RefrescarDatos(dataProvider, logger) {
	if (_DEBUG)
		console.log("ServiceProvider.RefrescarDatos : Inicio refresco de datos");
	Servicios.Sensor.Refrescar(dataProvider, function(error, data) {
		if (error)
		{
			console.log("ServiceProvider.RefrescarDatos -> Error al refrescar datos de Sensor. Error: " + error);
		}
		else
		{ 
			if (_DEBUG)
				console.log("ServiceProvider.RefrescarDatos : Fin Refresco Datos Sensor");
		}
	});
	
	Servicios.Motor.Refrescar(dataProvider, function(error, data) {
		if (error)
		{
			console.log("ServiceProvider.RefrescarDatos -> Error al refrescar datos de Motores. Error: " + error);
		}
		else { 
			if (_DEBUG)
				console.log("ServiceProvider.RefrescarDatos : Fin Refresco datos Motor");
			}
	});
	
	Servicios.Relay.Refrescar(dataProvider, function(error, data) {
		if (error)
		{
			console.log("ServiceProvider.RefrescarDatos -> Error al refrescar datos de Relay. Error: " + error);
		}
		else { 
			if (_DEBUG)
				console.log("ServiceProvider.RefrescarDatos : Fin Refresco datos Relay");
			}
	});
	
	Servicios.Dispositivo.Refrescar(dataProvider, function(error, data) {
		if (error)
		{
			console.log("ServiceProvider.RefrescarDatos -> Error al refrescar datos de Relay. Error: " + error);
		}
		else { 
			if (_DEBUG)
				console.log("ServiceProvider.RefrescarDatos : Fin Refresco datos Relay");
			}
	});
}


method.Sensor = function(){
  return Servicios.Sensor;
}

method.Motor = function() {
	return Servicios.Motor;
}

method.Relay = function() {
	return Servicios.Relay;
}

method.Dispositivo = function() {
	return Servicios.Dispositivo;
}



function BuscarDispositivo(idDispositivo)
{
    var found = null;
    for (var d in this.srvDispositivos)
    { 
        if (idDispositivo == this.srvDispositivos[d].id)
        {
          found = this.srvDispositivos[d];
        }
    }

    if (!found)
      console.log("ServiceProvider.BuscarDispositivo : dispositivo no encontrado");

    return found;
    
}


module.exports = ServiceProvider;