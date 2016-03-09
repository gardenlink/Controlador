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
   Motor : require('./MotorService.js')
 }

 var Servicios = {
    Sensor : Object,
    Bomba : Object,
    Motor : Object
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


 
/*
 * ServiceProvider
 * @constructor
 *
 * @description Inicializa y Configura los servicios que manejan los sensores
 * @dispositivos url configurado para webduino
 * @logger {object} objeto para registrar logs
 *
 */

function ServiceProvider(dataProvider,logger) {
   
   
   Servicios.Sensor = new Librerias.Sensor(dataProvider, logger, function(err, data){
		console.log("ServiceProvider.Constructor -> Sensor Inicializado ");
	});
	
   Servicios.Motor = new Librerias.Motor(dataProvider, logger, function(err, data) {
   		console.log("ServiceProvider.Constructor -> Motor Inicializado ");
   });
	
	//Tarea recurrente para refrescar informacion sobre servicios desde base de datos, cada un minuto
	var sched = _later.parse.recur().every(1).minute(),
    t = _later.setInterval(function() { RefrescarDatos(dataProvider, logger)}, sched);
    console.log("ServiceProvider.Constructor -> Refresco de datos cada 1 minuto ");
}


function RefrescarDatos(dataProvider, logger) {
	
	Servicios.Sensor.Refrescar(dataProvider, function(error, data) {
		console.log("Fin Refresco Datos Sensor");
	});
	
	Servicios.Motor.Refrescar(dataProvider, function(error, data) {
		console.log("Fin Refresco datos Motor");
	})
}

method.Sensor = function(){
  return Servicios.Sensor;
}

method.Motor = function() {
	return Servicios.Motor;
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
      console.log("dispositivo no encontrado");

    return found;
    
}


module.exports = ServiceProvider;