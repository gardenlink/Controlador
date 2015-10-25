/*
 * MonitorSalud
 * https://github.com/Botanicbot/App/lib/MonitorSalud.js
 * 
 * 2015 Diego Navarro M
 *
 */


var method = MonitorSalud.prototype;
var later = require('later'); // gestion de tareas

var SensorProvider = require('./dao/SensorProvider.js');
var sensorProvider;

var BombaProvider = require('./dao/BombaProvider.js');
var bombaProvider;

var DeviceProvider = require('./dao/DeviceProvider.js');
var deviceProvider;


var _logger;
var _mailer;
var _twitter;
var _moment;

var _config;

var _intervaloMedicion;
var _configMonitoreo;
var _monitoreoHabilitado;

var SensorService = require("./servicios/SensorService.js");
var sensorsvc;

var BombaService = require("./servicios/BombaService.js");
var bombasvc;

//var req = require('restler');
 
/*
 * Temporizador
 * @constructor
 *
 * @description Inicializa y Configura el programador
 * @apiParam {Number} horarios durante un dia determinado
 * @apiParam {Number} duracion cantidad minutos que durará la tarea
 * @apiParam {Number} numeroDias cantidad de dias que se programará la tarea.
 *
 */
function MonitorSalud(config, logger, mailer, moment, tweet, dispositivos) {
   
	 this._logger = logger;
	 this._mailer = mailer;
	 this._twitter = tweet;
   this._moment = moment;
   this._config = config;

	 later.date.localTime();

   this._intervaloMedicion = parseInt(config.monitor_intervalo);

   this._monitoreoHabilitado = config.monitor_habilitado;

   console.log("MonitorSalud: Monitoreo Habilitado .. " + this._monitoreoHabilitado);
   this._logger.info("MonitorSalud: Monitoreo Habilitado .. " + this._monitoreoHabilitado);

	 console.log("MonitorSalud: Intervalos de medicion .. " + this._intervaloMedicion + " minutos");
	 this._logger.info("MonitorSalud: Intervalos de medicion .. " + this._intervaloMedicion + " minutos");

   sensorProvider = new SensorProvider(this._logger, null, config);
   bombaProvider = new BombaProvider(this._logger, null, config);
   deviceProvider = new DeviceProvider(this._logger, null, config);

   //Llamadas a la API de servicios de Sensores
   sensorsvc = new SensorService(dispositivos,logger);
   bombasvc = new BombaService(dispositivos, logger);


}


method.ListarEncendidasProgramadas = function() {
	return _prendidas;
};

method.ListarApagadasProgramadas = function() {
	return this._apagadas;
};

method.Iniciar = function() {
 
 if (this._monitoreoHabilitado == "true" || this._monitoreoHabilitado == true)
 {
   var _configMonitoreo = later.parse.recur().every(this._intervaloMedicion).minute();
    
   var logger = this._logger;
   var mailer = this._mailer;
   var twitter = this._twitter;
   var moment = this._moment;
   var config = this._config;
   var sensor = 5;

   var ping = require('ping');
   
   tMonitoreo = later.setInterval(function() { Monitorear(config,ping,sensor, sensorsvc, bombasvc, logger,moment); }, _configMonitoreo);
  }
}

