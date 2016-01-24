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
   Bomba : require('./BombaService.js'),
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

function ServiceProvider(dispositivos,logger) {
   if (!dispositivos)
    throw new Error("El objeto dispositivos no viene inicializado");
   
   srvDispositivos = [];
   console.log("Iniciando Service Provider... dispositivos : " + Object.keys(dispositivos).length);
   this._logger = logger;
  dispositivo = null;
  for(var dev in dispositivos)
  {
    console.log(dispositivos[dev].Habilitado);
      if (dispositivos[dev].Habilitado == "true" || dispositivos[dev].Habilitado == "TRUE")
      {
        Servicios.Sensor = new Librerias.Sensor(dispositivos[dev], null);
        Servicios.Bomba = new Librerias.Bomba(dispositivos[dev], null);
        Servicios.Motor = new Librerias.Motor(dispositivos[dev], null);
        Dev.id = dispositivos[dev].id;
        Dev.Servicios = Servicios;
        this.srvDispositivos.push(Dev);
      }
      else
      {
        console.log("El dispositivo configurado con ID : " + dispositivos[dev].id + " esta deshabilitado por config");
      }
  }

}


method.Bomba = function(idDispositivo){
  return BuscarDispositivo(idDispositivo).Servicios.Bomba;
}

method.Sensor = function(idDispositivo){
  return BuscarDispositivo(idDispositivo).Servicios.Sensor;
}

method.Motor = function(idDispositivo){
  return BuscarDispositivo(idDispositivo).Servicios.Motor;
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