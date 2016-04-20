/*
 * MonitorSalud
 * https://github.com/Botanicbot/App/lib/MonitorSalud.js
 * 
 * 2015 Diego Navarro M
 *
 */


var method = MonitorSalud.prototype;
var later = require('later'); // gestion de tareas

//var SensorProvider = require('./dao/SensorProvider.js');
var sensorProvider;

var BombaProvider = require('./dao/BombaProvider.js');
var bombaProvider;

//var DeviceProvider = require('./dao/DeviceProvider.js');
var deviceProvider;


var _logger;
var _mailer;
var _twitter;
var _moment;

var _config;

var _intervaloMedicion;
var _configMonitoreo;
var _monitoreoHabilitado;

var SensorService;// = require("./servicios/SensorService.js");
var sensorsvc;

var BombaService;// = require("./servicios/BombaService.js");
var bombasvc;

var _dataProvider;
var _sensorProvider;


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
function MonitorSalud(config, logger, mailer, moment, tweet, dataProvider, serviceProvider) {
   
	 this._logger = logger;
	 this._mailer = mailer;
	 this._twitter = tweet;
     this._moment = moment;
     this._config = config;

	 later.date.localTime();

   //Obtengo datos desde archivo de configuracion
   this._intervaloMedicion = parseInt(config.monitor_intervalo);
   this._monitoreoHabilitado = config.monitor_habilitado;

   console.log("MonitorSalud: Monitoreo Habilitado .. " + this._monitoreoHabilitado);
   this._logger.info("MonitorSalud: Monitoreo Habilitado .. " + this._monitoreoHabilitado);

	 console.log("MonitorSalud: Intervalos de medicion .. " + this._intervaloMedicion + " minutos");
	 this._logger.info("MonitorSalud: Intervalos de medicion .. " + this._intervaloMedicion + " minutos");


   sensorProvider = dataProvider.Sensor();
   bombaProvider = dataProvider.Bomba();
   deviceProvider = dataProvider.Device();

  
   
   _dataProvider = dataProvider;
   _serviceProvider = serviceProvider;

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
   
   tMonitoreo = later.setInterval(function() { Monitorear(config,ping,sensor, _dataProvider, _serviceProvider, logger,moment); }, _configMonitoreo);
  }
}