function Monitorear(config, ping,sensor, sensorsvc, bombasvc, logger,moment) {

    //var datos = [];

    var async = require('async');

    var isAlive = false;
    async.each(config.dispositivos, function(item, callback) { 
      if (item.habilitado == "true") {
      
       ping.sys.probe(item.ip, function(isAlive){
          var msg = isAlive ? 'PING: OK - IP: ' + item.ip : 'PING: NO OK - IP: ' + item.ip;
          console.log(msg);
          deviceProvider.Save(item.id, item.nombre, item.tipo, item.ip, item.puerto, item.habilitado, isAlive);
          callback();
       });
     }
    }, function(err) {
      console.log("Monitoreo Dispositivos Finalizado");
    });


   

    //Monitoreo Estado Bomba:

    async.each(config.actuadores, function(item, callback) { 

        if (item.tipo == "relay" && item.habilitado == "true") {
           console.log("Midiendo actuador ID : " + item.id + " Desc : " + item.descripcion);

           bombasvc.GetEstadoBomba(item.id, function(data) {
            if (data instanceof Error)
            {
                logger.error("Monitor Bomba: Error al verificar estado bomba, detalle: " + data);
                console.log("Monitor Humedad: Error al medir humedad, detalle: " + data);
            }
            else
            {
              if (data.Encendida)
              {
                  bombaProvider.GetLast({Id : item.id}, function(error, objBomba) {

                    var TiempoInicial = moment(objBomba.TiempoInicial);
                    
                    bombaProvider.Save(item.id, data.Valor,TiempoInicial.fromNow(true),TiempoInicial);

                });

              }
              else
              {
                 bombaProvider.Save(item.id, data.Valor, 0,0);
              }
              
            }
          });

        }


         if (item.tipo == "dht11" && item.habilitado == "true") {

        console.log("Midiendo sensor " + item.descripcion);
        //Monitoreo Humedad:
         sensorsvc.GetHumedad(item.pin, function(data) {
           if (data instanceof Error)
            {
              logger.error("Monitor Humedad: Error al medir humedad, detalle: " + data);
              console.log("Monitor Humedad: Error al medir humedad, detalle: " + data);
            }
            else
            {
              //almacenar en BD
              sensorProvider.Save(item.id, data.Valor);
            }
            
        });

         //Monitoreo Temperatura:
          console.log("Midiendo Temperatura");
          sensorsvc.GetTemperatura(item.pin, function(data) {
             if (data instanceof Error)
              {
                logger.error("Monitor Temperatura: Error al medir temperatura, detalle: " + data);
                console.log("Monitor Temperatura: Error al medir temperatura, detalle: " + data);
              }
              else
              {
                //almacenar en BD
                if (data)
                {
                  sensorProvider.Save(item.id, data.Valor);
                }
                else
                {
                  logger.error("Monitor Temperatura: El campo valor venia null, no se guarda");
                }
              }
              
          });

      }

      if (item.tipo == "dht11" && item.habilitado == "true") {

        console.log("Midiendo sensor " + item.descripcion);
        //Monitoreo Humedad:
         sensorsvc.GetHumedad(item.pin, function(data) {
           if (data instanceof Error)
            {
              logger.error("Monitor Humedad: Error al medir humedad, detalle: " + data);
              console.log("Monitor Humedad: Error al medir humedad, detalle: " + data);
            }
            else
            {
              //almacenar en BD
              sensorProvider.Save(item.id, data.Valor);
            }
            
        });

         //Monitoreo Temperatura:
          console.log("Midiendo Temperatura");
          sensorsvc.GetTemperatura(item.pin, function(data) {
             if (data instanceof Error)
              {
                logger.error("Monitor Temperatura: Error al medir temperatura, detalle: " + data);
                console.log("Monitor Temperatura: Error al medir temperatura, detalle: " + data);
              }
              else
              {
                //almacenar en BD
                if (data)
                {
                  sensorProvider.Save(item.id, data.Valor);
                }
                else
                {
                  logger.error("Monitor Temperatura: El campo valor venia null, no se guarda");
                }
              }
              
          });

      }

       if (item.tipo == "sensor" && item.habilitado == "true") {
          console.log("culito");
          
       }

callback();


    }, function(err) {
      console.log("Monitoreo Actuadores Finalizado");
    });


/*
     for (c in config.actuadores) {
      if (config.actuadores[c].tipo == "relay" && config.actuadores[c].habilitado == "true") {
          console.log("Midiendo actuador ID : " + config.actuadores[c].id + " Desc : " + config.actuadores[c].descripcion);
          //bombasvc.DesactivarBomba(config.actuadores[c].id, function(data) {});

           bombasvc.GetEstadoBomba(config.actuadores[c].id, function(data) {
            if (data instanceof Error)
            {
                logger.error("Monitor Bomba: Error al verificar estado bomba, detalle: " + data);
                console.log("Monitor Humedad: Error al medir humedad, detalle: " + data);
            }
            else
            {
              if (data.Encendida)
              {
                  bombaProvider.GetLast({Id : config.actuadores[c].id}, function(error, objBomba) {

                    var TiempoInicial = moment(objBomba.TiempoInicial);
                    
                    bombaProvider.Save(config.actuadores[c].id, data.Valor,TiempoInicial.fromNow(true),TiempoInicial);

                });

              }
              else
              {
                 bombaProvider.Save(config.actuadores[c].id, data.Valor, 0,0);
              }
              
            }
          });

      }

       if (item.tipo == "dht11" && item.habilitado == "true") {

        console.log("Midiendo sensor " + item.descripcion);
        //Monitoreo Humedad:
         sensorsvc.GetHumedad(item.pin, function(data) {
           if (data instanceof Error)
            {
              logger.error("Monitor Humedad: Error al medir humedad, detalle: " + data);
              console.log("Monitor Humedad: Error al medir humedad, detalle: " + data);
            }
            else
            {
              //almacenar en BD
              sensorProvider.Save(item.id, data.Valor);
            }
        });

         //Monitoreo Temperatura:
          console.log("Midiendo Temperatura");
          sensorsvc.GetTemperatura(item.pin, function(data) {
             if (data instanceof Error)
              {
                logger.error("Monitor Temperatura: Error al medir temperatura, detalle: " + data);
                console.log("Monitor Temperatura: Error al medir temperatura, detalle: " + data);
              }
              else
              {
                //almacenar en BD
                if (data)
                {
                  sensorProvider.Save(item.id, data.Valor);
                }
                else
                {
                  logger.error("Monitor Temperatura: El campo valor venia null, no se guarda");
                }
              }
          });

      }

      if (item.tipo == "dht11" && item.habilitado == "true") {

        console.log("Midiendo sensor " + item.descripcion);
        //Monitoreo Humedad:
         sensorsvc.GetHumedad(item.pin, function(data) {
           if (data instanceof Error)
            {
              logger.error("Monitor Humedad: Error al medir humedad, detalle: " + data);
              console.log("Monitor Humedad: Error al medir humedad, detalle: " + data);
            }
            else
            {
              //almacenar en BD
              sensorProvider.Save(item.id, data.Valor);
            }
        });

         //Monitoreo Temperatura:
          console.log("Midiendo Temperatura");
          sensorsvc.GetTemperatura(item.pin, function(data) {
             if (data instanceof Error)
              {
                logger.error("Monitor Temperatura: Error al medir temperatura, detalle: " + data);
                console.log("Monitor Temperatura: Error al medir temperatura, detalle: " + data);
              }
              else
              {
                //almacenar en BD
                if (data)
                {
                  sensorProvider.Save(item.id, data.Valor);
                }
                else
                {
                  logger.error("Monitor Temperatura: El campo valor venia null, no se guarda");
                }
              }
          });

      }

       if (item.tipo == "sensor" && item.habilitado == "true") {
          console.log("culito");
       }

    }
*/

   

}


module.exports = MonitorSalud;