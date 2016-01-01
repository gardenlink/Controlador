/*
 * MonitorSalud
 * https://github.com/Botanicbot/App/lib/MonitorSalud.js
 * 
 * 2015 Diego Navarro M
 *
 */


var method = DbSync.prototype;
var later = require('later'); // gestion de tareas

var _logger;
var _mailer;
var _moment;

var _dataProvider;





 
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
function DbSync(dataProvider, logger, mailer, moment) {
   
	 this._logger = logger;
	 this._mailer = mailer;
   this._moment = moment;

	 later.date.localTime();

   //this._intervaloMedicion = parseInt(config.monitor_intervalo);

   console.log("Configurando sincronizador de base de datos:  .. ");
   this._logger.info("Configurando sincronizador de base de datos:  .. ");
    var config = dataProvider.GetConfig();

    for (var conf in config) {
      console.log(conf + " Sincronizacion : " + config[conf].Sincronizacion 
                       + " -> Master : " + config[conf].Master
                       + " -> Intervalo Sincronizacion : " + config[conf].Intervalo + " minutos");
    }

   //Proveedor de datos
   _dataProvider = dataProvider;

}


method.ListarEncendidasProgramadas = function() {
	return _prendidas;
};

method.ListarApagadasProgramadas = function() {
	return this._apagadas;
};

method.Iniciar = function() {
 
 var _configMonitoreo = {
   Provider : String,
   laterConfig : Object,
   laterObject : Object
 }


 var config = _dataProvider.GetConfig();
 for (var conf in config) {
    if (config[conf].Sincronizacion == "true")
    {
      _configMonitoreo.Provider = config;
      _configMonitoreo.laterConfig = later.parse.recur().every(parseInt(config[conf].Intervalo)).minute();
      _configMonitoreo.laterObject = later.setInterval(function() { Monitorear(config, this._dataProvider,  this._logger, this._moment); }, _configMonitoreo.laterConfig);
      break;
    }
 }

/*
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
  */
}

function Monitorear(config, dataProvider, logger,moment) {
  console.log("Inicio Sincronizacion de bases de datos");

  foreach

}


module.exports = DbSync;