function Monitorear(config, ping,sensor, dataProvider, serviceProvider, logger,moment) {

    
    //Monitoreo Dispositivos

    var async = require('async');

    var isAlive = false;
    
     dataProvider.Device().GetAll(function(err, data) { 
      if (err) {
      	console.log("MonitorSalud.Monitorear() - Error al obtener datos : error : " + err); 
      	return;
      }
      	
      if (data.length > 0) {
         async.each(data, function(item, callback) { 
	      if (item.Habilitado == "true" || item.Habilitado == true) {
	      
	       ping.sys.probe(item.Ip, function(isAlive){
	          var msg = isAlive ? 'Monitoreo - PING: OK - IP: ' + item.Ip : 'Monitoreo - PING: NO OK - IP: ' + item.Ip;
	          console.log(msg);
	          
	          dataProvider.Device().Save(item.Id, 
	          							 item.Nombre, 
	          							 item.Tipo,
	          							 item.Ip, 
	          							 item.Puerto, 
	          							 item.Habilitado, 
	          							 isAlive, 
	          							 item.FrecuenciaMuestreo);
	          //callback();
	       });
	       
	       //Monitoreo de detalle
	       
	       //Monitoreo Sensores
    			 
	 			var filter = {
	 			   IdDispositivo : item.Id
	 			};
	 			  
			     dataProvider.Sensor().GetCollection(filter, function(err, data) { 
				    if (data.length > 0) {
				        
				        async.each(data, function(item, callback) { 
				        
				         if (item.Habilitado == "true" || item.Habilitado == true) {
			           		console.log("Midiendo sensor ID : " + item.IdSensor + 
			           					" Dispositivo: " + item.IdDispositivo + 
			           					" Descripcion : " + item.Descripcion);
			           	 
			           	 	
			           	 	serviceProvider.Sensor().GetTemperatura(item.IdDispositivo, item.IdSensor, function(error, data) {
					            
					            if (error)
					            {
					                logger.error("MonitorSalud.Sensor(): Error al verificar Temperatura, detalle: " + error);
					                console.log("MonitorSalud.Sensor(): Error al verificar Temperatura, detalle: " + error);
					            }
					            else
					            {
					              //TODO: agregar atributo IdTipoActuador en dto Sensor
					              console.log("MonitorSalud.Sensor() : Guardo valor retornado desde arduino data = " + data);
					              dataProvider.Medicion().Save(1, item.IdSensor, item.IdDispositivo, data);
					              
					            }
					          });
			           	 
			           	 }
			           	 });
				        
				      }
				      else
				      {
				      	console.log("No existen sensores habilitados para monitorear");
				      }
				    });
				    
				    
				    //Monitoreo Ventanas (Motores)
				     dataProvider.Motor().GetCollection(filter, function(err, data) { 
				    if (data.length > 0) {
				        
				        async.each(data, function(item, callback) { 
				        
				         if (item.Habilitado == "true" || item.Habilitado == true) {
			           		console.log("Midiendo motor ID : " + item.IdMotor + 
			           					" Dispositivo: " + item.IdDispositivo + 
			           					" Descripcion : " + item.Descripcion);
			           	 
			           	 	
			           	 	serviceProvider.Motor().ReporteMotor(item.IdDispositivo, item.IdMotor, function(error, data) {
					            
					            if (error)
					            {
					                logger.error("MonitorSalud.Motor(): Error al verificar Motor, detalle: " + error);
					                console.log("MonitorSalud.Motor(): Error al verificar Motor, detalle: " + error);
					            }
					            else
					            {
					              //TODO: agregar atributo IdTipoActuador en dto Sensor
					              dataProvider.Motor().Save( 
					              		data.IdMotor
									  , data.IdDispositivo
									  , data.Descripcion
									  , data.MarcaModelo
									  , data.Tipo
									  , data.Pin
									  , data.EsPinAnalogo
									  , data.Habilitado
									  , data.Posicion
									  , data.Accion
									  , data.Estado); //TODO: Revisar por que puede ir undefined
									  
								  dataProvider.Medicion().Save(
								  	3,
								  	data.IdMotor, 
								  	data.IdDispositivo,
								  	data.Posicion
								  );
					              
					            }
					          });
			           	 
			           	 }
			           	 });
				        
				      }
				      else
				      {
				      	console.log("No existen Motores habilitados para monitorear");
				      }
				    });
			   
			   
			   		//Monitoreo Relays (Bombas)
				    dataProvider.Relay().GetCollection(filter, function(err, data) { 
				    if (data.length > 0) {
				        
				        async.each(data, function(item, callback) { 
				        
				         if (item.Habilitado == "true" || item.Habilitado == true) {
			           		console.log("Midiendo Relay ID : " + item.IdRelay + 
			           					" Dispositivo: " + item.IdDispositivo + 
			           					" Descripcion : " + item.Descripcion);
			           	 
			           	 	
			           	 	serviceProvider.Relay().Estado(item.IdDispositivo, item.IdRelay, function(error, data) {
					            
					            if (error)
					            {
					                logger.error("MonitorSalud.Relay(): Error al verificar Estado de Relay, detalle: " + error);
					                console.log("MonitorSalud.Relay(): Error al verificar Estado de Relay, detalle: " + error);
					            }
					            else
					            {
					              //TODO: agregar atributo IdTipoActuador en dto Sensor
					              
					              dataProvider.Relay().Save( 
					              		data.IdRelay
									  , data.IdDispositivo
									  , data.Descripcion
									  , data.MarcaModelo
									  , data.Tipo
									  , data.Pin
									  , data.EsPinAnalogo
									  , data.Habilitado
									  , data.Activo
									  , data.EsInverso);
									  
								  dataProvider.Medicion().Save(
								  	2,
								  	data.IdRelay, 
								  	data.IdDispositivo,
								  	data.Activo
								  );
					              
					            }
					          });
			           	 
			           	 }
			           	 });
				        
				      }
				      else
				      {
				      	console.log("No existen RElays habilitados para monitorear");
				      }
				    });
	       
	       
	     }
	    }, function(err) {
	      console.log("Monitoreo Dispositivos Finalizado");
	    });   
      }
      else
      {
      	console.log("No existen dispositivos habilitados para monitorear");
      }
    });
    
    
    
   
}



 //Monitoreo Estado Bomba:
/*
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
                 bombaProvider.Save(item.id, data.Valor, 0,0);              }
              
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


callback();


    }, function(err) {
      console.log("Monitoreo Actuadores Finalizado");
    });


   
*/

module.exports = MonitorSalud;